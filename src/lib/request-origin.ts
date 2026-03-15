import type { NextRequest } from "next/server";

export function getRequestOrigin(request: NextRequest) {
  const host = request.headers.get("host");

  if (!host) {
    return request.nextUrl.origin;
  }

  return `${request.nextUrl.protocol}//${host}`;
}
