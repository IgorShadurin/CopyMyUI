import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  listInclude,
  toPublicCard,
} from "@/lib/server/component-service";
import { getPlatformConfig } from "@/lib/server/platform-service";
import type { CategoryAdminInput } from "@/lib/validation/category";

const categoryInclude = {
  translations: true,
  _count: {
    select: {
      componentLinks: true,
      primaryForComponents: true,
    },
  },
} satisfies Prisma.CategoryInclude;

export async function listAdminCategories() {
  return prisma.category.findMany({
    include: categoryInclude,
    orderBy: {
      name: "asc",
    },
  });
}

export async function updateCategoryByAdmin(
  _adminId: string,
  input: CategoryAdminInput
) {
  return prisma.category.update({
    where: {
      id: input.categoryId,
    },
    data: {
      name: input.name,
      slug: input.slug,
      accent: input.accent,
      description: input.description,
      translations: {
        upsert: {
          where: {
            categoryId_locale: {
              categoryId: input.categoryId,
              locale: "en",
            },
          },
          update: {
            name: input.name,
            description: input.description,
          },
          create: {
            locale: "en",
            name: input.name,
            description: input.description,
          },
        },
      },
    },
  });
}

export async function getPublicCategoryPageData(
  slug: string,
  viewerId?: string | null
) {
  const platformConfig = await getPlatformConfig();
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      translations: true,
    },
  });

  if (!category) {
    return null;
  }

  const components = await prisma.component.findMany({
    where: {
      approvedRevisionId: { not: null },
      categoryLinks: {
        some: {
          categoryId: category.id,
        },
      },
    },
    orderBy: [{ favoritesCount: "desc" }, { publishedAt: "desc" }],
    include: listInclude,
  });

  const cards = components.map((component) =>
    toPublicCard(component, platformConfig.premiumMarkupPercent, viewerId)
  );

  return {
    category,
    components: cards,
    stats: {
      approvedCount: cards.length,
      premiumCount: cards.filter((component) => component.accessType === "PREMIUM").length,
      featuredCount: cards.filter((component) => component.featured).length,
    },
  };
}
