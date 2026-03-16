import type { Metadata } from "next";

import { ApiKeysPanel } from "@/components/api-keys-panel";
import { DashboardShell } from "@/components/dashboard-shell";
import { getI18n } from "@/i18n/server";
import { createPageMetadata } from "@/lib/seo";
import { listApiKeysForUser } from "@/lib/server/api-key-service";
import { requireViewer } from "@/lib/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();

  return createPageMetadata({
    locale,
    path: "/dashboard/api-keys",
    title: messages.apiKeys.title,
    description: messages.apiKeys.description,
    noIndex: true,
  });
}

export default async function DashboardApiKeysPage() {
  const { locale, messages } = await getI18n();
  const viewer = await requireViewer();
  const apiKeys = await listApiKeysForUser(viewer.id);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
      <DashboardShell locale={locale} messages={messages} activeSection="api-keys">
        <section id="api-keys">
          <ApiKeysPanel initialApiKeys={apiKeys} />
        </section>
      </DashboardShell>
    </main>
  );
}
