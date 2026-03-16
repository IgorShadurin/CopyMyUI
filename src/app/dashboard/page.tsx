import Image from "next/image";
import type { Metadata } from "next";

import {
  Crown,
  Eye,
  LayoutTemplate,
  PenLine,
  RefreshCw,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { PageNotice } from "@/components/page-notice";
import { StatusBadge } from "@/components/status-badge";
import { AppActionButton } from "@/components/ui/app-action-button";
import { AppActionLink } from "@/components/ui/app-action-link";
import { getI18n, translateCategory } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { startRevisionDraftAction } from "@/lib/actions/component-actions";
import { CategoryIcon } from "@/lib/category-icons";
import { formatUsdCents } from "@/lib/pricing";
import { getDashboardData } from "@/lib/server/component-service";
import { createPageMetadata } from "@/lib/seo";
import { requireViewer } from "@/lib/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();

  return createPageMetadata({
    locale,
    path: "/dashboard",
    title: messages.dashboardPage.title,
    description: messages.dashboardPage.description,
    noIndex: true,
  });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { locale, messages } = await getI18n();
  const viewer = await requireViewer();
  const params = await searchParams;
  const components = await getDashboardData(viewer.id);
  const hasComponents = components.length > 0;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
      {params.submitted === "1" ? (
        <PageNotice
          tone="success"
          message={messages.dashboardPage.noticeSubmitted}
        />
      ) : null}

      <DashboardShell
        locale={locale}
        messages={messages}
        activeSection="dashboard"
      >
          {hasComponents ? (
            <>
              <section
                id="dashboard-settings"
                className="flex flex-col gap-4 rounded-[1.8rem] border border-black/6 bg-white/90 p-4 shadow-[0_24px_70px_-52px_rgba(22,18,12,0.38)] backdrop-blur sm:rounded-[2rem] sm:p-5 md:flex-row md:items-end md:justify-between"
              >
                <div>
                  <h1 className="inline-flex items-center gap-2.5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                    <LayoutTemplate className="size-6 text-muted-foreground sm:size-7" />
                    {messages.dashboardPage.title}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                    {messages.dashboardPage.description}
                  </p>
                </div>
                <AppActionLink
                  href={withLocalePath(locale, "/dashboard/components/new")}
                  uiSize="lg"
                  icon={<PenLine className="size-4" />}
                >
                  {messages.header.newComponent}
                </AppActionLink>
              </section>

              <section className="grid gap-3 sm:gap-4">
                {components.map((component) => {
                  return (
                    <Card
                      key={component.id}
                      data-testid={`dashboard-component-${component.slug}`}
                      className="rounded-[1.3rem] border border-black/6 bg-white/92 shadow-[0_20px_50px_-44px_rgba(22,18,12,0.42)] sm:rounded-[1.5rem]"
                    >
                      <CardContent className="grid gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:grid-cols-[132px_minmax(0,1fr)_auto] lg:items-start">
                        <div className="overflow-hidden rounded-[1rem] border border-black/6 bg-[linear-gradient(135deg,#fff8ea_0%,#ffffff_56%,#ecfeff_100%)]">
                          <Image
                            src={component.previewImage ?? "/seed-screenshots/aurora-tab-orbit.svg"}
                            alt={component.title}
                            width={1200}
                            height={900}
                            unoptimized
                            className="aspect-[16/10] w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={component.status} />
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                              <CategoryIcon slug={component.category.slug} className="size-3.5" />
                              {translateCategory(component.category, messages, locale).name}
                            </span>
                            {component.accessType === "PREMIUM" && component.salePriceCents ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                <Crown className="size-3.5" />
                                {messages.dashboardPage.premiumBadge} {formatUsdCents(component.salePriceCents)}
                              </span>
                            ) : null}
                          </div>

                          <div>
                            <h2 className="truncate text-xl font-semibold tracking-tight text-foreground">
                              {component.title}
                            </h2>
                            <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                              {component.summary}
                            </p>
                          </div>

                          {component.latestReviewNote ? (
                            <div className="rounded-[0.95rem] border border-black/8 bg-amber-50/60 px-3 py-2 text-xs leading-6 text-muted-foreground">
                              {component.latestReviewNote}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                          {component.canEditDraft ? (
                            <AppActionLink
                              href={withLocalePath(locale, `/dashboard/components/${component.id}/edit`)}
                              uiSize="sm"
                              icon={<PenLine className="size-4" />}
                            >
                              {messages.dashboardPage.continueEditing}
                            </AppActionLink>
                          ) : null}

                          {!component.canEditDraft && component.canStartUpdate ? (
                            <form action={startRevisionDraftAction.bind(null, component.id)}>
                              <AppActionButton
                                type="submit"
                                uiSize="sm"
                                tone="outline"
                                icon={<RefreshCw className="size-4" />}
                              >
                                {component.hasPublicVersion
                                  ? messages.dashboardPage.startUpdate
                                  : messages.dashboardPage.reviseDraft}
                              </AppActionButton>
                            </form>
                          ) : null}

                          <AppActionLink
                            href={withLocalePath(locale, `/components/${component.slug}`)}
                            uiSize="sm"
                            tone="ghost"
                            icon={<Eye className="size-4" />}
                          >
                            {messages.dashboardPage.viewComponent}
                          </AppActionLink>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </section>
            </>
          ) : (
            <section
              id="dashboard-settings"
              className="rounded-[1.8rem] border border-black/6 bg-white/90 p-4 shadow-[0_24px_70px_-52px_rgba(22,18,12,0.38)] backdrop-blur sm:rounded-[2rem] sm:p-5"
            >
              <div>
                <div>
                  <h1 className="inline-flex items-center gap-2.5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                    <LayoutTemplate className="size-6 text-muted-foreground sm:size-7" />
                    {messages.dashboardPage.title}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                    {messages.dashboardPage.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[1.2rem] border border-black/6 bg-[rgba(252,251,247,0.94)] p-5 text-center sm:p-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {messages.dashboardPage.emptyEyebrow}
                </p>
                <h2 className="mt-3 text-2xl font-medium leading-tight text-foreground sm:text-[2rem]">
                  {messages.dashboardPage.emptyTitle}
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {messages.dashboardPage.emptyDescription}
                </p>
                <AppActionLink
                  href={withLocalePath(locale, "/dashboard/components/new")}
                  uiSize="lg"
                  icon={<PenLine className="size-4" />}
                  className="mt-5"
                >
                  {messages.dashboardPage.emptyAction}
                </AppActionLink>
              </div>
            </section>
          )}

      </DashboardShell>
    </main>
  );
}
