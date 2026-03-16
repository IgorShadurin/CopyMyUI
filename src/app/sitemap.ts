import type { MetadataRoute } from "next";

import { defaultLocale, locales } from "@/i18n/config";
import { withLocalePath } from "@/i18n/routing";
import { getBaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

function absoluteUrl(path: string) {
  return new URL(path, getBaseUrl()).toString();
}

function localizedEntries(
  path: string,
  {
    lastModified,
    changeFrequency,
    priority,
  }: {
    lastModified?: Date;
    changeFrequency: ChangeFrequency;
    priority: number;
  }
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(withLocalePath(locale, path))])
  );
  languages["x-default"] = absoluteUrl(withLocalePath(defaultLocale, path));

  return locales.map((locale) => ({
    url: absoluteUrl(withLocalePath(locale, path)),
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages,
    },
  }));
}

function isMissingTableError(error: unknown) {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    typeof (error as { code?: unknown }).code !== "string"
  ) {
    return false;
  }

  const code = (error as { code: string }).code;
  return code === "P2021" || code === "P2022";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    ...localizedEntries("/", {
      changeFrequency: "daily",
      priority: 1,
    }),
    ...localizedEntries("/components", {
      changeFrequency: "daily",
      priority: 0.95,
    }),
  ];

  let categories: Array<{ slug: string; updatedAt: Date }> = [];
  let components: Array<{ slug: string; updatedAt: Date; publishedAt: Date | null }> = [];
  let creators: Array<{ profileSlug: string | null; updatedAt: Date }> = [];

  try {
    [categories, components, creators] = await Promise.all([
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
      prisma.component.findMany({
        where: {
          approvedRevisionId: { not: null },
        },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
      prisma.user.findMany({
        where: {
          profileSlug: { not: null },
          ownedComponents: {
            some: {
              approvedRevisionId: { not: null },
            },
          },
        },
        select: { profileSlug: true, updatedAt: true },
      }),
    ]);
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }

    return entries;
  }

  for (const category of categories) {
    entries.push(
      ...localizedEntries(`/categories/${category.slug}`, {
        lastModified: category.updatedAt,
        changeFrequency: "daily",
        priority: 0.85,
      })
    );
  }

  for (const component of components) {
    entries.push(
      ...localizedEntries(`/components/${component.slug}`, {
        lastModified: component.publishedAt ?? component.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      })
    );
  }

  for (const creator of creators) {
    if (!creator.profileSlug) {
      continue;
    }

    entries.push(
      ...localizedEntries(`/creators/${creator.profileSlug}`, {
        lastModified: creator.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      })
    );
  }

  return entries;
}
