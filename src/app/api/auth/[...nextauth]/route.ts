import { handlers } from "@/auth";
import type { NextRequest } from "next/server";

function withForwardedOrigin(request: NextRequest) {
  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (!forwardedHost || !forwardedProto) {
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
