import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpDown, Crown, Flame } from "lucide-react";

import { BrowseRail } from "@/components/browse-rail";
import { ComponentCard } from "@/components/component-card";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { type AppLocale } from "@/i18n/config";
import { getI18n, translateCategory } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { CategoryIcon } from "@/lib/category-icons";
import { createPageMetadata } from "@/lib/seo";
import { normalizeSearchQuery } from "@/lib/search";
import { listCategories, listPublicComponents } from "@/lib/server/component-service";
import { cn } from "@/lib/utils";
import { getViewer } from "@/lib/viewer";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  access?: string;
  sort?: string;
}>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { locale, messages } = await getI18n();
  const params = await searchParams;
  const hasFilters =
    Boolean(normalizeSearchQuery(params.q)) ||
    Boolean(params.category) ||
    params.access === "premium" ||
    params.access === "free" ||
    params.sort === "newest";

  return createPageMetadata({
    locale,
    path: "/components",
    title: messages.explorePage.title,
    description: messages.explorePage.description,
    keywords: [
      "SwiftUI component gallery",
      "SwiftUI search",
      "free SwiftUI components",
      "premium SwiftUI components",
      "CopyMyUI components",
    ],
    imagePath: "/seed-screenshots/harbor-metrics-deck-full.jpg",
    noIndex: hasFilters,
  });
}

function buildComponentsHref(
  locale: AppLocale,
  params: {
    q?: string;
    category?: string;
    access?: "free" | "premium";
    sort?: "top" | "newest";
  }
) {
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

  const query = searchParams.toString();
  return withLocalePath(locale, query ? `/components?${query}` : "/components");
}

export default async function ComponentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { locale, messages } = await getI18n();
  const params = await searchParams;
  const normalizedQuery = normalizeSearchQuery(params.q);
  const viewer = await getViewer();
  const [categories, components] = await Promise.all([
    listCategories(),
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
  const activeCategory = categories.find((category) => category.slug === params.category);
  const premiumFilterHref = buildComponentsHref(locale, {
    ...listingBaseParams,
    access: "premium",
  });
  const allAccessHref = buildComponentsHref(locale, {
    ...listingBaseParams,
    access: undefined,
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

  return (
    <main className="mx-auto w-full max-w-[1500px] px-2 py-6 sm:px-3 lg:px-4">
      <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <BrowseRail
          locale={locale}
          messages={messages}
          categories={categories}
          viewer={viewer}
          currentQuery={normalizedQuery}
          currentSort={currentSort}
          currentAccess={currentAccess}
          activeCategorySlug={params.category ?? null}
          categoryLinkMode="filters"
        />

        <div className="min-w-0 space-y-6">
          <section className="rounded-[2rem] border border-black/6 bg-white/84 p-5 shadow-[0_20px_56px_-42px_rgba(22,18,12,0.24)] backdrop-blur sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  {messages.explorePage.eyebrow}
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
                  {messages.explorePage.title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  {messages.explorePage.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <Link
                  href={allAccessHref}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-full",
                    !currentAccess ? "border-black/14 bg-[rgba(252,251,247,0.96)] text-foreground" : ""
                  )}
                >
                  <Flame className="size-4" />
                  {messages.footer.exploreComponents}
                </Link>
                <Link
                  href={premiumFilterHref}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-full",
                    currentAccess === "premium" ? "border-black/14 bg-[rgba(252,251,247,0.96)] text-foreground" : ""
                  )}
                >
                  <Crown className="size-4" />
                  {messages.detailPage.premiumBadge}
                </Link>
                <Link
                  href={topSortHref}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-full",
                    currentSort === "top" ? "border-black/14 bg-[rgba(252,251,247,0.96)] text-foreground" : ""
                  )}
                >
                  <ArrowUpDown className="size-4" />
                  {messages.explorePage.topRated}
                </Link>
                <Link
                  href={newestSortHref}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-full",
                    currentSort === "newest" ? "border-black/14 bg-[rgba(252,251,247,0.96)] text-foreground" : ""
                  )}
                >
                  <ArrowUpDown className="size-4" />
                  {messages.explorePage.newest}
                </Link>
              </div>

              {hasFilters ? (
                <div className="flex flex-wrap gap-2 xl:max-w-[26rem] xl:justify-end">
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
                  <Link
                    href={withLocalePath(locale, "/components")}
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[rgba(252,251,247,0.96)]"
                  >
                    {messages.explorePage.resetFilters}
                  </Link>
                </div>
              ) : null}
            </div>
          </section>

          {components.length > 0 ? (
            <section className="rounded-[2rem] border border-black/6 bg-white/82 p-4 shadow-[0_18px_48px_-42px_rgba(22,18,12,0.2)] backdrop-blur sm:p-5">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {components.map((component) => (
                  <ComponentCard key={component.id} component={component} />
                ))}
              </div>
            </section>
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
      </div>
    </main>
  );
}
