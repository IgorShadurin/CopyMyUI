import { handlers } from "@/auth";
import type { NextRequest } from "next/server";
import { isLocalDebugHost } from "@/i18n/routing";

function normalizeForwardedHost(rawHost: string, forwardedProto: string | null) {
  const firstValue = rawHost.split(",")[0]?.trim() ?? rawHost.trim();
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

function withForwardedOrigin(request: NextRequest) {
  const forwardedHostRaw =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (!forwardedHostRaw || !forwardedProto) {
    return request;
  }

  const forwardedHost = normalizeForwardedHost(forwardedHostRaw, forwardedProto);
  if (!forwardedHost) {
    return request;
  }

  const url = request.nextUrl.clone();
  url.host = forwardedHost;
  url.protocol = forwardedProto.endsWith(":") ? forwardedProto : `${forwardedProto}:`;

  if (url.toString() === request.url) {
    return request;
  }

  return new Request(url.toString(), request) as unknown as NextRequest;
}

export async function GET(request: NextRequest) {
  return handlers.GET(withForwardedOrigin(request));
}

export async function POST(request: NextRequest) {
  return handlers.POST(withForwardedOrigin(request));
}
