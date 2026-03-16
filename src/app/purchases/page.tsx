import type { Metadata } from "next";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { ComponentCardList } from "@/components/component-card-list";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageNotice } from "@/components/page-notice";
import { AppActionLink } from "@/components/ui/app-action-link";
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
  const hasPurchases = purchases.length > 0;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
      {query.purchased === "1" ? (
        <PageNotice tone="success" message={messages.purchasesPage.noticePurchased} />
      ) : null}

      <DashboardShell
        locale={locale}
        messages={messages}
        activeSection="purchases"
      >
        {hasPurchases ? (
          <>
            <section className="rounded-[1.8rem] border border-black/6 bg-white/90 p-4 shadow-[0_24px_70px_-52px_rgba(22,18,12,0.38)] backdrop-blur sm:rounded-[2rem] sm:p-5">
              <h1 className="inline-flex items-center gap-2.5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                <ShoppingBag className="size-6 text-muted-foreground sm:size-7" />
                {messages.purchasesPage.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                {messages.purchasesPage.description}
              </p>
            </section>

            <ComponentCardList
              components={purchases.map((purchase) => purchase.component)}
              className="xl:grid-cols-3 2xl:grid-cols-3"
            />
          </>
        ) : (
          <section className="rounded-[1.8rem] border border-black/6 bg-white/90 p-4 shadow-[0_24px_70px_-52px_rgba(22,18,12,0.38)] backdrop-blur sm:rounded-[2rem] sm:p-5">
            <h1 className="inline-flex items-center gap-2.5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
              <ShoppingBag className="size-6 text-muted-foreground sm:size-7" />
              {messages.purchasesPage.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              {messages.purchasesPage.description}
            </p>

            <div className="mt-4 rounded-[1.2rem] border border-black/6 bg-[rgba(252,251,247,0.94)] p-5 text-center sm:p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {messages.purchasesPage.emptyEyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-medium leading-tight text-foreground sm:text-[2rem]">
                {messages.purchasesPage.emptyTitle}
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                {messages.purchasesPage.emptyDescription}
              </p>
              <AppActionLink
                href={withLocalePath(locale, "/components?access=premium")}
                uiSize="lg"
                icon={<ArrowRight className="size-4" />}
                className="mt-5"
              >
                {messages.purchasesPage.emptyAction}
              </AppActionLink>
            </div>
          </section>
        )}
      </DashboardShell>
    </main>
  );
}
