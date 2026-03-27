import { ComponentAccessType, Prisma } from "@prisma/client";

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
  viewerId?: string | null,
  options?: {
    page?: number;
    pageSize?: number;
  }
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

  const where = {
    approvedRevisionId: { not: null },
    categoryLinks: {
      some: {
        categoryId: category.id,
      },
    },
  } satisfies Prisma.ComponentWhereInput;

  const requestedPageSize = options?.pageSize ?? 8;
  const pageSize = Math.max(1, Math.min(24, requestedPageSize));
  const requestedPage = options?.page ?? 1;
  const normalizedRequestedPage = Math.max(1, Math.trunc(requestedPage));

  const [totalCount, premiumCount] = await Promise.all([
    prisma.component.count({ where }),
    prisma.component.count({
      where: {
        ...where,
        approvedRevision: {
          is: {
            accessType: ComponentAccessType.PREMIUM,
          },
        },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(normalizedRequestedPage, totalPages);

  const components = await prisma.component.findMany({
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    where: {
      ...where,
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
    premiumCount,
    pagination: {
      currentPage,
      pageSize,
      totalCount,
      totalPages,
    },
  };
}
