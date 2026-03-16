import type { Metadata } from "next";

import { FilePenLine } from "lucide-react";

import { ComponentEditorForm } from "@/components/component-editor-form";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageNotice } from "@/components/page-notice";
import { ComponentAccessType } from "@prisma/client";
import { getI18n, translateCategory } from "@/i18n/server";
import { createComponentFormAction } from "@/lib/actions/component-actions";
import { createPageMetadata } from "@/lib/seo";
import { listCategories } from "@/lib/server/component-service";
import { requireViewer } from "@/lib/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();

  return createPageMetadata({
    locale,
    path: "/dashboard/components/new",
    title: messages.newComponentPage.title,
    description: messages.newComponentPage.description,
    noIndex: true,
  });
}

export default async function NewComponentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { locale, messages } = await getI18n();
  await requireViewer();
  const params = await searchParams;
  const categories = await listCategories();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
      {params.saved === "1" ? (
        <PageNotice tone="success" message={messages.newComponentPage.noticeSaved} />
      ) : null}

      <DashboardShell
        locale={locale}
        messages={messages}
        activeSection="new-component"
      >
        <section className="rounded-[1.8rem] border border-black/6 bg-white/90 p-4 shadow-[0_24px_70px_-52px_rgba(22,18,12,0.38)] backdrop-blur sm:rounded-[2rem] sm:p-5">
          <h1 className="inline-flex items-center gap-2.5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
            <FilePenLine className="size-6 text-muted-foreground sm:size-7" />
            {messages.newComponentPage.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {messages.newComponentPage.description}
          </p>
          <div className="mt-4 border-t border-black/6 pt-4">
            <ComponentEditorForm
              action={createComponentFormAction}
              categories={categories.map((category) => ({
                ...category,
                name: translateCategory(category, messages, locale).name,
              }))}
              defaults={{
                title: "",
                primaryCategoryId: "",
                categoryIds: [],
                summary: "",
                description: "",
                changelog: "",
                accessType: ComponentAccessType.FREE,
                sellerTargetPriceUsd: "",
                swiftCode: "",
                screenshots: [],
              }}
            />
          </div>
        </section>
      </DashboardShell>
    </main>
  );
}
