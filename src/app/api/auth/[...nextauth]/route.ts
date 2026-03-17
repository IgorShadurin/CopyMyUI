import { handlers } from "@/auth";
import type { NextRequest } from "next/server";
import { isLocalDebugHost } from "@/i18n/routing";

function takeFirstHeaderValue(value: string) {
  return value.split(",")[0]?.trim() ?? value.trim();
}

function splitHostAndPort(rawHost: string) {
  if (rawHost.startsWith("[")) {
    const endIndex = rawHost.indexOf("]");
    if (endIndex < 0) {
      return { hostname: rawHost, port: "" };
    }

    const hostname = rawHost.slice(0, endIndex + 1);
    const port = rawHost.slice(endIndex + 1).replace(/^:/, "");
    return { hostname, port };
  }

  const parts = rawHost.split(":");
  if (parts.length <= 1) {
    return { hostname: rawHost, port: "" };
  }

  const port = parts.at(-1) ?? "";
  if (!/^\d+$/.test(port)) {
    return { hostname: rawHost, port: "" };
  }

  return {
    hostname: parts.slice(0, -1).join(":"),
    port,
  };
}

function normalizeForwardedHost(rawHost: string, forwardedProto: string | null) {
  const firstValue = takeFirstHeaderValue(rawHost);
  if (!firstValue) {
    return null;
  }

  if (firstValue.startsWith("[")) {
    const endIndex = firstValue.indexOf("]");
    if (endIndex < 0) {
      return firstValue;
    }

    const hostOnly = firstValue.slice(0, endIndex + 1);
    const port = firstValue.slice(endIndex + 1).replace(/^:/, "");
    if (!port) {
      return hostOnly;
    }

    return isLocalDebugHost(hostOnly) ? firstValue : hostOnly;
  }

  const parts = firstValue.split(":");
  if (parts.length <= 1) {
    return firstValue;
  }

  const port = parts.at(-1) ?? "";
  const hostOnly = parts.slice(0, -1).join(":");

  if (!/^\d+$/.test(port)) {
    return firstValue;
  }

  if (isLocalDebugHost(hostOnly)) {
    return firstValue;
  }

  if ((forwardedProto === "https" && port === "443") || (forwardedProto === "http" && port === "80")) {
    return hostOnly;
  }

  // For public domain hosts, never leak internal app port (e.g. :3999) into OAuth URLs.
  return hostOnly;
}

function normalizeForwardedProto(rawProto: string | null, normalizedHost: string) {
  const firstValue = rawProto ? takeFirstHeaderValue(rawProto).toLowerCase() : null;
  if (firstValue === "http" || firstValue === "https") {
    return firstValue;
  }

  if (!isLocalDebugHost(normalizedHost)) {
    return "https";
  }

  return null;
}

function withForwardedOrigin(request: NextRequest) {
  const forwardedHostSource = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!forwardedHostSource) {
    return request;
  }

  const requestedHost = normalizeForwardedHost(
    forwardedHostSource,
    normalizeForwardedProto(request.headers.get("x-forwarded-proto"), forwardedHostSource)
  );
  if (!requestedHost) {
    return request;
  }

  const forwardedProto = normalizeForwardedProto(request.headers.get("x-forwarded-proto"), requestedHost);
  const forwardedHost = normalizeForwardedHost(forwardedHostSource, forwardedProto);
  if (!forwardedHost) {
    return request;
  }

  const url = request.nextUrl.clone();
  const { hostname, port } = splitHostAndPort(forwardedHost);
  url.hostname = hostname;
  url.port = port;
  if (forwardedProto) {
    url.protocol = `${forwardedProto}:`;
  }

  if (url.toString() === request.url) {
    return request;
  }

  const headers = new Headers(request.headers);
  headers.set("host", forwardedHost);
  headers.set("x-forwarded-host", forwardedHost);

  if (forwardedProto) {
    headers.set("x-forwarded-proto", forwardedProto);
    headers.set("x-forwarded-port", forwardedProto === "https" ? "443" : "80");
  } else {
    headers.delete("x-forwarded-proto");
    headers.delete("x-forwarded-port");
  }

  const normalizedRequest = new Request(url.toString(), request);
  return new Request(normalizedRequest, { headers }) as unknown as NextRequest;
}

export async function GET(request: NextRequest) {
  return handlers.GET(withForwardedOrigin(request));
}

export async function POST(request: NextRequest) {
  return handlers.POST(withForwardedOrigin(request));
}
