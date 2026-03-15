import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrowseRail } from "@/components/browse-rail";
import { ComponentCard } from "@/components/component-card";
import { EmptyState } from "@/components/empty-state";
import { getI18n, translateCategory } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { createPageMetadata } from "@/lib/seo";
import { listCategories } from "@/lib/server/component-service";
import { getPublicCategoryPageData } from "@/lib/server/category-service";
import { getViewer } from "@/lib/viewer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { locale, messages } = await getI18n();
  const { slug } = await params;
  const categoryPage = await getPublicCategoryPageData(slug, null);

  if (!categoryPage) {
    return {};
  }

  const category = translateCategory(categoryPage.category, messages, locale);

  return createPageMetadata({
    locale,
    path: `/categories/${categoryPage.category.slug}`,
    title: category.name,
    description: category.description,
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { locale, messages } = await getI18n();
  const viewer = await getViewer();
  const { slug } = await params;
  const [categories, categoryPage] = await Promise.all([
    listCategories(),
    getPublicCategoryPageData(slug, viewer?.id),
  ]);

  if (!categoryPage) {
    notFound();
  }

  const category = translateCategory(categoryPage.category, messages, locale);

  return (
    <main className="mx-auto w-full max-w-[1500px] px-2 py-6 sm:px-3 lg:px-4">
      <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <BrowseRail
          locale={locale}
          messages={messages}
          categories={categories}
          viewer={viewer}
          activeCategorySlug={slug}
          categoryLinkMode="pages"
        />

        <div className="min-w-0 space-y-6">
          <section className="rounded-[2rem] border border-black/6 bg-white/84 p-5 shadow-[0_20px_56px_-42px_rgba(22,18,12,0.24)] backdrop-blur sm:p-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
                  {category.name}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  {category.description}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[28rem]">
                <div className="rounded-[1.4rem] border border-black/6 bg-[rgba(252,251,247,0.96)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {messages.categoryPage.approvedCount}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">
                    {categoryPage.stats.approvedCount}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-black/6 bg-[rgba(252,251,247,0.96)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {messages.categoryPage.premiumCount}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">
                    {categoryPage.stats.premiumCount}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-black/6 bg-[rgba(252,251,247,0.96)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {messages.categoryPage.featuredCount}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">
                    {categoryPage.stats.featuredCount}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {categoryPage.components.length > 0 ? (
            <section className="rounded-[2rem] border border-black/6 bg-white/82 p-4 shadow-[0_18px_48px_-42px_rgba(22,18,12,0.2)] backdrop-blur sm:p-5">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {categoryPage.components.map((component) => (
                  <ComponentCard key={component.id} component={component} />
                ))}
              </div>
            </section>
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
      </div>
    </main>
  );
}
