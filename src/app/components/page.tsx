import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpDown, Crown, PanelTop, RotateCcw } from "lucide-react";

import { BrowseRail } from "@/components/browse-rail";
import { ComponentCardList } from "@/components/component-card-list";
import { EmptyState } from "@/components/empty-state";
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { type AppLocale } from "@/i18n/config";
import { getI18n, translateCategory } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { CategoryIcon } from "@/lib/category-icons";
import { createPageMetadata, getAbsoluteLocaleUrl } from "@/lib/seo";
import { normalizeSearchQuery } from "@/lib/search";
import {
  listBrowseRailCategories,
  listPublicComponents,
} from "@/lib/server/component-service";
import {
  buildBreadcrumbListJsonLd,
  buildCollectionPageJsonLd,
  serializeJsonLd,
} from "@/lib/structured-data";
import { cn } from "@/lib/utils";
import { getViewer } from "@/lib/viewer";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  access?: string;
  sort?: string;
  page?: string;
}>;

const COMPONENTS_PAGE_SIZE = 25;

function parsePageParam(pageValue: string | undefined) {
  if (!pageValue) {
    return 1;
  }

  const parsed = Number.parseInt(pageValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getPaginationTokens(currentPage: number, totalPages: number) {
  const tokens: Array<number | "ellipsis-left" | "ellipsis-right"> = [];

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) {
      tokens.push(page);
    }
    return tokens;
  }

  tokens.push(1);

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    tokens.push("ellipsis-left");
  }

  for (let page = start; page <= end; page += 1) {
    tokens.push(page);
  }

  if (end < totalPages - 1) {
    tokens.push("ellipsis-right");
  }

  tokens.push(totalPages);

  return tokens;
}

function toCategoryLabel(slug: string | undefined) {
  return slug ? slug.replaceAll("-", " ") : null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { locale, messages } = await getI18n();
  const params = await searchParams;
  const normalizedQuery = normalizeSearchQuery(params.q);
  const currentAccess: "free" | "premium" | undefined =
    params.access === "premium"
      ? "premium"
      : params.access === "free"
        ? "free"
        : undefined;
  const currentSort = params.sort === "newest" ? "newest" : "top";
  const currentPage = parsePageParam(params.page);
  const categorySlug = params.category?.trim();
  const categoryLabel = toCategoryLabel(categorySlug);

  const hasSearchQuery = Boolean(normalizedQuery);
  const metadataPath = hasSearchQuery
    ? "/components"
    : buildComponentsPath({
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

function buildComponentsPath(params: {
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

function buildComponentsHref(
  locale: AppLocale,
  params: {
    q?: string;
    category?: string;
    access?: "free" | "premium";
    sort?: "top" | "newest";
    page?: number;
  }
) {
  return withLocalePath(locale, buildComponentsPath(params));
}

export default async function ComponentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { locale, messages } = await getI18n();
  const params = await searchParams;
  const normalizedQuery = normalizeSearchQuery(params.q);
  const requestedPage = parsePageParam(params.page);
  const viewer = await getViewer();
  const [browseRailData, allComponents] = await Promise.all([
    listBrowseRailCategories(),
    listPublicComponents(
      {
        query: normalizedQuery,
        categorySlug: params.category,
        accessType:
          params.access === "premium"
            ? "premium"
            : params.access === "free"
              ? "free"
              : undefined,
        sort: params.sort === "newest" ? "newest" : "top",
      },
      viewer?.id
    ),
  ]);
  const totalCount = allComponents.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / COMPONENTS_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const components = allComponents.slice(
    (currentPage - 1) * COMPONENTS_PAGE_SIZE,
    currentPage * COMPONENTS_PAGE_SIZE
  );
  const currentAccess: "free" | "premium" | undefined =
    params.access === "premium"
      ? "premium"
      : params.access === "free"
        ? "free"
        : undefined;
  const currentSort = params.sort === "newest" ? "newest" : "top";
  const listingBaseParams = {
    q: normalizedQuery || undefined,
    category: params.category || undefined,
    access: currentAccess,
    sort: currentSort as "top" | "newest",
  };
  const activeCategory = browseRailData.categories.find(
    (category) => category.slug === params.category
  );
  const premiumFilterHref = buildComponentsHref(locale, {
    ...listingBaseParams,
    access: "premium",
  });
  const newestSortHref = buildComponentsHref(locale, {
    ...listingBaseParams,
    sort: "newest",
  });
  const topSortHref = buildComponentsHref(locale, {
    ...listingBaseParams,
    sort: "top",
  });
  const hasFilters =
    Boolean(normalizedQuery) ||
    Boolean(params.category) ||
    params.access === "premium" ||
    params.access === "free" ||
    params.sort === "newest";
  const listingPath = buildComponentsPath({
    category: params.category || undefined,
    access: currentAccess,
    sort: currentSort,
    page: currentPage,
    q: normalizedQuery || undefined,
  });
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(locale, [
    { name: "CopyMyUI", path: "/" },
    { name: messages.explorePage.title, path: listingPath },
  ]);
  const collectionJsonLd = buildCollectionPageJsonLd({
    locale,
    path: listingPath,
    name: messages.explorePage.title,
    description: messages.explorePage.description,
    itemUrls: components
      .slice(0, 12)
      .map((component) => getAbsoluteLocaleUrl(locale, `/components/${component.slug}`)),
  });

  return (
    <main className="mx-auto w-full max-w-[1500px] px-2 py-6 sm:px-3 lg:px-4">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([breadcrumbJsonLd, collectionJsonLd]),
        }}
      />
      <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <BrowseRail
          locale={locale}
          messages={messages}
          categories={browseRailData.categories}
          totalPublicComponents={browseRailData.totalPublicComponents}
          viewer={viewer}
          currentQuery={normalizedQuery}
          currentSort={currentSort}
          currentAccess={currentAccess}
          activeCategorySlug={params.category ?? null}
          categoryLinkMode="filters"
        />

        <div className="min-w-0">
          <section className="rounded-[1.8rem] border border-black/6 bg-white/90 p-4 shadow-[0_24px_70px_-52px_rgba(22,18,12,0.38)] backdrop-blur sm:rounded-[2rem] sm:p-5">
            <SeoBreadcrumbs
              items={[
                { label: "CopyMyUI", href: withLocalePath(locale, "/") },
                { label: messages.explorePage.title },
              ]}
            />
            <div className="max-w-3xl">
              <h1 className="inline-flex items-center gap-2.5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                <PanelTop className="size-6 text-muted-foreground sm:size-7" />
                {messages.explorePage.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                {messages.explorePage.description}
              </p>
            </div>

            <div className="mt-4 space-y-3 border-t border-black/6 pt-4">
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 [&::-webkit-scrollbar]:hidden">
                <Link
                  href={premiumFilterHref}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "shrink-0 rounded-full",
                    currentAccess === "premium"
                      ? "border-black/14 bg-[rgba(252,251,247,0.96)] text-foreground"
                      : ""
                  )}
                >
                  <Crown className="size-4" />
                  {messages.detailPage.premiumBadge}
                </Link>
                <Link
                  href={topSortHref}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "shrink-0 rounded-full",
                    currentSort === "top"
                      ? "border-black/14 bg-[rgba(252,251,247,0.96)] text-foreground"
                      : ""
                  )}
                >
                  <ArrowUpDown className="size-4" />
                  {messages.explorePage.topRated}
                </Link>
                <Link
                  href={newestSortHref}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "shrink-0 rounded-full",
                    currentSort === "newest"
                      ? "border-black/14 bg-[rgba(252,251,247,0.96)] text-foreground"
                      : ""
                  )}
                >
                  <ArrowUpDown className="size-4" />
                  {messages.explorePage.newest}
                </Link>
              </div>

              {hasFilters ? (
                <div className="flex flex-wrap gap-2">
                  {normalizedQuery ? (
                    <span className="rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-4 py-2 text-sm text-foreground">
                      {normalizedQuery}
                    </span>
                  ) : null}
                  {activeCategory ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-4 py-2 text-sm text-foreground">
                      <CategoryIcon slug={activeCategory.slug} className="size-4" />
                      {translateCategory(activeCategory, messages, locale).name}
                    </span>
                  ) : null}
                  {params.access === "premium" ? (
                    <span className="rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-4 py-2 text-sm text-foreground">
                      {messages.explorePage.premiumOnly}
                    </span>
                  ) : null}
                  {params.access === "free" ? (
                    <span className="rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-4 py-2 text-sm text-foreground">
                      {messages.explorePage.freeOnly}
                    </span>
                  ) : null}
                  {params.sort === "newest" ? (
                    <span className="rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-4 py-2 text-sm text-foreground">
                      {messages.explorePage.newest}
                    </span>
                  ) : null}
                  {currentPage > 1 ? (
                    <span className="rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-4 py-2 text-sm text-foreground">
                      {messages.categoryPage.paginationPage} {currentPage}
                    </span>
                  ) : null}
                  <Link
                    href={withLocalePath(locale, "/components")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[rgba(252,251,247,0.96)]"
                  >
                    <RotateCcw className="size-3.5" />
                    {messages.explorePage.resetFilters}
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="mt-4 border-t border-black/6 pt-4">
              {components.length > 0 ? (
                <ComponentCardList
                  components={components}
                  className="gap-4 md:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-5"
                />
              ) : (
                <EmptyState
                  eyebrow={messages.explorePage.emptyEyebrow}
                  title={messages.explorePage.emptyTitle}
                  description={messages.explorePage.emptyDescription}
                  actionHref={withLocalePath(locale, "/components")}
                  actionLabel={messages.explorePage.resetFilters}
                />
              )}
            </div>
            {totalCount > 0 ? (
              <div className="mt-5 border-t border-black/8 pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {messages.categoryPage.approvedCount}:{" "}
                    <span className="font-semibold text-foreground">{totalCount}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    {totalPages > 1 ? (
                      <Pagination className="w-auto">
                        <PaginationContent>
                          {currentPage > 1 ? (
                            <PaginationItem>
                              <PaginationPrevious
                                href={buildComponentsHref(locale, {
                                  ...listingBaseParams,
                                  page: currentPage - 1,
                                })}
                                aria-label={messages.categoryPage.paginationPrevious}
                              >
                                {messages.categoryPage.paginationPrevious}
                              </PaginationPrevious>
                            </PaginationItem>
                          ) : null}
                          {getPaginationTokens(currentPage, totalPages).map((token) => {
                            if (typeof token !== "number") {
                              return (
                                <PaginationItem key={token}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }

                            return (
                              <PaginationItem key={token}>
                                <PaginationLink
                                  href={buildComponentsHref(locale, {
                                    ...listingBaseParams,
                                    page: token,
                                  })}
                                  isActive={token === currentPage}
                                  aria-label={`${messages.categoryPage.paginationPage} ${token}`}
                                >
                                  {token}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          {currentPage < totalPages ? (
                            <PaginationItem>
                              <PaginationNext
                                href={buildComponentsHref(locale, {
                                  ...listingBaseParams,
                                  page: currentPage + 1,
                                })}
                                aria-label={messages.categoryPage.paginationNext}
                              >
                                {messages.categoryPage.paginationNext}
                              </PaginationNext>
                            </PaginationItem>
                          ) : null}
                        </PaginationContent>
                      </Pagination>
                    ) : (
                      <span className="rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                        1 / 1
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
