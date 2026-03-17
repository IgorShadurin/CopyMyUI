import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft, Save, Sparkles } from "lucide-react";

import { PageNotice } from "@/components/page-notice";
import { AppActionButton } from "@/components/ui/app-action-button";
import { AppActionLink } from "@/components/ui/app-action-link";
import { getI18n, translateCategory } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { updateAdminComponentAction } from "@/lib/actions/admin-actions";
import { createPageMetadata } from "@/lib/seo";
import {
  getAdminComponentEditorData,
  listCategories,
} from "@/lib/server/component-service";
import { requireAdmin } from "@/lib/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();

  return createPageMetadata({
    locale,
    path: "/admin/components",
    title: messages.adminComponentsPage.editTitle,
    description: messages.adminComponentsPage.editDescription,
    noIndex: true,
  });
}

export default async function AdminComponentEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ componentId: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const { locale, messages } = await getI18n();
  await requireAdmin();
  const query = await searchParams;
  const { componentId } = await params;
  const [component, categories] = await Promise.all([
    getAdminComponentEditorData(componentId),
    listCategories(),
  ]);

  if (!component) {
    redirect(withLocalePath(locale, "/admin/components"));
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] space-y-4 px-2 py-6 sm:px-3 lg:px-4">
      {query.updated === "1" ? (
        <PageNotice tone="success" message={messages.adminComponentsPage.noticeUpdated} />
      ) : null}
      {query.error ? <PageNotice tone="info" message={query.error} /> : null}

      <section className="rounded-xl border border-black/8 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {messages.adminComponentsPage.eyebrow}
            </p>
            <h1 className="mt-1 inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              <Sparkles className="size-5 text-muted-foreground sm:size-6" />
              {messages.adminComponentsPage.editTitle}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {messages.adminComponentsPage.editDescription}
            </p>
          </div>
          <AppActionLink
            href={withLocalePath(locale, "/admin/components")}
            uiSize="sm"
            tone="outline"
            icon={<ArrowLeft className="size-4" />}
          >
            {messages.adminComponentsPage.backAction}
          </AppActionLink>
        </div>
        <hr className="my-4 border-black/6" />

        <form
          action={updateAdminComponentAction.bind(null, component.id)}
          className="grid gap-4"
        >
          <div>
            <label
              htmlFor="admin-component-title"
              className="block text-sm font-medium text-foreground"
            >
              {messages.editor.componentTitle}
            </label>
            <input
              id="admin-component-title"
              type="text"
              name="title"
              defaultValue={component.title}
              className="mt-1 h-10 w-full rounded-md border border-black/12 bg-white px-3 text-sm outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="admin-component-summary"
              className="block text-sm font-medium text-foreground"
            >
              {messages.editor.summary}
            </label>
            <textarea
              id="admin-component-summary"
              name="summary"
              defaultValue={component.summary}
              className="mt-1 min-h-24 w-full rounded-md border border-black/12 bg-white px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="admin-component-primary-category"
                className="block text-sm font-medium text-foreground"
              >
                {messages.moderationForm.primaryCategory}
              </label>
              <select
                id="admin-component-primary-category"
                name="primaryCategoryId"
                defaultValue={component.primaryCategoryId}
                className="mt-1 h-10 w-full rounded-md border border-black/12 bg-white px-3 text-sm outline-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {translateCategory(category, messages, locale).name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 rounded-md border border-black/10 bg-[rgba(252,251,247,0.8)] px-3 py-2 text-sm font-medium text-foreground sm:mt-6">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={component.featured}
                className="size-4 rounded border-black/20"
              />
              {messages.adminComponentsPage.featuredLabel}
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AppActionButton type="submit" uiSize="sm" icon={<Save className="size-4" />}>
              {messages.adminComponentsPage.saveAction}
            </AppActionButton>
          </div>
        </form>
      </section>
    </main>
  );
}
