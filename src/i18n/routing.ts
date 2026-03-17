import { defaultLocale, locales, type AppLocale } from "@/i18n/config";

const localeSet = new Set<AppLocale>(locales);
const routingModeEnv =
  process.env.NEXT_PUBLIC_LOCALE_ROUTING_MODE ?? process.env.LOCALE_ROUTING_MODE;
const localeBaseDomainEnv =
  process.env.NEXT_PUBLIC_LOCALE_BASE_DOMAIN ?? process.env.LOCALE_BASE_DOMAIN;

export function isLocale(value: string | null | undefined): value is AppLocale {
  return Boolean(value && localeSet.has(value as AppLocale));
}

function normalizeHostname(value: string) {
  return value.trim().toLowerCase();
}

function isIpv4Host(hostname: string) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
}

function splitHostAndPort(host: string) {
  const normalized = normalizeHostname(host);

  if (normalized.startsWith("[")) {
    const endIndex = normalized.indexOf("]");
    if (endIndex < 0) {
      return { hostname: normalized, port: "" };
    }

    const hostname = normalized.slice(0, endIndex + 1);
    const port = normalized.slice(endIndex + 1).replace(/^:/, "");
    return { hostname, port };
  }

  const lastColon = normalized.lastIndexOf(":");
  if (lastColon <= 0 || normalized.includes(":", lastColon + 1)) {
    return { hostname: normalized, port: "" };
  }

  const hostname = normalized.slice(0, lastColon);
  const port = normalized.slice(lastColon + 1);
  return /^\d+$/.test(port) ? { hostname, port } : { hostname: normalized, port: "" };
}

function sanitizeBaseDomain(value: string) {
  const withoutProtocol = value.replace(/^https?:\/\//i, "");
  const withoutPath = withoutProtocol.split("/")[0] ?? "";
  return splitHostAndPort(withoutPath).hostname;
}

export function isLocalDebugHost(hostOrHostname: string) {
  const { hostname } = splitHostAndPort(hostOrHostname);

  return (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".sslip.io") ||
    isIpv4Host(hostname)
  );
}

export function isDomainLocaleRoutingEnabled() {
  if (routingModeEnv === "path") {
    return false;
  }

  if (routingModeEnv === "domain") {
    return true;
  }

  return process.env.NODE_ENV === "production";
}

export function getLocaleFromHostname(hostOrHostname: string) {
  const { hostname } = splitHostAndPort(hostOrHostname);
  const firstLabel = hostname.split(".")[0];
  return isLocale(firstLabel) ? firstLabel : null;
}

function stripLocaleAndWwwFromHostname(hostname: string) {
  const parts = hostname.split(".").filter(Boolean);
  const stripped = [...parts];

  if (stripped[0] === "www") {
    stripped.shift();
  }

  if (isLocale(stripped[0])) {
    stripped.shift();
  }

  return stripped;
}

export function getLocaleBaseDomain(hostOrHostname: string) {
  if (localeBaseDomainEnv) {
    return sanitizeBaseDomain(localeBaseDomainEnv);
  }

  const { hostname } = splitHostAndPort(hostOrHostname);
  if (isLocalDebugHost(hostname)) {
    return null;
  }

  const stripped = stripLocaleAndWwwFromHostname(hostname);
  if (stripped.length < 2) {
    return null;
  }

  return stripped.join(".");
}

export function getLocaleHostForLocale(locale: AppLocale, hostOrHostname: string) {
  const { port } = splitHostAndPort(hostOrHostname);
  const baseDomain = getLocaleBaseDomain(hostOrHostname);

  if (!baseDomain) {
    return null;
  }

  const hostname = locale === defaultLocale ? baseDomain : `${locale}.${baseDomain}`;
  return port ? `${hostname}:${port}` : hostname;
}

export function getLocaleFromPathname(pathname: string) {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : null;
}

export function stripLocaleFromPathname(pathname: string) {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const locale = getLocaleFromPathname(normalizedPathname);

  if (!locale) {
    return normalizedPathname;
  }

  const stripped = normalizedPathname.slice(locale.length + 1);
  return stripped.length > 0 ? stripped : "/";
}

function splitHref(href: string) {
  const hashIndex = href.indexOf("#");
  const hrefWithoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const queryIndex = hrefWithoutHash.indexOf("?");

  return {
    pathname: queryIndex >= 0 ? hrefWithoutHash.slice(0, queryIndex) : hrefWithoutHash,
    query: queryIndex >= 0 ? hrefWithoutHash.slice(queryIndex) : "",
    hash,
  };
}

export function withLocalePath(
  locale: AppLocale,
  href: string,
  options?: { forcePathPrefix?: boolean }
) {
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("/api/")
  ) {
    return href;
  }

  const { pathname, query, hash } = splitHref(href);
  const normalizedPathname =
    pathname.length === 0 ? "/" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  const strippedPathname = stripLocaleFromPathname(normalizedPathname);
  const useDomainRouting = !options?.forcePathPrefix && isDomainLocaleRoutingEnabled();
  const localizedPathname = useDomainRouting
    ? strippedPathname
    : strippedPathname === "/"
      ? `/${locale}`
      : `/${locale}${strippedPathname}`;

  return `${localizedPathname}${query}${hash}`;
}

export function switchLocaleInPath(pathname: string, locale: AppLocale) {
  return withLocalePath(locale, stripLocaleFromPathname(pathname));
}

export function resolveLocaleFromAcceptLanguage(headerValue: string | null | undefined) {
  if (!headerValue) {
    return defaultLocale;
  }

  const tokens = headerValue
    .split(",")
    .map((token) => token.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const token of tokens) {
    if (isLocale(token)) {
      return token;
    }

    const baseLanguage = token.split("-")[0];

    if (isLocale(baseLanguage)) {
      return baseLanguage;
    }
  }

  return defaultLocale;
}
