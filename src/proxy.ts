import { NextResponse, type NextRequest } from "next/server";

import { localeCookieName, localeHeaderName } from "@/i18n/config";
import { getRequestOrigin } from "@/lib/request-origin";
import {
  getLocaleFromPathname,
  isLocale,
  resolveLocaleFromAcceptLanguage,
  stripLocaleFromPathname,
  withLocalePath,
} from "@/i18n/routing";

function preferredLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get(localeCookieName)?.value;

  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  return resolveLocaleFromAcceptLanguage(request.headers.get("accept-language"));
}

export function proxy(request: NextRequest) {
  const locale = preferredLocale(request);
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const localeFromPath = getLocaleFromPathname(pathname);
  const requestOrigin = getRequestOrigin(request);
  const requestLocaleHeader = request.headers.get(localeHeaderName);

  if (!localeFromPath) {
    if (isLocale(requestLocaleHeader)) {
      const response = NextResponse.next();
      response.cookies.set(localeCookieName, requestLocaleHeader, {
        path: "/",
        sameSite: "lax",
      });
      return response;
    }

    const redirectUrl = new URL(withLocalePath(locale, `${pathname}${search}`), requestOrigin);

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(localeCookieName, locale, {
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(localeHeaderName, localeFromPath);

  const rewriteUrl = new URL(stripLocaleFromPathname(pathname), requestOrigin);
  rewriteUrl.search = search;

  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set(localeCookieName, localeFromPath, {
    path: "/",
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
