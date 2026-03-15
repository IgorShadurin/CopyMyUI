import Image from "next/image";
import type { Metadata } from "next";
import { ModerationDecision } from "@prisma/client";

import { EmptyState } from "@/components/empty-state";
import { ModerationDecisionForm } from "@/components/moderation-decision-form";
import { PageNotice } from "@/components/page-notice";
import { StatusBadge } from "@/components/status-badge";
import { getI18n, translateCategory } from "@/i18n/server";
import { Card, CardContent } from "@/components/ui/card";
import { reviewComponentAction } from "@/lib/actions/component-actions";
import {
  getModerationQueue,
  listCategories,
} from "@/lib/server/component-service";
import { createPageMetadata } from "@/lib/seo";
import { requireModerator } from "@/lib/viewer";

function getPreviewImageUrl(
  screenshots: Array<{
    mediaType?: "IMAGE" | "VIDEO" | null;
    mimeType?: string | null;
    url: string;
    previewUrl?: string | null;
  }>
) {
  const firstImage = screenshots.find(
    (screenshot) =>
      screenshot.mediaType !== "VIDEO" &&
      !screenshot.mimeType?.startsWith("video/")
  );

  return firstImage?.previewUrl ?? firstImage?.url ?? "/seed-screenshots/aurora-tab-orbit.svg";
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();

  return createPageMetadata({
    locale,
    path: "/moderation",
    title: messages.moderationPage.title,
    description: messages.moderationPage.description,
    noIndex: true,
  });
}

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ decision?: string }>;
}) {
  const { locale, messages } = await getI18n();
  await requireModerator();
  const params = await searchParams;
  const [queue, categories] = await Promise.all([
    getModerationQueue(),
    listCategories(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 md:py-14">
      {params.decision === "approved" ? (
        <PageNotice tone="success" message={messages.moderationPage.noticeApproved} />
      ) : null}
      {params.decision === "declined" ? (
        <PageNotice tone="info" message={messages.moderationPage.noticeDeclined} />
      ) : null}

      <section className="rounded-[2.2rem] border border-black/6 bg-white/85 p-5 shadow-[0_35px_90px_-45px_rgba(22,18,12,0.55)] backdrop-blur sm:rounded-[2.6rem] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {messages.moderationPage.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
          {messages.moderationPage.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          {messages.moderationPage.description}
        </p>
      </section>

      {queue.length > 0 ? (
        <section className="grid gap-8">
          {queue.map((item) => (
            <Card
              key={item.id}
              data-testid={`moderation-component-${item.slug}`}
              className="rounded-[1.8rem] border border-black/6 bg-white/90 shadow-[0_32px_80px_-48px_rgba(22,18,12,0.5)] sm:rounded-[2rem]"
            >
              <CardContent className="grid gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={item.pendingRevision?.status ?? "PENDING_REVIEW"} />
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {translateCategory(item.category, messages, locale).name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {messages.common.by} {item.owner.name ?? item.owner.email}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                      {item.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {item.summary}
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        {messages.moderationPage.pendingRevision}
                      </p>
                        <div className="mt-3 overflow-hidden rounded-[1.5rem] border border-black/6">
                          <Image
                            src={getPreviewImageUrl(item.screenshots)}
                            alt={item.title}
                            width={1600}
                            height={1000}
                          unoptimized
                          className="aspect-[16/10] w-full object-cover"
                        />
                      </div>
                    </div>
                    {item.publicRevision ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                          {messages.moderationPage.currentPublicVersion}
                        </p>
                        <div className="mt-3 overflow-hidden rounded-[1.5rem] border border-black/6">
                          <Image
                            src={getPreviewImageUrl(item.publicRevision.screenshots)}
                            alt={item.publicRevision.title}
                            width={1600}
                            height={1000}
                            unoptimized
                            className="aspect-[16/10] w-full object-cover"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-black/6 bg-[rgba(252,251,247,0.95)] p-5">
                  <ModerationDecisionForm
                    approveAction={reviewComponentAction.bind(
                      null,
                      item.id,
                      ModerationDecision.APPROVED
                    )}
                    declineAction={reviewComponentAction.bind(
                      null,
                      item.id,
                      ModerationDecision.DECLINED
                    )}
                    categories={categories.map((category) => ({
                      id: category.id,
                      name: translateCategory(category, messages, locale).name,
                    }))}
                    defaultPrimaryCategoryId={item.primaryCategoryId}
                    defaultCategoryIds={item.categoryIds}
                  />
                  <div className="mt-6 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {messages.moderationPage.revisionHistory}
                    </p>
                    <div className="space-y-3">
                      {item.history.map((revision) => (
                        <div
                          key={revision.id}
                          className="rounded-[1.2rem] border border-black/6 bg-white px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-medium text-foreground">
                              {messages.common.version} {revision.version}
                            </p>
                            <StatusBadge status={revision.status} />
                          </div>
                          {revision.reviewNote ? (
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                              {revision.reviewNote}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
        <EmptyState
          eyebrow={messages.moderationPage.queueClearEyebrow}
          title={messages.moderationPage.queueClearTitle}
          description={messages.moderationPage.queueClearDescription}
        />
      )}
    </main>
  );
}
