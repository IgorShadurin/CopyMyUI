import Image from "next/image";
import type { Metadata } from "next";
import { ModerationDecision } from "@prisma/client";
import { ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ModerationDecisionForm } from "@/components/moderation-decision-form";
import { PageNotice } from "@/components/page-notice";
import { StatusBadge } from "@/components/status-badge";
import { getI18n, translateCategory } from "@/i18n/server";
import { Card, CardContent } from "@/components/ui/card";
import { reviewComponentAction } from "@/lib/actions/component-actions";
import { CategoryIcon } from "@/lib/category-icons";
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
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
      {params.decision === "approved" ? (
        <PageNotice tone="success" message={messages.moderationPage.noticeApproved} />
      ) : null}
      {params.decision === "declined" ? (
        <PageNotice tone="info" message={messages.moderationPage.noticeDeclined} />
      ) : null}

      <section className="rounded-[1.8rem] border border-black/6 bg-white/90 p-4 shadow-[0_24px_70px_-52px_rgba(22,18,12,0.38)] backdrop-blur sm:rounded-[2rem] sm:p-5">
        <h1 className="inline-flex items-center gap-2.5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
          <ShieldCheck className="size-6 text-muted-foreground sm:size-7" />
          {messages.moderationPage.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {messages.moderationPage.description}
        </p>
        <hr className="my-4 border-black/6" />

        {queue.length > 0 ? (
          <div className="grid gap-5">
            {queue.map((item) => {
              return (
                <Card
                  key={item.id}
                  data-testid={`moderation-component-${item.slug}`}
                  className="rounded-[1.6rem] border border-black/6 bg-white/92 shadow-[0_24px_70px_-52px_rgba(22,18,12,0.42)] sm:rounded-[1.8rem]"
                >
                  <CardContent className="grid gap-5 px-4 py-4 sm:px-5 sm:py-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={item.pendingRevision?.status ?? "PENDING_REVIEW"} />
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                          <CategoryIcon slug={item.category.slug} className="size-3.5" />
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

                    <div className="rounded-[1.6rem] border border-black/6 bg-[rgba(252,251,247,0.95)] p-5">
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
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.2rem] border border-black/6 bg-[rgba(252,251,247,0.94)] p-5 sm:p-6">
            <EmptyState
              eyebrow={messages.moderationPage.queueClearEyebrow}
              title={messages.moderationPage.queueClearTitle}
              description={messages.moderationPage.queueClearDescription}
            />
          </div>
        )}
      </section>
    </main>
  );
}
