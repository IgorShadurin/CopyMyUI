import type { Metadata } from "next";

import { ComponentCard } from "@/components/component-card";
import { EmptyState } from "@/components/empty-state";
import { getI18n } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { createPageMetadata } from "@/lib/seo";
import { getFavoritesData } from "@/lib/server/component-service";
import { requireViewer } from "@/lib/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();

  return createPageMetadata({
    locale,
    path: "/favorites",
    title: messages.favoritesPage.title,
    description: messages.favoritesPage.description,
    noIndex: true,
  });
}

export default async function FavoritesPage() {
  const { locale, messages } = await getI18n();
  const viewer = await requireViewer();
  const favorites = await getFavoritesData(viewer.id);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 md:py-14">
      <section className="rounded-[2.2rem] border border-black/6 bg-white/85 p-5 shadow-[0_35px_90px_-45px_rgba(22,18,12,0.55)] backdrop-blur sm:rounded-[2.6rem] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {messages.favoritesPage.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
          {messages.favoritesPage.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          {messages.favoritesPage.description}
        </p>
      </section>

      {favorites.length > 0 ? (
        <section className="grid gap-6 lg:grid-cols-3">
          {favorites.map((component) => (
            <ComponentCard key={component.id} component={component} showFavorite={false} />
          ))}
        </section>
      ) : (
        <EmptyState
          eyebrow={messages.favoritesPage.emptyEyebrow}
          title={messages.favoritesPage.emptyTitle}
          description={messages.favoritesPage.emptyDescription}
          actionHref={withLocalePath(locale, "/components")}
          actionLabel={messages.favoritesPage.emptyAction}
        />
      )}
    </main>
  );
}
