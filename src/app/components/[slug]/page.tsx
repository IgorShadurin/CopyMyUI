import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Crown, Layers3, Lock, PanelTop } from "lucide-react";

import { CodeCopyButton } from "@/components/code-copy-button";
import { CodePreview } from "@/components/code-preview";
import { ComponentMediaGallery } from "@/components/component-media-gallery";
import { PageNotice } from "@/components/page-notice";
import { StatusBadge } from "@/components/status-badge";
import { getI18n, translateCategory } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { purchasePremiumComponentAction } from "@/lib/actions/marketplace-actions";
import { CategoryIcon } from "@/lib/category-icons";
import { formatUsdCents } from "@/lib/pricing";
import { createPageMetadata } from "@/lib/seo";
import { getPublicComponentBySlug } from "@/lib/server/component-service";
import { cn } from "@/lib/utils";
import { getViewer } from "@/lib/viewer";

function formatDate(value: Date | string | null | undefined, locale: string) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function isVideoMedia(screenshot: {
  mediaType?: "IMAGE" | "VIDEO" | null;
  mimeType?: string | null;
}) {
  return (
    screenshot.mediaType === "VIDEO" ||
    Boolean(screenshot.mimeType?.startsWith("video/"))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { locale, messages } = await getI18n();
  const component = await getPublicComponentBySlug(slug, null);

  if (!component) {
    return {};
  }

  const category = translateCategory(component.category, messages, locale);
  const ogImage = component.screenshots.find((screenshot) => !isVideoMedia(screenshot))?.url;

  return createPageMetadata({
    locale,
    path: `/components/${component.slug}`,
    title: component.title,
    description: component.summary,
    type: "article",
    keywords: [
      "SwiftUI component",
      component.title,
      `${category.name} SwiftUI`,
      component.accessType === "PREMIUM" ? "premium SwiftUI component" : "free SwiftUI component",
      "CopyMyUI",
    ],
    imagePath: ogImage,
  });
}

export default async function ComponentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ purchased?: string; purchaseError?: string }>;
}) {
  const { locale, messages } = await getI18n();
  const viewer = await getViewer();
  const { slug } = await params;
  const query = await searchParams;
  const component = await getPublicComponentBySlug(slug, viewer);

  if (!component) {
    notFound();
  }

  const category = translateCategory(component.category, messages, locale);
  const latestApprovedRevision = component.revisions
    .filter((revision) => revision.status === "APPROVED")
    .sort(
      (left, right) =>
        new Date(right.reviewedAt ?? right.createdAt).getTime() -
        new Date(left.reviewedAt ?? left.createdAt).getTime()
    )[0];
  const latestApprovedDate = formatDate(
    latestApprovedRevision?.reviewedAt ?? component.publishedAt,
    locale
  );
  const renderLatestApprovalCard = (className?: string) => (
    <Card
      className={cn(
        "rounded-[1.8rem] border border-black/6 bg-white/90 shadow-[0_32px_80px_-48px_rgba(22,18,12,0.5)] sm:rounded-[2rem]",
        className
      )}
    >
      <CardContent className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center gap-3">
          <Layers3 className="size-5 text-amber-500" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {messages.detailPage.revisionTrailEyebrow}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
              {messages.detailPage.revisionTrailTitle}
            </h2>
          </div>
        </div>
        <div className="rounded-[1.2rem] border border-black/6 bg-[rgba(252,251,247,0.95)] px-3.5 py-3.5">
          {latestApprovedRevision ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={latestApprovedRevision.status} />
                {latestApprovedDate ? (
                  <p className="text-sm font-medium text-foreground">{latestApprovedDate}</p>
                ) : null}
              </div>
              <p className="mt-3 font-medium text-foreground">
                {messages.common.version} {latestApprovedRevision.version} ·{" "}
                {latestApprovedRevision.title}
              </p>
              {latestApprovedRevision.changelog ? (
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {latestApprovedRevision.changelog}
                </p>
              ) : null}
              {!latestApprovedRevision.changelog && latestApprovedRevision.reviewNote ? (
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {latestApprovedRevision.reviewNote}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm leading-7 text-muted-foreground">
              {messages.detailPage.newRevisionPendingReview}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 md:py-14">
      {query.purchased === "1" ? (
        <PageNotice tone="success" message={messages.purchasesPage.noticePurchased} />
      ) : null}
      {query.purchaseError ? (
        <PageNotice tone="info" message={query.purchaseError} />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:items-start">
        <Card className="order-3 rounded-[1.8rem] border border-black/6 bg-[#121010] py-0 text-white shadow-[0_35px_90px_-45px_rgba(21,16,10,0.7)] sm:rounded-[2rem] xl:order-1 xl:self-start">
          <CardContent className="flex flex-col gap-5 px-5 pt-5 pb-0 sm:px-6 sm:pt-6 sm:pb-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                  {messages.detailPage.swiftSourceEyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {messages.detailPage.swiftSourceTitle}
                </h2>
              </div>
              {component.swiftCode ? (
                <CodeCopyButton
                  code={component.swiftCode}
                  isAuthenticated={Boolean(viewer)}
                  nextPath={withLocalePath(locale, `/components/${component.slug}`)}
                />
              ) : null}
            </div>
            {component.swiftCode ? (
              <CodePreview
                code={component.swiftCode}
                className="xl:min-h-0 xl:flex-1"
                desktopAlignBottomToId="component-detail-right-column"
              />
            ) : (
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-8 xl:flex-1">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-white/10 p-3">
                    <Lock className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white sm:text-xl">
                      {messages.detailPage.lockedSourceTitle}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-white/70">
                      {messages.detailPage.lockedSourceDescription}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {component.canPurchase ? (
                        <form action={purchasePremiumComponentAction.bind(null, component.id, component.slug)}>
                          <button
                            type="submit"
                            className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
                          >
                            <Crown className="size-4" />
                            {messages.detailPage.buyNowLabel}{" "}
                            {component.salePriceCents
                              ? formatUsdCents(component.salePriceCents)
                              : ""}
                          </button>
                        </form>
                      ) : null}
                      {!viewer ? (
                        <Link
                          href={withLocalePath(locale, `/auth/signin?next=/components/${component.slug}`)}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "rounded-full"
                          )}
                        >
                          {messages.detailPage.signInToBuy}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div id="component-detail-right-column" className="order-1 space-y-4 xl:order-2 xl:self-start">
          <Card className="rounded-[1.8rem] border border-black/6 bg-white/90 shadow-[0_32px_80px_-48px_rgba(22,18,12,0.5)] sm:rounded-[2rem]">
            <CardContent className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
              <div>
                <div className="flex items-center gap-2">
                  <PanelTop className="size-5 shrink-0 text-muted-foreground" />
                  <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {component.title}
                  </h1>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {component.summary}
                </p>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-3 border-t border-black/6 pt-3">
                <Link
                  href={withLocalePath(locale, `/categories/${component.category.slug}`)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  <CategoryIcon slug={component.category.slug} className="size-3.5" />
                  {category.name}
                </Link>
                <div className="ml-auto text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {messages.detailPage.buyerPrice}
                  </p>
                  <p className="mt-1 text-3xl leading-none font-semibold tracking-tight text-foreground sm:text-[2rem]">
                    {component.accessType === "PREMIUM" && component.salePriceCents
                      ? formatUsdCents(component.salePriceCents)
                      : messages.editor.freeOption}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {component.screenshots[0] ? (
            <Card className="overflow-hidden rounded-[1.8rem] border border-black/6 bg-white/90 shadow-[0_32px_80px_-48px_rgba(22,18,12,0.5)] sm:rounded-[2rem]">
              <CardContent className="p-2 sm:p-3">
                <ComponentMediaGallery items={component.screenshots} />
              </CardContent>
            </Card>
          ) : null}

          {renderLatestApprovalCard("hidden xl:block")}

        </div>
        {renderLatestApprovalCard("order-4 xl:hidden")}
      </section>
    </main>
  );
}
