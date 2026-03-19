import { defaultLocale } from "@/i18n/config";
import { getLocaleBaseDomain, getLocaleHostForLocale, isLocalDebugHost } from "@/i18n/routing";

type HeaderReader = {
  get(name: string): string | null;
};

function takeFirstHeaderValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.split(",")[0]?.trim() ?? "";
}

function splitHostAndPort(rawHost: string) {
  const host = rawHost.trim().toLowerCase();

  if (host.startsWith("[")) {
    const endIndex = host.indexOf("]");
    if (endIndex < 0) {
      return { hostname: host, port: "" };
    }

    const hostname = host.slice(0, endIndex + 1);
    const port = host.slice(endIndex + 1).replace(/^:/, "");
    return { hostname, port };
  }

  const parts = host.split(":");
  if (parts.length <= 1) {
    return { hostname: host, port: "" };
  }

  const port = parts.at(-1) ?? "";
  if (!/^\d+$/.test(port)) {
    return { hostname: host, port: "" };
  }

  return {
    hostname: parts.slice(0, -1).join(":"),
    port,
  };
}

function normalizeHost(host: string) {
  return host.trim().toLowerCase();
}

function normalizeProtocol(rawProtocol: string | null, host: string) {
  const firstValue = takeFirstHeaderValue(rawProtocol).toLowerCase();
  const { hostname } = splitHostAndPort(host);

  if (isLocalDebugHost(hostname)) {
    if (firstValue === "http" || firstValue === "https") {
      return firstValue;
    }

    return "http";
  }

  // Public production domains should always be treated as HTTPS even when
  // proxy-to-app hop is internal HTTP.
  if (firstValue === "https") {
    return "https";
  }

  if (!isLocalDebugHost(hostname)) {
    return "https";
  }

  return "https";
}

export function getRequestHostFromHeaders(headers: HeaderReader) {
  const forwarded = takeFirstHeaderValue(headers.get("x-forwarded-host"));
  if (forwarded) {
    return normalizeHost(forwarded);
  }

  const host = takeFirstHeaderValue(headers.get("host"));
  return host ? normalizeHost(host) : "";
}

export function getRequestProtocolFromHeaders(headers: HeaderReader, requestHost: string) {
  return normalizeProtocol(headers.get("x-forwarded-proto"), requestHost);
}

export function getRequestOriginFromHeaders(headers: HeaderReader) {
  const requestHost = getRequestHostFromHeaders(headers);
  if (!requestHost) {
    return "";
  }

  const protocol = getRequestProtocolFromHeaders(headers, requestHost);
  return `${protocol}://${requestHost}`;
}

export function getCanonicalAuthHost(requestHost: string) {
  const canonical = getLocaleHostForLocale(defaultLocale, requestHost);
  return canonical ? normalizeHost(canonical) : normalizeHost(requestHost);
}

export function isSameHost(left: string, right: string) {
  return normalizeHost(left) === normalizeHost(right);
}

function isAllowedPublicDomainHost(hostname: string, baseDomain: string) {
  return hostname === baseDomain || hostname.endsWith(`.${baseDomain}`);
}

export function isAllowedAuthReturnUrl(url: URL, requestHost: string) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return false;
  }

  const normalizedRequestHost = normalizeHost(requestHost);
  const { hostname: requestHostname } = splitHostAndPort(normalizedRequestHost);
  const baseDomain = getLocaleBaseDomain(normalizedRequestHost);

  if (baseDomain) {
    if (url.protocol !== "https:") {
      return false;
    }

    return isAllowedPublicDomainHost(url.hostname.toLowerCase(), baseDomain);
  }

  const normalizedUrlHost = normalizeHost(url.host);
  if (isLocalDebugHost(requestHostname)) {
    return normalizedUrlHost === normalizedRequestHost;
  }

  return false;
}

function parseNextCandidate(nextValue: string | null | undefined, requestOrigin: string) {
  if (!nextValue) {
    return null;
  }

  const normalized = nextValue.trim();
  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("/") && !normalized.startsWith("//")) {
    try {
      return new URL(normalized, requestOrigin);
    } catch {
      return null;
    }
  }

  try {
    return new URL(normalized);
  } catch {
    return null;
  }
}

export function resolveAuthReturnUrl(options: {
  explicitNext?: string | null;
  referer?: string | null;
  fallbackPath: string;
  requestHost: string;
  requestOrigin: string;
}) {
  const { explicitNext, referer, fallbackPath, requestHost, requestOrigin } = options;
  const fallback = new URL(fallbackPath, requestOrigin);

  const nextCandidate = parseNextCandidate(explicitNext, requestOrigin);
  if (nextCandidate && isAllowedAuthReturnUrl(nextCandidate, requestHost)) {
    return nextCandidate;
  }

  const refererCandidate = parseNextCandidate(referer, requestOrigin);
  if (refererCandidate && isAllowedAuthReturnUrl(refererCandidate, requestHost)) {
    return refererCandidate;
  }

  return fallback;
}
