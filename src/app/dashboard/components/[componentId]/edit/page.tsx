import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ComponentAccessType } from "@prisma/client";

import { ComponentEditorForm } from "@/components/component-editor-form";
import { PageNotice } from "@/components/page-notice";
import { getI18n, translateCategory } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { updateComponentFormAction } from "@/lib/actions/component-actions";
import { createPageMetadata } from "@/lib/seo";
import {
  getDraftEditorData,
  listCategories,
} from "@/lib/server/component-service";
import { requireViewer } from "@/lib/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();

  return createPageMetadata({
    locale,
    path: "/dashboard/components",
    title: messages.editComponentPage.eyebrow,
    description: messages.editComponentPage.description,
    noIndex: true,
  });
}

export default async function EditComponentPage({
  params,
  searchParams,
}: {
  params: Promise<{ componentId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { locale, messages } = await getI18n();
  const viewer = await requireViewer();
  const { componentId } = await params;
  const query = await searchParams;
  const [component, categories] = await Promise.all([
    getDraftEditorData(componentId, viewer.id),
    listCategories(),
  ]);

  if (!component || !component.activeRevision) {
    redirect(withLocalePath(locale, "/dashboard"));
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-14">
      {query.saved === "1" ? (
        <PageNotice
          tone="success"
          message={messages.editComponentPage.noticeSaved}
        />
      ) : null}

      <section className="rounded-[2.2rem] border border-black/6 bg-white/85 p-5 shadow-[0_35px_90px_-45px_rgba(22,18,12,0.55)] backdrop-blur sm:rounded-[2.6rem] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {messages.editComponentPage.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
          {component.activeRevision.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          {messages.editComponentPage.description}
        </p>
      </section>

      <ComponentEditorForm
        action={updateComponentFormAction.bind(null, component.id)}
        categories={categories.map((category) => ({
          ...category,
          name: translateCategory(category, messages, locale).name,
        }))}
        categoryLocked={Boolean(component.approvedRevisionId)}
        defaults={{
          title: component.activeRevision.title,
          primaryCategoryId: component.primaryCategoryId,
          categoryIds: component.categoryIds,
          summary: component.activeRevision.summary,
          description: component.activeRevision.description,
          changelog: component.activeRevision.changelog ?? "",
          accessType: component.activeRevision.accessType ?? ComponentAccessType.FREE,
          sellerTargetPriceUsd:
            component.activeRevision.sellerTargetPriceCents !== null
              ? (component.activeRevision.sellerTargetPriceCents / 100).toFixed(2)
              : "",
          swiftCode: component.activeRevision.swiftCode,
          screenshots: component.activeRevision.screenshots.map((screenshot) => ({
            mediaType: screenshot.mediaType,
            mimeType: screenshot.mimeType,
            url: screenshot.url,
            storagePath: screenshot.storagePath,
            previewUrl: screenshot.previewUrl,
            previewStoragePath: screenshot.previewStoragePath,
            width: screenshot.width,
            height: screenshot.height,
            altText: screenshot.altText,
          })),
        }}
      />
    </main>
  );
}
