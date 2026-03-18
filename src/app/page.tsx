import type { Metadata } from "next";
import Link from "next/link";

import { Bookmark, ChevronRight, Grid2X2, Library, Sparkles } from "lucide-react";

import { BrowseRail } from "@/components/browse-rail";
import { ComponentCard } from "@/components/component-card";
import { getI18n, translateCategory } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { CategoryIcon } from "@/lib/category-icons";
import { createPageMetadata } from "@/lib/seo";
import { getHomepageData, listCategories } from "@/lib/server/component-service";
import { getViewer } from "@/lib/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();

  return createPageMetadata({
    locale,
    path: "/",
    title: messages.home.title,
    description: messages.home.description,
    keywords: [
      "SwiftUI components",
      "SwiftUI templates",
      "SwiftUI marketplace",
      "iOS UI components",
      "CopyMyUI",
    ],
    imagePath: "/seed-screenshots/aurora-tab-orbit-full.jpg",
  });
}

export default async function Home() {
  const { locale, messages } = await getI18n();
  const viewer = await getViewer();
  const [categories, homepage] = await Promise.all([
    listCategories(),
    getHomepageData(viewer?.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-[1500px] px-2 py-6 sm:px-3 lg:px-4">
      <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <BrowseRail
          locale={locale}
          messages={messages}
          categories={categories}
          viewer={viewer}
          categoryLinkMode="pages"
        />

        <div className="min-w-0 space-y-6">
          <section className="rounded-[2rem] border border-black/6 bg-white/84 p-5 shadow-[0_20px_56px_-42px_rgba(22,18,12,0.24)] backdrop-blur sm:p-6">
            <div className="min-w-0">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
                <span className="flex items-start gap-3">
                  <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl border border-black/8 bg-white/90 text-foreground shadow-[0_12px_30px_-24px_rgba(22,18,12,0.55)] sm:size-11">
                    <Library className="size-5 sm:size-6" />
                  </span>
                  <span>{messages.home.title}</span>
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {messages.home.description}
              </p>
            </div>

            <div className="mt-5 border-t border-black/8 pt-5">
              <div className="flex flex-col gap-3 border-b border-black/6 pb-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    <Bookmark className="size-6 text-muted-foreground" />
                    {messages.home.topRatedEyebrow}
                  </h2>
                </div>
                <Link
                  href={withLocalePath(locale, "/components")}
                  className="inline-flex h-auto items-center gap-1 rounded-md p-0 text-sm font-medium text-muted-foreground no-underline underline-offset-4 transition-colors hover:text-foreground hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70 focus-visible:outline-offset-2"
                >
                  <span className="flex items-center">
                    {messages.home.browseEveryComponent}
                    <ChevronRight className="ml-1 size-4" />
                  </span>
                </Link>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {homepage.topRated.map((component) => (
                  <ComponentCard key={component.id} component={component} />
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/6 bg-white/82 p-4 shadow-[0_18px_48px_-42px_rgba(22,18,12,0.2)] backdrop-blur sm:p-5">
            <div className="border-b border-black/6 pb-4">
              <h2 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                <Grid2X2 className="size-6 text-muted-foreground" />
                {messages.home.categoryLeadersEyebrow}
              </h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {homepage.categoryHighlights.map((highlight) => {
                if (!highlight.component) {
                  return null;
                }

                return (
                  <div
                    key={highlight.id}
                    className="space-y-2 rounded-[1.4rem] border border-black/6 bg-[rgba(252,251,247,0.82)] p-3"
                  >
                    <Link
                      href={withLocalePath(locale, `/categories/${highlight.slug}`)}
                      className="inline-flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <CategoryIcon slug={highlight.slug} className="size-4" />
                      {translateCategory(highlight, messages, locale).name}
                    </Link>
                    <ComponentCard component={highlight.component} />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/6 bg-white/82 p-4 shadow-[0_18px_48px_-42px_rgba(22,18,12,0.2)] backdrop-blur sm:p-5">
            <div className="flex flex-col gap-3 border-b border-black/6 pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  <Sparkles className="size-6 text-muted-foreground" />
                  {messages.home.newestEyebrow}
                </h2>
              </div>
              <Link
                href={withLocalePath(locale, "/components?sort=newest")}
                className="inline-flex h-auto items-center gap-1 rounded-md p-0 text-sm font-medium text-muted-foreground no-underline underline-offset-4 transition-colors hover:text-foreground hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70 focus-visible:outline-offset-2"
              >
                <span className="flex items-center">
                  {messages.home.browseEveryComponent}
                  <ChevronRight className="ml-1 size-4" />
                </span>
              </Link>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {homepage.newest.map((component) => (
                <ComponentCard key={component.id} component={component} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
