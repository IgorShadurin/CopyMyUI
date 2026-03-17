import type { Metadata } from "next";

import { APP_NAME } from "@/lib/constants";
import { getBaseUrl } from "@/lib/env";
import { defaultLocale, locales, type AppLocale } from "@/i18n/config";
import {
  getLocaleHostForLocale,
  isDomainLocaleRoutingEnabled,
  stripLocaleFromPathname,
  withLocalePath,
} from "@/i18n/routing";

// Google doesn't enforce hard character limits for title/description.
// Keep text normalized, but do not hard-truncate metadata values.
function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function absoluteUrl(path: string) {
  return new URL(path, getBaseUrl()).toString();
}

function absoluteLocaleUrl(locale: AppLocale, path: string) {
  const localizedPath = withLocalePath(locale, path);
  const url = new URL(localizedPath, getBaseUrl());

  if (!isDomainLocaleRoutingEnabled()) {
    return url.toString();
  }

  const localizedHost = getLocaleHostForLocale(locale, url.host);
  if (localizedHost) {
    url.host = localizedHost;
  }

  url.pathname = stripLocaleFromPathname(url.pathname);
  return url.toString();
}

function toOpenGraphLocale(locale: AppLocale) {
  switch (locale) {
    case "es":
      return "es_ES";
    case "ru":
      return "ru_RU";
    case "de":
      return "de_DE";
    default:
      return "en_US";
  }
}

export function buildAlternates(locale: AppLocale, path: string): Metadata["alternates"] {
  const languages = Object.fromEntries(
    locales.map((currentLocale) => [currentLocale, absoluteLocaleUrl(currentLocale, path)])
  );

  return {
    canonical: absoluteLocaleUrl(locale, path),
    languages: {
      ...languages,
      "x-default": absoluteLocaleUrl(defaultLocale, path),
    },
  };
}

export function buildRobots(noIndex = false): Metadata["robots"] {
  if (noIndex) {
    return {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        "max-snippet": 0,
        "max-image-preview": "none",
        "max-video-preview": 0,
      },
    };
  }

  return {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  };
}

type CreatePageMetadataInput = {
  locale: AppLocale;
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  imagePath?: string | null;
  noIndex?: boolean;
  type?: "website" | "article" | "profile";
};

export function createPageMetadata({
  locale,
  path,
  title,
  description,
  keywords,
  imagePath,
  noIndex = false,
  type = "website",
}: CreatePageMetadataInput): Metadata {
  const normalizedTitle = normalizeText(title);
  const normalizedDescription = normalizeText(description);
  const url = absoluteLocaleUrl(locale, path);
  const image = imagePath ? absoluteUrl(imagePath) : null;

  return {
    title: normalizedTitle,
    description: normalizedDescription,
    keywords,
    alternates: buildAlternates(locale, path),
    robots: buildRobots(noIndex),
    openGraph: {
      type,
      url,
      siteName: APP_NAME,
      locale: toOpenGraphLocale(locale),
      title: normalizedTitle,
      description: normalizedDescription,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: normalizedTitle,
      description: normalizedDescription,
      images: image ? [image] : undefined,
    },
  };
}
