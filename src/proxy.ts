import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, localeCookieName, localeHeaderName } from "@/i18n/config";
import {
  getLocaleFromHostname,
  getLocaleFromPathname,
  getLocaleHostForLocale,
  isDomainLocaleRoutingEnabled,
  isLocalDebugHost,
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

function writeLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
  });
}

function getRequestHost(request: NextRequest) {
  return request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
}

function withLocaleHeader(request: NextRequest, locale: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(localeHeaderName, locale);
  return requestHeaders;
}

function shouldUseDomainLocaleRouting(requestHost: string) {
  if (!isDomainLocaleRoutingEnabled()) {
    return false;
  }

  return !isLocalDebugHost(requestHost);
}

export function proxy(request: NextRequest) {
  const requestHost = getRequestHost(request);
  const locale = preferredLocale(request);
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const localeFromPath = getLocaleFromPathname(pathname);
  const requestLocaleHeader = request.headers.get(localeHeaderName);

  if (shouldUseDomainLocaleRouting(requestHost)) {
    const localeFromHost = getLocaleFromHostname(requestHost);

    if (localeFromPath) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = stripLocaleFromPathname(pathname);
      redirectUrl.search = search;

      const localizedHost = getLocaleHostForLocale(localeFromPath, requestHost);
      if (localizedHost) {
        redirectUrl.host = localizedHost;
      }

      const response = NextResponse.redirect(redirectUrl);
      writeLocaleCookie(response, localeFromPath);
      return response;
    }

    const fallbackLocale = localeFromHost ?? locale;

    if (!localeFromHost && fallbackLocale !== defaultLocale) {
      const localizedHost = getLocaleHostForLocale(fallbackLocale, requestHost);
      if (localizedHost) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.host = localizedHost;
        redirectUrl.pathname = stripLocaleFromPathname(pathname);
        redirectUrl.search = search;

        const response = NextResponse.redirect(redirectUrl);
        writeLocaleCookie(response, fallbackLocale);
        return response;
      }
    }

    const requestHeaders = withLocaleHeader(request, fallbackLocale);
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    writeLocaleCookie(response, fallbackLocale);
    return response;
  }

  if (!localeFromPath) {
    if (isLocale(requestLocaleHeader)) {
      const response = NextResponse.next();
      writeLocaleCookie(response, requestLocaleHeader);
      return response;
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = withLocalePath(locale, pathname, { forcePathPrefix: true });
    redirectUrl.search = search;

    const response = NextResponse.redirect(redirectUrl);
    writeLocaleCookie(response, locale);
    return response;
  }

  const requestHeaders = withLocaleHeader(request, localeFromPath);

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = stripLocaleFromPathname(pathname);
  rewriteUrl.search = search;

  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });

  writeLocaleCookie(response, localeFromPath);

  return response;
}

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
