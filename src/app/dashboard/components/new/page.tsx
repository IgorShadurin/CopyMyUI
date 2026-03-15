import type { Metadata } from "next";

import { ComponentEditorForm } from "@/components/component-editor-form";
import { PageNotice } from "@/components/page-notice";
import { ComponentAccessType } from "@prisma/client";
import { getI18n, translateCategory } from "@/i18n/server";
import { createComponentFormAction } from "@/lib/actions/component-actions";
import { createPageMetadata } from "@/lib/seo";
import { listCategories } from "@/lib/server/component-service";
import { requireViewer } from "@/lib/viewer";

const starterSwiftCode = `import SwiftUI

struct BrightComponentPreview: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Bright Component Preview")
                .font(.system(size: 32, weight: .bold, design: .rounded))

            Text("Describe what the component does and why it is useful.")
                .foregroundStyle(.secondary)

            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [.orange.opacity(0.25), .white],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 260)
        }
        .padding(24)
    }
}
`;

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
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-14">
      {params.saved === "1" ? (
        <PageNotice tone="success" message={messages.newComponentPage.noticeSaved} />
      ) : null}

      <section className="rounded-[2.2rem] border border-black/6 bg-white/85 p-5 shadow-[0_35px_90px_-45px_rgba(22,18,12,0.55)] backdrop-blur sm:rounded-[2.6rem] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {messages.newComponentPage.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
          {messages.newComponentPage.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          {messages.newComponentPage.description}
        </p>
      </section>

      <ComponentEditorForm
        action={createComponentFormAction}
        categories={categories.map((category) => ({
          ...category,
          name: translateCategory(category, messages, locale).name,
        }))}
        defaults={{
          title: "",
          primaryCategoryId: categories[0]?.id ?? "",
          categoryIds: categories[0] ? [categories[0].id] : [],
          summary: "",
          description: "",
          changelog: "",
          accessType: ComponentAccessType.FREE,
          sellerTargetPriceUsd: "",
          swiftCode: starterSwiftCode,
          screenshots: [],
        }}
      />
    </main>
  );
}
