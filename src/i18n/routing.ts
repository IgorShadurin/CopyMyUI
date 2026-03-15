import { defaultLocale, locales, type AppLocale } from "@/i18n/config";

const localeSet = new Set<AppLocale>(locales);

export function isLocale(value: string | null | undefined): value is AppLocale {
  return Boolean(value && localeSet.has(value as AppLocale));
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

export function withLocalePath(locale: AppLocale, href: string) {
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
  const localizedPathname =
    strippedPathname === "/" ? `/${locale}` : `/${locale}${strippedPathname}`;

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
