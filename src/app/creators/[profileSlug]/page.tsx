import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComponentCard } from "@/components/component-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getI18n } from "@/i18n/server";
import { createPageMetadata } from "@/lib/seo";
import { getPublicCreatorProfile } from "@/lib/server/marketplace-service";
import { getViewer } from "@/lib/viewer";

function profileTitle(name: string | null) {
  return name ? `${name} · CopyMyUI` : "Creator · CopyMyUI";
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
  params: Promise<{ profileSlug: string }>;
}): Promise<Metadata> {
  const { locale, messages } = await getI18n();
  const { profileSlug } = await params;
  const creator = await getPublicCreatorProfile(profileSlug, null);

  if (!creator) {
    return {};
  }

  return createPageMetadata({
    locale,
    path: `/creators/${creator.profileSlug}`,
    title: profileTitle(creator.name),
    description: `${creator.componentCount} ${messages.profilePage.componentCount.toLowerCase()} · ${messages.profilePage.description}`,
    keywords: [
      "SwiftUI creator profile",
      creator.name ?? "SwiftUI creator",
      "CopyMyUI creator components",
      "SwiftUI portfolio",
      "CopyMyUI",
    ],
    imagePath: creator.image ?? creator.components[0]?.previewImage ?? "/seed-screenshots/aurora-tab-orbit-full.jpg",
    type: "profile",
  });
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ profileSlug: string }>;
}) {
  const { messages } = await getI18n();
  const viewer = await getViewer();
  const { profileSlug } = await params;
  const creator = await getPublicCreatorProfile(profileSlug, viewer?.id);

  if (!creator) {
    notFound();
  }

  const freeComponents = creator.components.filter(
    (component) => component.accessType === "FREE"
  );
  const premiumComponents = creator.components.filter(
    (component) => component.accessType === "PREMIUM"
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 md:py-14">
      <section className="rounded-[2.2rem] border border-black/6 bg-white/88 p-5 shadow-[0_40px_100px_-50px_rgba(22,18,12,0.6)] backdrop-blur sm:rounded-[2.8rem] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar size="lg" className="size-20 border border-black/6 bg-[linear-gradient(135deg,#fff8ea_0%,#ffffff_56%,#ecfeff_100%)] shadow-sm sm:size-24">
              <AvatarImage
                src={creator.image ?? undefined}
                alt={creator.name ?? messages.profilePage.defaultName}
              />
              <AvatarFallback className="bg-transparent text-2xl font-semibold text-foreground sm:text-3xl">
                {initials(creator.name)}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                {messages.profilePage.eyebrow}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
                {creator.name ?? messages.profilePage.defaultName}
              </h1>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                /{creator.profileSlug}
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {messages.profilePage.description}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[18rem]">
            <div className="rounded-[1.6rem] border border-black/6 bg-[rgba(252,251,247,0.96)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {messages.profilePage.componentCount}
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{creator.componentCount}</p>
            </div>
            <div className="rounded-[1.6rem] border border-black/6 bg-[rgba(252,251,247,0.96)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {messages.profilePage.premiumCount}
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{creator.premiumCount}</p>
            </div>
          </div>
        </div>
      </section>

      {freeComponents.length > 0 ? (
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {messages.profilePage.freeSectionEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {messages.profilePage.freeSectionTitle}
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {freeComponents.map((component) => (
              <ComponentCard key={component.id} component={component} />
            ))}
          </div>
        </section>
      ) : null}

      {premiumComponents.length > 0 ? (
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {messages.profilePage.premiumSectionEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {messages.profilePage.premiumSectionTitle}
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {premiumComponents.map((component) => (
              <ComponentCard key={component.id} component={component} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
