import Image from "next/image";
import type { Metadata } from "next";
import { Save } from "lucide-react";

import { PageNotice } from "@/components/page-notice";
import { ComponentCardList } from "@/components/component-card-list";
import { AppActionButton } from "@/components/ui/app-action-button";
import { getI18n, translateCategory } from "@/i18n/server";
import {
  updateCategoryAction,
  updatePlatformMarkupAction,
} from "@/lib/actions/admin-actions";
import { formatUsdCents } from "@/lib/pricing";
import { listAdminCategories } from "@/lib/server/category-service";
import { getAdminDashboardData } from "@/lib/server/marketplace-service";
import { createPageMetadata } from "@/lib/seo";
import { requireAdmin } from "@/lib/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();

  return createPageMetadata({
    locale,
    path: "/admin",
    title: messages.adminPage.title,
    description: messages.adminPage.description,
    noIndex: true,
  });
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const { locale, messages } = await getI18n();
  await requireAdmin();
  const query = await searchParams;
  const [adminData, categories] = await Promise.all([
    getAdminDashboardData(),
    listAdminCategories(),
  ]);

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-4 px-2 py-6 sm:px-3 lg:px-4">
      {query.updated === "1" ? (
        <PageNotice tone="success" message={messages.adminPage.noticeUpdated} />
      ) : null}
      {query.updated === "category" ? (
        <PageNotice tone="success" message={messages.adminPage.noticeCategoryUpdated} />
      ) : null}
      {query.error ? <PageNotice tone="info" message={query.error} /> : null}

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-black/8 bg-white p-4">
          <p className="text-xs font-medium text-muted-foreground">{messages.adminPage.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {messages.adminPage.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {messages.adminPage.description}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-black/8 bg-white px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {messages.adminPage.salesCount}
            </p>
              <p className="mt-1 text-xl font-semibold text-foreground">{adminData.totals.salesCount}</p>
            </div>
            <div className="rounded-lg border border-black/8 bg-white px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {messages.adminPage.grossRevenue}
            </p>
              <p className="mt-1 text-xl font-semibold text-foreground">{formatUsdCents(adminData.totals.grossCents)}</p>
            </div>
            <div className="rounded-lg border border-black/8 bg-white px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {messages.adminPage.platformFees}
            </p>
              <p className="mt-1 text-xl font-semibold text-foreground">{formatUsdCents(adminData.totals.feeCents)}</p>
            </div>
          </div>
        </div>

        <form action={updatePlatformMarkupAction} className="space-y-3 rounded-xl border border-black/8 bg-white p-4">
          <label
            htmlFor="premiumMarkupPercent"
            className="block text-sm font-medium text-foreground"
          >
            {messages.adminPage.markupLabel}
          </label>
          <input
            id="premiumMarkupPercent"
            type="number"
            name="premiumMarkupPercent"
            min="0"
            max="200"
            step="1"
            defaultValue={adminData.platformConfig.premiumMarkupPercent}
            className="h-9 w-full rounded-md border border-black/12 bg-white px-3 text-sm outline-none"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            {messages.adminPage.markupHint}
          </p>
          <AppActionButton
            type="submit"
            uiSize="sm"
            icon={<Save className="size-4" />}
            className="rounded-md"
          >
            {messages.adminPage.saveMarkup}
          </AppActionButton>
        </form>
      </section>

      <section className="rounded-xl border border-black/8 bg-white p-4">
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground">{messages.adminPage.categorySectionEyebrow}</p>
          <h2 className="text-xl font-semibold tracking-tight">
            {messages.adminPage.categorySectionTitle}
          </h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {categories.map((category) => {
            const translated = translateCategory(category, messages, locale);

            return (
              <form
                key={category.id}
                action={updateCategoryAction}
                className="space-y-3 rounded-lg border border-black/8 bg-white p-3"
              >
                <input type="hidden" name="categoryId" value={category.id} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`category-name-${category.id}`}
                      className="block text-xs font-medium text-muted-foreground"
                    >
                      {messages.adminPage.categoryNameLabel}
                    </label>
                    <input
                      id={`category-name-${category.id}`}
                      type="text"
                      name="name"
                      defaultValue={category.name}
                      className="mt-1 h-9 w-full rounded-md border border-black/12 bg-white px-3 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`category-slug-${category.id}`}
                      className="block text-xs font-medium text-muted-foreground"
                    >
                      {messages.adminPage.categorySlugLabel}
                    </label>
                    <input
                      id={`category-slug-${category.id}`}
                      type="text"
                      name="slug"
                      defaultValue={category.slug}
                      className="mt-1 h-9 w-full rounded-md border border-black/12 bg-white px-3 text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor={`category-accent-${category.id}`}
                    className="block text-xs font-medium text-muted-foreground"
                  >
                    {messages.adminPage.categoryAccentLabel}
                  </label>
                  <input
                    id={`category-accent-${category.id}`}
                    type="text"
                    name="accent"
                    defaultValue={category.accent}
                    className="mt-1 h-9 w-full rounded-md border border-black/12 bg-white px-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`category-description-${category.id}`}
                    className="block text-xs font-medium text-muted-foreground"
                  >
                    {messages.adminPage.categoryDescriptionLabel}
                  </label>
                  <textarea
                    id={`category-description-${category.id}`}
                    name="description"
                    defaultValue={category.description}
                    className="mt-1 min-h-20 w-full rounded-md border border-black/12 bg-white px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{translated.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {messages.adminPage.categoryUsageLabel} {category._count.componentLinks}
                    </p>
                  </div>
                  <AppActionButton
                    type="submit"
                    uiSize="sm"
                    icon={<Save className="size-4" />}
                    className="rounded-md"
                  >
                    {messages.adminPage.saveCategory}
                  </AppActionButton>
                </div>
              </form>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-black/8 bg-white p-4">
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground">{messages.adminPage.premiumSectionEyebrow}</p>
          <h2 className="text-xl font-semibold tracking-tight">
            {messages.adminPage.premiumSectionTitle}
          </h2>
        </div>
        <ComponentCardList
          components={adminData.premiumComponents}
          className="gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3"
        />
      </section>

      <section className="rounded-xl border border-black/8 bg-white p-4">
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground">{messages.adminPage.recentSalesEyebrow}</p>
          <h2 className="text-xl font-semibold tracking-tight">
            {messages.adminPage.recentSalesTitle}
          </h2>
        </div>
        <div className="grid gap-2">
          {adminData.recentPurchases.map((purchase) => (
            <div
              key={purchase.id}
              className="grid gap-3 rounded-lg border border-black/8 bg-white p-3 md:grid-cols-[88px_1fr_auto]"
            >
              <div className="overflow-hidden rounded-md border border-black/10">
                <Image
                  src={purchase.component.previewImage ?? "/seed-screenshots/aurora-tab-orbit.svg"}
                  alt={purchase.component.title}
                  width={640}
                  height={480}
                  unoptimized
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{purchase.component.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {purchase.buyer.name ?? purchase.buyer.email} → {purchase.seller.name ?? purchase.seller.email}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {formatUsdCents(purchase.salePriceCents)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {messages.adminPage.feeLabel} {formatUsdCents(purchase.platformFeeCents)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
