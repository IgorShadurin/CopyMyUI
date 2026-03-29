import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpDown, Crown } from "lucide-react";

import { BrowseRail } from "@/components/browse-rail";
import { ComponentCardList } from "@/components/component-card-list";
import { EmptyState } from "@/components/empty-state";
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { AppLocale } from "@/i18n/config";
import { getI18n, translateCategory } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { CategoryIcon } from "@/lib/category-icons";
import { createPageMetadata, getAbsoluteLocaleUrl } from "@/lib/seo";
import { listBrowseRailCategories } from "@/lib/server/component-service";
import { getPublicCategoryPageData } from "@/lib/server/category-service";
import {
  buildBreadcrumbListJsonLd,
  buildCollectionPageJsonLd,
  serializeJsonLd,
} from "@/lib/structured-data";
import { getViewer } from "@/lib/viewer";

const CATEGORY_PAGE_SIZE = 15;

function parsePageParam(pageValue: string | undefined) {
  if (!pageValue) {
    return 1;
  }

  const parsed = Number.parseInt(pageValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildCategoryPageHref(locale: AppLocale, slug: string, page: number) {
  if (page <= 1) {
    return withLocalePath(locale, `/categories/${slug}`);
  }

  const searchParams = new URLSearchParams({ page: String(page) });
  return withLocalePath(locale, `/categories/${slug}?${searchParams.toString()}`);
}

function buildCategoryPagePath(slug: string, page: number) {
  if (page <= 1) {
    return `/categories/${slug}`;
  }

  const searchParams = new URLSearchParams({ page: String(page) });
  return `/categories/${slug}?${searchParams.toString()}`;
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

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { locale, messages } = await getI18n();
  const { slug } = await params;
  const query = await searchParams;
  const currentPage = parsePageParam(query.page);
  const categoryPage = await getPublicCategoryPageData(slug, null, {
    page: currentPage,
    pageSize: CATEGORY_PAGE_SIZE,
  });

  if (!categoryPage) {
    return {};
  }

  const category = translateCategory(categoryPage.category, messages, locale);
  const pageSuffix =
    currentPage > 1
      ? ` · ${messages.categoryPage.paginationPage} ${currentPage}`
      : "";

  return createPageMetadata({
    locale,
    path: buildCategoryPagePath(categoryPage.category.slug, currentPage),
    title: `${category.name} · ${messages.explorePage.title}${pageSuffix}`,
    description: `${category.description} ${messages.categoryPage.approvedCount}: ${categoryPage.pagination.totalCount}.`,
    keywords: [
      `${category.name} SwiftUI`,
      `${category.name} components`,
      "SwiftUI category components",
      "CopyMyUI",
    ],
    imagePath: categoryPage.components[0]?.previewImage ?? "/seed-screenshots/aurora-tab-orbit-full.jpg",
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, messages } = await getI18n();
  const viewer = await getViewer();
  const { slug } = await params;
  const query = await searchParams;
  const requestedPage = parsePageParam(query.page);
  if (query.page && requestedPage === 1) {
    redirect(withLocalePath(locale, `/categories/${slug}`));
  }
  const [browseRailData, categoryPage] = await Promise.all([
    listBrowseRailCategories(),
    getPublicCategoryPageData(slug, viewer?.id, {
      page: requestedPage,
      pageSize: CATEGORY_PAGE_SIZE,
    }),
  ]);

  if (!categoryPage) {
    notFound();
  }
  if (requestedPage > categoryPage.pagination.totalPages) {
    notFound();
  }

  const category = translateCategory(categoryPage.category, messages, locale);
  const breadcrumbItems = [
    { name: "CopyMyUI", path: "/" },
    { name: messages.explorePage.title, path: "/components" },
    { name: category.name, path: buildCategoryPagePath(slug, categoryPage.pagination.currentPage) },
  ];
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(locale, breadcrumbItems);
  const collectionJsonLd = buildCollectionPageJsonLd({
    locale,
    path: buildCategoryPagePath(slug, categoryPage.pagination.currentPage),
    name: `${category.name} · ${messages.explorePage.title}`,
    description: category.description,
    itemUrls: categoryPage.components
      .slice(0, 12)
      .map((component) => getAbsoluteLocaleUrl(locale, `/components/${component.slug}`)),
  });
  const categoryTopHref = withLocalePath(locale, `/components?category=${slug}`);
  const categoryNewestHref = withLocalePath(
    locale,
    `/components?category=${slug}&sort=newest`
  );
  const categoryPremiumHref = withLocalePath(
    locale,
    `/components?category=${slug}&access=premium`
  );

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
          activeCategorySlug={slug}
          categoryLinkMode="pages"
        />

        <div className="min-w-0">
          <section className="rounded-[2rem] border border-black/6 bg-white/84 p-4 shadow-[0_20px_56px_-42px_rgba(22,18,12,0.24)] backdrop-blur sm:p-5">
            <SeoBreadcrumbs
              items={[
                { label: "CopyMyUI", href: withLocalePath(locale, "/") },
                { label: messages.explorePage.title, href: withLocalePath(locale, "/components") },
                { label: category.name },
              ]}
            />
            <div className="rounded-[1.4rem] border border-black/8 bg-[rgba(252,251,247,0.98)] p-4 sm:p-5">
              <div className="max-w-3xl">
                <h1 className="inline-flex items-center gap-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
                  <CategoryIcon
                    slug={categoryPage.category.slug}
                    className="size-7 shrink-0 text-muted-foreground sm:size-8"
                  />
                  {category.name}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  {category.description}
                </p>
              </div>
              <div className="mt-5 rounded-[1.1rem] border border-black/8 bg-white/80 p-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{category.name}</span> ·{" "}
                  {messages.categoryPage.approvedCount}:{" "}
                  <span className="font-semibold text-foreground">
                    {categoryPage.pagination.totalCount}
                  </span>{" "}
                  · {messages.categoryPage.premiumCount}:{" "}
                  <span className="font-semibold text-foreground">
                    {categoryPage.premiumCount}
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={categoryTopHref}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowUpDown className="size-3.5" />
                    {messages.explorePage.topRated}
                  </Link>
                  <Link
                    href={categoryNewestHref}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowUpDown className="size-3.5" />
                    {messages.explorePage.newest}
                  </Link>
                  <Link
                    href={categoryPremiumHref}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Crown className="size-3.5" />
                    {messages.explorePage.premiumOnly}
                  </Link>
                </div>
              </div>
            </div>

            <hr className="mt-5 border-black/8" />

            <div className="pt-4">
              {categoryPage.components.length > 0 ? (
              <ComponentCardList
                components={categoryPage.components}
                className="gap-4 md:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-5"
              />
              ) : (
                <EmptyState
                  eyebrow={messages.categoryPage.emptyEyebrow}
                  title={messages.categoryPage.emptyTitle}
                  description={messages.categoryPage.emptyDescription}
                  actionHref={withLocalePath(locale, "/components")}
                  actionLabel={messages.categoryPage.emptyAction}
                />
              )}
            </div>

            {categoryPage.pagination.totalCount > 0 ? (
              <div className="mt-5 border-t border-black/8 pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {messages.categoryPage.approvedCount}:{" "}
                    <span className="font-semibold text-foreground">
                      {categoryPage.pagination.totalCount}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    {categoryPage.pagination.totalPages > 1 ? (
                      <Pagination className="w-auto">
                        <PaginationContent>
                          {categoryPage.pagination.currentPage > 1 ? (
                            <PaginationItem>
                              <PaginationPrevious
                                href={buildCategoryPageHref(
                                  locale,
                                  categoryPage.category.slug,
                                  categoryPage.pagination.currentPage - 1
                                )}
                                aria-label={messages.categoryPage.paginationPrevious}
                              >
                                {messages.categoryPage.paginationPrevious}
                              </PaginationPrevious>
                            </PaginationItem>
                          ) : null}
                          {getPaginationTokens(
                            categoryPage.pagination.currentPage,
                            categoryPage.pagination.totalPages
                          ).map((token) => {
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
                                  href={buildCategoryPageHref(
                                    locale,
                                    categoryPage.category.slug,
                                    token
                                  )}
                                  isActive={token === categoryPage.pagination.currentPage}
                                  aria-label={`${messages.categoryPage.paginationPage} ${token}`}
                                >
                                  {token}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          {categoryPage.pagination.currentPage < categoryPage.pagination.totalPages ? (
                            <PaginationItem>
                              <PaginationNext
                                href={buildCategoryPageHref(
                                  locale,
                                  categoryPage.category.slug,
                                  categoryPage.pagination.currentPage + 1
                                )}
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
