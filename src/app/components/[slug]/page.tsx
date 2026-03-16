import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Code2, Crown, Layers3, Lock, LogIn, PanelTop } from "lucide-react";

import { CodeCopyButton } from "@/components/code-copy-button";
import { CodePreview } from "@/components/code-preview";
import { ComponentMediaGallery } from "@/components/component-media-gallery";
import { GoogleSignInModalButton } from "@/components/google-signin-modal-button";
import { PageNotice } from "@/components/page-notice";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppActionButton } from "@/components/ui/app-action-button";
import { getI18n, translateCategory } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
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

function initials(name: string | null | undefined) {
  return (name ?? "CM")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
  const isPremiumComponent = component.accessType === "PREMIUM";
  const componentPriceLabel =
    isPremiumComponent && component.salePriceCents
      ? formatUsdCents(component.salePriceCents)
      : messages.editor.freeOption;
  const lockedSourcePreview = component.swiftCodePreview?.trim() || null;
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
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
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
                <div className="mt-2 flex items-center gap-2">
                  <Code2 className="size-5 text-white/70 sm:size-6" />
                  <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {messages.detailPage.swiftSourceTitle}
                  </h2>
                </div>
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
              <div className="mb-5 rounded-[1.6rem] border border-white/10 bg-white/5 px-4 pt-4 pb-6 sm:mb-6 sm:px-5 sm:pt-5 sm:pb-7 xl:flex-1">
                {lockedSourcePreview ? (
                  <>
                    <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.2em] text-white/70">
                      {messages.detailPage.lockedSourcePreviewLabel}
                    </span>
                    <div className="mt-3 overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/5">
                      <pre className="code-scrollbar max-h-64 overflow-auto p-4 text-[12px] leading-6 text-white/85 sm:text-[13px]">
                        <code>{lockedSourcePreview}</code>
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="rounded-[1.4rem] border border-white/12 bg-white/5 p-4 text-sm text-white/70">
                    {messages.detailPage.lockedSourceTitle}
                  </div>
                )}
                <div className="mt-4 flex items-start gap-3">
                  <div className="rounded-full bg-white/10 p-2.5">
                    <Lock className="size-4 text-white" />
                  </div>
                  <p className="max-w-xl text-sm leading-7 text-white/70">
                    {messages.detailPage.lockedSourceDescription}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {component.canPurchase ? (
                    <form action={purchasePremiumComponentAction.bind(null, component.id, component.slug)}>
                      <AppActionButton
                        type="submit"
                        uiSize="sm"
                        icon={<Crown className="size-4" />}
                      >
                        {messages.detailPage.buyNowLabel}{" "}
                        {component.salePriceCents
                          ? formatUsdCents(component.salePriceCents)
                          : ""}
                      </AppActionButton>
                    </form>
                  ) : null}
                  {!viewer ? (
                    <GoogleSignInModalButton
                      nextPath={withLocalePath(locale, `/components/${component.slug}`)}
                      triggerLabel={messages.detailPage.signInToBuy}
                      triggerIcon={<LogIn className="size-4" />}
                      tone="outline"
                      uiSize="lg"
                      triggerClassName="rounded-full border-black/10 bg-white text-foreground hover:bg-white/90"
                    />
                  ) : null}
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
                {isPremiumComponent ? (
                  <>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {messages.detailPage.buyerPrice}
                      </p>
                      <p className="mt-1 text-3xl leading-none font-semibold tracking-tight text-foreground sm:text-[2rem]">
                        {componentPriceLabel}
                      </p>
                    </div>
                    <Link
                      href={withLocalePath(locale, `/categories/${component.category.slug}`)}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      <CategoryIcon slug={component.category.slug} className="size-3.5" />
                      {category.name}
                    </Link>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {messages.detailPage.buyerPrice}
                      </p>
                      <p className="mt-1 text-3xl leading-none font-semibold tracking-tight text-foreground sm:text-[2rem]">
                        {componentPriceLabel}
                      </p>
                    </div>
                    <Link
                      href={withLocalePath(locale, `/categories/${component.category.slug}`)}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      <CategoryIcon slug={component.category.slug} className="size-3.5" />
                      {category.name}
                    </Link>
                  </>
                )}
              </div>
              <div className="border-t border-black/6 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {messages.common.creator}
                </p>
                <div className="mt-2 flex items-center gap-2.5">
                  <Avatar
                    size="sm"
                    className="size-8 rounded-[30%] shadow-[0_0.5px_1px_rgba(0,0,0,0.22),inset_0_-3px_4px_rgba(0,0,0,0.02)] after:border-black/10"
                  >
                    <AvatarImage
                      src={component.owner.image ?? undefined}
                      alt={component.owner.name ?? messages.profilePage.defaultName}
                      className="rounded-[30%]"
                    />
                    <AvatarFallback className="rounded-[30%] text-xs">
                      {initials(component.owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  {component.owner.profileSlug ? (
                    <Link
                      href={withLocalePath(locale, `/creators/${component.owner.profileSlug}`)}
                      className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {component.owner.name ?? messages.profilePage.defaultName}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-foreground">
                      {component.owner.name ?? messages.profilePage.defaultName}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {component.screenshots[0] ? (
            <Card className="overflow-hidden rounded-[1.8rem] border border-black/6 bg-[#0f0f10] shadow-[0_32px_80px_-48px_rgba(22,18,12,0.5)] sm:rounded-[2rem]">
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
