import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Crown, PenLine } from "lucide-react";

import { ApiKeysPanel } from "@/components/api-keys-panel";
import { EmptyState } from "@/components/empty-state";
import { PageNotice } from "@/components/page-notice";
import { StatusBadge } from "@/components/status-badge";
import { getI18n, translateCategory } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { startRevisionDraftAction } from "@/lib/actions/component-actions";
import { formatUsdCents } from "@/lib/pricing";
import { listApiKeysForUser } from "@/lib/server/api-key-service";
import { getDashboardData } from "@/lib/server/component-service";
import { createPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
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
  const [components, apiKeys] = await Promise.all([
    getDashboardData(viewer.id),
    listApiKeysForUser(viewer.id),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 md:py-14">
      {params.submitted === "1" ? (
        <PageNotice
          tone="success"
          message={messages.dashboardPage.noticeSubmitted}
        />
      ) : null}

      <section className="flex flex-col gap-5 rounded-[2.2rem] border border-black/6 bg-white/85 p-5 shadow-[0_35px_90px_-45px_rgba(22,18,12,0.55)] backdrop-blur sm:rounded-[2.6rem] sm:p-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            {messages.dashboardPage.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
            {messages.dashboardPage.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {messages.dashboardPage.description}
          </p>
        </div>
        <Link
          href={withLocalePath(locale, "/dashboard/components/new")}
          className={cn(buttonVariants({ size: "lg" }), "rounded-full px-5")}
        >
          <PenLine className="size-4" />
          {messages.header.newComponent}
        </Link>
      </section>

      {components.length > 0 ? (
        <section className="grid gap-6">
          {components.map((component) => (
            <Card
              key={component.id}
              data-testid={`dashboard-component-${component.slug}`}
              className="rounded-[1.8rem] border border-black/6 bg-white/88 shadow-[0_32px_80px_-48px_rgba(22,18,12,0.5)] sm:rounded-[2rem]"
            >
              <CardContent className="grid gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[160px_1fr_auto] lg:items-center">
                <div className="overflow-hidden rounded-[1.4rem] border border-black/6 bg-[linear-gradient(135deg,#fff8ea_0%,#ffffff_56%,#ecfeff_100%)]">
                  <Image
                    src={component.previewImage ?? "/seed-screenshots/aurora-tab-orbit.svg"}
                    alt={component.title}
                    width={1200}
                    height={900}
                    unoptimized
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={component.status} />
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {translateCategory(component.category, messages, locale).name}
                    </span>
                    {component.accessType === "PREMIUM" && component.salePriceCents ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <Crown className="size-3.5" />
                        {messages.dashboardPage.premiumBadge} {formatUsdCents(component.salePriceCents)}
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      {component.title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                      {component.summary}
                    </p>
                  </div>
                  {component.latestReviewNote ? (
                    <div className="rounded-[1.4rem] border border-black/6 bg-amber-50/70 px-4 py-3 text-sm leading-7 text-muted-foreground">
                      {component.latestReviewNote}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
                  {component.canEditDraft ? (
                    <Link
                      href={withLocalePath(locale, `/dashboard/components/${component.id}/edit`)}
                      className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
                    >
                      {messages.dashboardPage.continueEditing}
                    </Link>
                  ) : null}

                  {!component.canEditDraft && component.canStartUpdate ? (
                    <form action={startRevisionDraftAction.bind(null, component.id)}>
                      <button
                        type="submit"
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
                      >
                        {component.hasPublicVersion
                          ? messages.dashboardPage.startUpdate
                          : messages.dashboardPage.reviseDraft}
                      </button>
                    </form>
                  ) : null}

                  <Link
                    href={withLocalePath(locale, `/components/${component.slug}`)}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full")}
                  >
                    {messages.dashboardPage.viewComponent}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
        <EmptyState
          eyebrow={messages.dashboardPage.emptyEyebrow}
          title={messages.dashboardPage.emptyTitle}
          description={messages.dashboardPage.emptyDescription}
          actionHref={withLocalePath(locale, "/dashboard/components/new")}
          actionLabel={messages.dashboardPage.emptyAction}
        />
      )}

      <ApiKeysPanel initialApiKeys={apiKeys} />
    </main>
  );
}
