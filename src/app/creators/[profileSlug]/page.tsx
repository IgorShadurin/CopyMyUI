import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Crown, Layers3 } from "lucide-react";

import { ComponentCardList } from "@/components/component-card-list";
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AppLocale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/routing";
import { getI18n, translateCategory } from "@/i18n/server";
import { createPageMetadata, getAbsoluteLocaleUrl } from "@/lib/seo";
import { getPublicCreatorProfile } from "@/lib/server/marketplace-service";
import {
  buildBreadcrumbListJsonLd,
  buildCollectionPageJsonLd,
  serializeJsonLd,
} from "@/lib/structured-data";
import { getViewer } from "@/lib/viewer";

const CREATOR_COMPONENTS_PAGE_SIZE = 48;

function profileTitle(name: string | null) {
  return name ? `${name} · CopyMyUI` : "Creator · CopyMyUI";
}

function parsePageParam(pageValue: string | undefined) {
  if (!pageValue) {
    return 1;
  }

  const parsed = Number.parseInt(pageValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildCreatorPageHref(
  locale: AppLocale,
  profileSlug: string,
  page: number
) {
  if (page <= 1) {
    return withLocalePath(locale, `/creators/${profileSlug}`);
  }

  const searchParams = new URLSearchParams({ page: String(page) });
  return withLocalePath(
    locale,
    `/creators/${profileSlug}?${searchParams.toString()}`
  );
}

function buildCreatorPagePath(profileSlug: string, page: number) {
  if (page <= 1) {
    return `/creators/${profileSlug}`;
  }

  const searchParams = new URLSearchParams({ page: String(page) });
  return `/creators/${profileSlug}?${searchParams.toString()}`;
}

function getPaginationTokens(currentPage: number, totalPages: number) {
  const tokens: Array<number | "ellipsis-left" | "ellipsis-right"> = [];

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) {
      tokens.push(page);
    }
    return tokens;
  }

  tokens.push(1);

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    tokens.push("ellipsis-left");
  }

  for (let page = start; page <= end; page += 1) {
    tokens.push(page);
  }

  if (end < totalPages - 1) {
    tokens.push("ellipsis-right");
  }

  tokens.push(totalPages);

  return tokens;
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
  searchParams,
}: {
  params: Promise<{ profileSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { locale, messages } = await getI18n();
  const { profileSlug } = await params;
  const query = await searchParams;
  const currentPage = parsePageParam(query.page);
  const creator = await getPublicCreatorProfile(profileSlug, null);

  if (!creator) {
    return {};
  }

  const pageSuffix =
    currentPage > 1
      ? ` · ${messages.categoryPage.paginationPage} ${currentPage}`
      : "";

  return createPageMetadata({
    locale,
    path: buildCreatorPagePath(profileSlug, currentPage),
    title: `${profileTitle(creator.name)}${pageSuffix}`,
    description: `${messages.profilePage.description} ${messages.profilePage.componentCount}: ${creator.componentCount}. ${messages.profilePage.premiumCount}: ${creator.premiumCount}.`,
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
  searchParams,
}: {
  params: Promise<{ profileSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, messages } = await getI18n();
  const viewer = await getViewer();
  const { profileSlug } = await params;
  const query = await searchParams;
  const requestedPage = parsePageParam(query.page);
  if (query.page && requestedPage === 1) {
    redirect(withLocalePath(locale, `/creators/${profileSlug}`));
  }
  const creator = await getPublicCreatorProfile(profileSlug, viewer?.id);

  if (!creator) {
    notFound();
  }

  const totalCount = creator.components.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / CREATOR_COMPONENTS_PAGE_SIZE)
  );
  if (requestedPage > totalPages) {
    notFound();
  }
  const currentPage = requestedPage;
  const pagedComponents = creator.components.slice(
    (currentPage - 1) * CREATOR_COMPONENTS_PAGE_SIZE,
    currentPage * CREATOR_COMPONENTS_PAGE_SIZE
  );

  const freeComponents = pagedComponents.filter(
    (component) => component.accessType === "FREE"
  );
  const premiumComponents = pagedComponents.filter(
    (component) => component.accessType === "PREMIUM"
  );
  const groupedSections = [
    {
      key: "free",
      title: messages.profilePage.freeSectionTitle,
      icon: <Layers3 className="size-6 text-muted-foreground" />,
      components: freeComponents,
    },
    {
      key: "premium",
      title: messages.profilePage.premiumSectionTitle,
      icon: <Crown className="size-6 text-muted-foreground" />,
      components: premiumComponents,
    },
  ].filter((section) => section.components.length > 0);
  const profilePath = buildCreatorPagePath(profileSlug, currentPage);
  const breadcrumbItems = [
    { name: "CopyMyUI", path: "/" },
    { name: messages.explorePage.title, path: "/components" },
    { name: creator.name ?? messages.profilePage.defaultName, path: profilePath },
  ];
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(locale, breadcrumbItems);
  const collectionJsonLd = buildCollectionPageJsonLd({
    locale,
    path: profilePath,
    name: profileTitle(creator.name),
    description: messages.profilePage.description,
    itemUrls: pagedComponents
      .slice(0, 12)
      .map((component) => getAbsoluteLocaleUrl(locale, `/components/${component.slug}`)),
  });
  const creatorCategoryCounts = new Map<string, { label: string; count: number }>();
  for (const component of creator.components) {
    for (const category of component.categories) {
      const key = category.slug;
      const existing = creatorCategoryCounts.get(key);
      const categoryLabel = translateCategory(category, messages, locale).name;
      creatorCategoryCounts.set(key, {
        label: categoryLabel,
        count: (existing?.count ?? 0) + 1,
      });
    }
  }
  const topCreatorCategories = Array.from(creatorCategoryCounts.entries())
    .sort((left, right) => right[1].count - left[1].count)
    .slice(0, 6);
  const freeCount = Math.max(0, creator.componentCount - creator.premiumCount);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 md:py-14">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([breadcrumbJsonLd, collectionJsonLd]),
        }}
      />
      <section className="rounded-[2.2rem] border border-black/6 bg-white/88 p-5 shadow-[0_40px_100px_-50px_rgba(22,18,12,0.6)] backdrop-blur sm:rounded-[2.8rem] sm:p-8">
        <SeoBreadcrumbs
          items={[
            { label: "CopyMyUI", href: withLocalePath(locale, "/") },
            { label: messages.explorePage.title, href: withLocalePath(locale, "/components") },
            { label: creator.name ?? messages.profilePage.defaultName },
          ]}
        />
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
            <div className="mt-4 rounded-[1.1rem] border border-black/8 bg-white/78 p-3">
              <p className="text-sm text-muted-foreground">
                {messages.profilePage.componentCount}:{" "}
                <span className="font-semibold text-foreground">{creator.componentCount}</span> ·{" "}
                {messages.profilePage.premiumCount}:{" "}
                <span className="font-semibold text-foreground">{creator.premiumCount}</span> ·{" "}
                {messages.profilePage.freeSectionTitle}:{" "}
                <span className="font-semibold text-foreground">{freeCount}</span>
              </p>
              {topCreatorCategories.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {topCreatorCategories.map(([slug, data]) => (
                    <Link
                      key={slug}
                      href={withLocalePath(locale, `/categories/${slug}`)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span>{data.label}</span>
                      <span className="text-foreground">({data.count})</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {groupedSections.length > 0 ? (
          <div className="mt-8 border-t border-black/6 pt-6">
            <div className="space-y-8">
              {groupedSections.map((section, index) => (
                <section
                  key={section.key}
                  className={index > 0 ? "border-t border-black/6 pt-8" : ""}
                >
                  <div className="mb-6">
                    <h2 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                      {section.icon}
                      <span>{section.title}</span>
                    </h2>
                  </div>
                  <ComponentCardList
                    components={section.components}
                    className="gap-6 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3"
                  />
                </section>
              ))}
            </div>
          </div>
        ) : null}

        {totalCount > 0 ? (
          <div className="mt-8 border-t border-black/8 pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {messages.categoryPage.approvedCount}:{" "}
                <span className="font-semibold text-foreground">{totalCount}</span>
              </p>
              <div className="flex items-center gap-2">
                {totalPages > 1 ? (
                  <Pagination className="w-auto">
                    <PaginationContent>
                      {currentPage > 1 ? (
                        <PaginationItem>
                          <PaginationPrevious
                            href={buildCreatorPageHref(
                              locale,
                              profileSlug,
                              currentPage - 1
                            )}
                            aria-label={messages.categoryPage.paginationPrevious}
                          >
                            {messages.categoryPage.paginationPrevious}
                          </PaginationPrevious>
                        </PaginationItem>
                      ) : null}
                      {getPaginationTokens(currentPage, totalPages).map((token) => {
                        if (typeof token !== "number") {
                          return (
                            <PaginationItem key={token}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        return (
                          <PaginationItem key={token}>
                            <PaginationLink
                              href={buildCreatorPageHref(
                                locale,
                                profileSlug,
                                token
                              )}
                              isActive={token === currentPage}
                              aria-label={`${messages.categoryPage.paginationPage} ${token}`}
                            >
                              {token}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      {currentPage < totalPages ? (
                        <PaginationItem>
                          <PaginationNext
                            href={buildCreatorPageHref(
                              locale,
                              profileSlug,
                              currentPage + 1
                            )}
                            aria-label={messages.categoryPage.paginationNext}
                          >
                            {messages.categoryPage.paginationNext}
                          </PaginationNext>
                        </PaginationItem>
                      ) : null}
                    </PaginationContent>
                  </Pagination>
                ) : (
                  <span className="rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                    1 / 1
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 border-t border-black/6 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[rgba(252,251,247,0.96)] px-3 py-1.5 text-sm font-medium text-foreground">
              <span className="text-muted-foreground">{messages.profilePage.componentCount}:</span>
              <span>{creator.componentCount}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[rgba(252,251,247,0.96)] px-3 py-1.5 text-sm font-medium text-foreground">
              <span className="text-muted-foreground">{messages.profilePage.premiumCount}:</span>
              <span>{creator.premiumCount}</span>
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
