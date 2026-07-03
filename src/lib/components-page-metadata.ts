import type { Metadata } from "next";

import type { AppLocale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { createPageMetadata } from "@/lib/seo";
import { normalizeSearchQuery } from "@/lib/search";

export type ComponentsPageSearchParams = {
  q?: string;
  category?: string;
  access?: string;
  sort?: string;
  page?: string;
};

export function isSearchPlaceholderQuery(query: string) {
  const normalized = query.trim().toLowerCase();
  return (
    normalized === "{search_term_string}" ||
    normalized === "%7bsearch_term_string%7d"
  );
}

export function parseComponentsPageParam(pageValue: string | undefined) {
  if (!pageValue) {
    return 1;
  }

  const parsed = Number.parseInt(pageValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function toCategoryLabel(slug: string | undefined) {
  return slug ? slug.replaceAll("-", " ") : null;
}

export function buildComponentsPath(params: {
  q?: string;
  category?: string;
  access?: "free" | "premium";
  sort?: "top" | "newest";
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.access) {
    searchParams.set("access", params.access);
  }

  if (params.sort === "newest") {
    searchParams.set("sort", "newest");
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const query = searchParams.toString();
  return query ? `/components?${query}` : "/components";
}

export function buildComponentsPageMetadata({
  locale,
  messages,
  searchParams,
}: {
  locale: AppLocale;
  messages: Messages;
  searchParams: ComponentsPageSearchParams;
}): Metadata {
  const normalizedQuery = normalizeSearchQuery(searchParams.q);
  const isPlaceholderQuery =
    Boolean(normalizedQuery) && isSearchPlaceholderQuery(normalizedQuery);
  const effectiveQuery = isPlaceholderQuery ? "" : normalizedQuery;
  const currentAccess: "free" | "premium" | undefined =
    searchParams.access === "premium"
      ? "premium"
      : searchParams.access === "free"
        ? "free"
        : undefined;
  const currentSort = searchParams.sort === "newest" ? "newest" : "top";
  const currentPage = parseComponentsPageParam(searchParams.page);
  const categorySlug = searchParams.category?.trim();
  const categoryLabel = toCategoryLabel(categorySlug);

  const hasSearchQuery = Boolean(effectiveQuery);
  const metadataPath = hasSearchQuery
    ? "/components"
    : buildComponentsPath({
        q: effectiveQuery || undefined,
        category: categorySlug || undefined,
        access: currentAccess,
        sort: currentSort,
        page: currentPage,
      });
  const metadataTitleParts = [
    messages.explorePage.title,
    categoryLabel,
    currentAccess === "premium"
      ? messages.explorePage.premiumOnly
      : currentAccess === "free"
        ? messages.explorePage.freeOnly
        : null,
    currentSort === "newest"
      ? messages.explorePage.newest
      : messages.explorePage.topRated,
    currentPage > 1 ? `${messages.categoryPage.paginationPage} ${currentPage}` : null,
  ].filter(Boolean);
  const metadataTitle = metadataTitleParts.join(" · ");
  const metadataDescriptionTraits = [
    categoryLabel,
    currentAccess === "premium"
      ? messages.explorePage.premiumOnly
      : currentAccess === "free"
        ? messages.explorePage.freeOnly
        : null,
    currentSort === "newest"
      ? messages.explorePage.newest
      : messages.explorePage.topRated,
  ].filter(Boolean);
  const metadataDescription =
    metadataDescriptionTraits.length > 0
      ? `${messages.explorePage.description} ${metadataDescriptionTraits.join(" · ")}.`
      : messages.explorePage.description;

  return createPageMetadata({
    locale,
    path: metadataPath,
    title: metadataTitle,
    description: metadataDescription,
    keywords: [
      "SwiftUI component gallery",
      "SwiftUI search",
      "free SwiftUI components",
      "premium SwiftUI components",
      "CopyMyUI components",
    ],
    imagePath: "/seed-screenshots/harbor-metrics-deck-full.jpg",
    noIndex: hasSearchQuery,
  });
}
