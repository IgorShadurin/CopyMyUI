import type { AppLocale } from "@/i18n/config";
import { getAbsoluteLocaleUrl } from "@/lib/seo";

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildBreadcrumbListJsonLd(
  locale: AppLocale,
  items: BreadcrumbItem[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getAbsoluteLocaleUrl(locale, item.path),
    })),
  };
}

export function buildCollectionPageJsonLd({
  locale,
  path,
  name,
  description,
  itemUrls,
}: {
  locale: AppLocale;
  path: string;
  name: string;
  description: string;
  itemUrls?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    inLanguage: locale,
    url: getAbsoluteLocaleUrl(locale, path),
    mainEntity: itemUrls?.length
      ? {
          "@type": "ItemList",
          itemListElement: itemUrls.map((url, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url,
          })),
        }
      : undefined,
  };
}

