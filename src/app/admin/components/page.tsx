import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft, Eye, Pencil, Sparkles } from "lucide-react";

import { AdminBulkActionsForm } from "@/components/admin-bulk-actions-form";
import { AdminComponentActions } from "@/components/admin-component-actions";
import { PageNotice } from "@/components/page-notice";
import { StatusBadge } from "@/components/status-badge";
import { AppActionLink } from "@/components/ui/app-action-link";
import { getI18n, translateCategory } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { CategoryIcon } from "@/lib/category-icons";
import { createPageMetadata } from "@/lib/seo";
import { getAdminComponentsByCategory } from "@/lib/server/component-service";
import { requireAdmin } from "@/lib/viewer";

const ADMIN_BULK_ACTIONS_FORM_ID = "admin-components-bulk-actions";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();

  return createPageMetadata({
    locale,
    path: "/admin/components",
    title: messages.adminComponentsPage.title,
    description: messages.adminComponentsPage.description,
    noIndex: true,
  });
}

export default async function AdminComponentsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const { locale, messages } = await getI18n();
  await requireAdmin();
  const query = await searchParams;
  const categoriesWithComponents = await getAdminComponentsByCategory();

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-4 px-2 py-6 sm:px-3 lg:px-4">
      {query.updated === "1" ? (
        <PageNotice tone="success" message={messages.adminComponentsPage.noticeUpdated} />
      ) : null}
      {query.updated === "declined" ? (
        <PageNotice tone="success" message={messages.adminComponentsPage.noticeDeclined} />
      ) : null}
      {query.updated === "deleted" ? (
        <PageNotice tone="success" message={messages.adminComponentsPage.noticeDeleted} />
      ) : null}
      {query.updated === "bulk-declined" ? (
        <PageNotice tone="success" message={messages.adminComponentsPage.noticeBulkDeclined} />
      ) : null}
      {query.updated === "bulk-deleted" ? (
        <PageNotice tone="success" message={messages.adminComponentsPage.noticeBulkDeleted} />
      ) : null}
      {query.error ? <PageNotice tone="info" message={query.error} /> : null}

      <section className="rounded-xl border border-black/8 bg-white p-4">
        <div className="flex flex-wrap items-start gap-3">
          <div>
            <AppActionLink
              href={withLocalePath(locale, "/admin")}
              uiSize="sm"
              tone="outline"
              icon={<ArrowLeft className="size-4" />}
              aria-label={messages.adminComponentsPage.backToAdmin}
              title={messages.adminComponentsPage.backToAdmin}
              className="mb-2 w-9 justify-center px-0"
            >
              <span className="sr-only">{messages.adminComponentsPage.backToAdmin}</span>
            </AppActionLink>
            <h1 className="mt-1 inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              <Sparkles className="size-5 text-muted-foreground sm:size-6" />
              {messages.adminComponentsPage.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {messages.adminComponentsPage.description}
            </p>
          </div>
        </div>
        <hr className="my-4 border-black/6" />

        <div className="space-y-4">
          <AdminBulkActionsForm
            formId={ADMIN_BULK_ACTIONS_FORM_ID}
            actionLabel={messages.adminComponentsPage.bulkActionLabel}
            actionPlaceholder={messages.adminComponentsPage.bulkActionPlaceholder}
            declineLabel={messages.adminComponentsPage.bulkDeclineAction}
            deleteLabel={messages.adminComponentsPage.bulkDeleteAction}
            applyLabel={messages.adminComponentsPage.bulkApplyAction}
            selectedCountLabel={messages.adminComponentsPage.bulkSelectedCount}
            selectionRequiredMessage={
              messages.adminComponentsPage.bulkSelectionRequired
            }
            actionRequiredMessage={messages.adminComponentsPage.bulkActionRequired}
            confirmDeclineMessage={
              messages.adminComponentsPage.confirmBulkDeclineAction
            }
            confirmDeleteMessage={messages.adminComponentsPage.confirmBulkDeleteAction}
          />

          {categoriesWithComponents.map(({ category, components }) => {
            const translatedCategory = translateCategory(category, messages, locale);

            return (
              <section
                key={category.id}
                className="rounded-lg border border-black/8 bg-[rgba(252,251,247,0.78)] p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
                    <CategoryIcon slug={category.slug} className="size-5 text-muted-foreground" />
                    {translatedCategory.name}
                  </h2>
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
                    {messages.adminComponentsPage.countLabel} {components.length}
                  </span>
                </div>

                {components.length === 0 ? (
                  <p className="mt-3 rounded-md border border-black/8 bg-white px-3 py-2 text-sm text-muted-foreground">
                    {messages.adminComponentsPage.emptyCategory}
                  </p>
                ) : (
                  <div className="mt-3 grid gap-3">
                    {components.map((component) => (
                      <article
                        key={component.id}
                        className="rounded-lg border border-black/8 bg-white p-3"
                      >
                        <div className="flex items-start gap-3">
                          <label className="pt-1">
                            <input
                              type="checkbox"
                              form={ADMIN_BULK_ACTIONS_FORM_ID}
                              name="componentIds"
                              value={component.id}
                              className="size-4 rounded border-black/20"
                              aria-label={`${messages.adminComponentsPage.selectComponentAria} ${component.title}`}
                            />
                          </label>

                          <div className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-md border border-black/10 bg-black">
                            {component.previewImage ? (
                              <Image
                                src={component.previewImage}
                                alt={component.title}
                                fill
                                sizes="72px"
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center bg-black px-1 text-center text-[10px] font-medium leading-tight text-white/70">
                                {messages.componentCard.screenshotComingSoon}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge status={component.status} />
                              {component.accessType === "PREMIUM" ? (
                                <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                                  {messages.componentCard.premium}
                                </span>
                              ) : null}
                            </div>

                            <h3 className="mt-2 text-lg font-semibold text-foreground">
                              {component.title}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {component.summary}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {messages.common.by} {component.owner.name ?? component.owner.email} ·{" "}
                              {messages.adminComponentsPage.favoritesLabel} {component.favoritesCount}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <AppActionLink
                                href={withLocalePath(
                                  locale,
                                  `/admin/components/${component.id}/edit`
                                )}
                                uiSize="sm"
                                tone="outline"
                                icon={<Pencil className="size-4" />}
                              >
                                {messages.adminComponentsPage.editAction}
                              </AppActionLink>

                              <AdminComponentActions
                                componentId={component.id}
                                declineLabel={messages.adminComponentsPage.declineAction}
                                deleteLabel={messages.adminComponentsPage.deleteAction}
                                declineConfirmMessage={
                                  messages.adminComponentsPage.confirmDeclineAction
                                }
                                deleteConfirmMessage={
                                  messages.adminComponentsPage.confirmDeleteAction
                                }
                              />

                              {component.hasApprovedRevision ? (
                                <AppActionLink
                                  href={withLocalePath(locale, `/components/${component.slug}`)}
                                  uiSize="sm"
                                  tone="ghost"
                                  icon={<Eye className="size-4" />}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {messages.adminComponentsPage.viewPublicAction}
                                </AppActionLink>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
