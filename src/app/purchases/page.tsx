import type { Metadata } from "next";

import { ComponentCard } from "@/components/component-card";
import { EmptyState } from "@/components/empty-state";
import { PageNotice } from "@/components/page-notice";
import { getI18n } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { createPageMetadata } from "@/lib/seo";
import { getPurchasesData } from "@/lib/server/marketplace-service";
import { requireViewer } from "@/lib/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();

  return createPageMetadata({
    locale,
    path: "/purchases",
    title: messages.purchasesPage.title,
    description: messages.purchasesPage.description,
    noIndex: true,
  });
}

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ purchased?: string }>;
}) {
  const { locale, messages } = await getI18n();
  const viewer = await requireViewer();
  const query = await searchParams;
  const purchases = await getPurchasesData(viewer.id);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 md:py-14">
      {query.purchased === "1" ? (
        <PageNotice tone="success" message={messages.purchasesPage.noticePurchased} />
      ) : null}

      <section className="rounded-[2.2rem] border border-black/6 bg-white/85 p-5 shadow-[0_35px_90px_-45px_rgba(22,18,12,0.55)] backdrop-blur sm:rounded-[2.6rem] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {messages.purchasesPage.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
          {messages.purchasesPage.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          {messages.purchasesPage.description}
        </p>
      </section>

      {purchases.length > 0 ? (
        <section className="grid gap-6 lg:grid-cols-3">
          {purchases.map((purchase) => (
            <ComponentCard key={purchase.id} component={purchase.component} />
          ))}
        </section>
      ) : (
        <EmptyState
          eyebrow={messages.purchasesPage.emptyEyebrow}
          title={messages.purchasesPage.emptyTitle}
          description={messages.purchasesPage.emptyDescription}
          actionHref={withLocalePath(locale, "/components?access=premium")}
          actionLabel={messages.purchasesPage.emptyAction}
        />
      )}
    </main>
  );
}
