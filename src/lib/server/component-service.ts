import slugify from "slugify";

import {
  ComponentAccessType,
  ComponentStatus,
  ModerationDecision,
  Prisma,
  RevisionMediaType,
  UserRole,
} from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  calculateBuyerPriceCents,
  calculatePlatformFeeCents,
} from "@/lib/pricing";
import { getPlatformConfig } from "@/lib/server/platform-service";
import { searchApprovedComponentIds, syncApprovedComponentSearchIndex } from "@/lib/server/search-service";
import { type Viewer } from "@/lib/viewer";
import {
  componentDraftSchema,
  isSwiftUiSource,
} from "@/lib/validation/component";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  profileSlug: true,
} satisfies Prisma.UserSelect;

const orderedScreenshots = {
  orderBy: {
    sortOrder: "asc",
  },
} satisfies Prisma.RevisionScreenshotFindManyArgs;

const categoryInclude = {
  translations: true,
} satisfies Prisma.CategoryInclude;

const orderedCategoryLinks = {
  orderBy: {
    sortOrder: "asc",
  },
  include: {
    category: {
      include: categoryInclude,
    },
  },
} satisfies Prisma.ComponentCategoryFindManyArgs;

export const listInclude = {
  primaryCategory: {
    include: categoryInclude,
  },
  categoryLinks: orderedCategoryLinks,
  owner: {
    select: publicUserSelect,
  },
  activeRevision: {
    include: {
      screenshots: orderedScreenshots,
    },
  },
  approvedRevision: {
    include: {
      screenshots: orderedScreenshots,
    },
  },
  favorites: true,
} satisfies Prisma.ComponentInclude;

const detailInclude = {
  primaryCategory: {
    include: categoryInclude,
  },
  categoryLinks: orderedCategoryLinks,
  owner: {
    select: publicUserSelect,
  },
  activeRevision: {
    include: {
      screenshots: orderedScreenshots,
      reviewer: {
        select: publicUserSelect,
      },
      moderationLogs: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          moderator: {
            select: publicUserSelect,
          },
        },
      },
    },
  },
  approvedRevision: {
    include: {
      screenshots: orderedScreenshots,
      reviewer: {
        select: publicUserSelect,
      },
    },
  },
  revisions: {
    orderBy: {
      version: "desc",
    },
    include: {
      screenshots: orderedScreenshots,
      reviewer: {
        select: publicUserSelect,
      },
      moderationLogs: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          moderator: {
            select: publicUserSelect,
          },
        },
      },
    },
  },
  favorites: true,
} satisfies Prisma.ComponentInclude;

type ListComponentRecord = Prisma.ComponentGetPayload<{
  include: typeof listInclude;
}>;

type DetailComponentRecord = Prisma.ComponentGetPayload<{
  include: typeof detailInclude;
}>;

type CategoryRecord = Prisma.CategoryGetPayload<{
  include: typeof categoryInclude;
}>;

export type DraftInput = z.infer<typeof componentDraftSchema>;

export type ComponentCard = ReturnType<typeof toPublicCard>;

function getRevisionPricing(
  revision: {
    accessType: ComponentAccessType;
    sellerTargetPriceCents: number | null;
  },
  premiumMarkupPercent: number
) {
  if (
    revision.accessType !== ComponentAccessType.PREMIUM ||
    revision.sellerTargetPriceCents === null
  ) {
    return {
      accessType: ComponentAccessType.FREE,
      sellerTargetPriceCents: null,
      salePriceCents: null,
      platformFeeCents: null,
    };
  }

  return {
    accessType: ComponentAccessType.PREMIUM,
    sellerTargetPriceCents: revision.sellerTargetPriceCents,
    salePriceCents: calculateBuyerPriceCents(
      revision.sellerTargetPriceCents,
      premiumMarkupPercent
    ),
    platformFeeCents: calculatePlatformFeeCents(
      revision.sellerTargetPriceCents,
      premiumMarkupPercent
    ),
  };
}

function assertDraftInput(input: DraftInput) {
  const parsed = componentDraftSchema.parse(input);

  if (!isSwiftUiSource(parsed.swiftCode)) {
    throw new Error(
      "SwiftUI code is required. Include `import SwiftUI`, a `View` struct, and a `body` implementation."
    );
  }

  return parsed;
}

function getOrderedCategories(component: {
  categoryLinks: Array<{ category: CategoryRecord }>;
}) {
  return component.categoryLinks.map((link) => link.category);
}

function isVideoMedia(screenshot: {
  mediaType?: RevisionMediaType | null;
  mimeType?: string | null;
}) {
  return (
    screenshot.mediaType === RevisionMediaType.VIDEO ||
    Boolean(screenshot.mimeType?.startsWith("video/"))
  );
}

function getPreviewImageUrl(
  screenshots: Array<{
    mediaType?: RevisionMediaType | null;
    mimeType?: string | null;
    url: string;
    previewUrl?: string | null;
  }>
) {
  const firstImage = screenshots.find((screenshot) => !isVideoMedia(screenshot));
  return firstImage?.previewUrl ?? firstImage?.url ?? null;
}

const LOCKED_SOURCE_PREVIEW_PERCENT = 0.08;
const LOCKED_SOURCE_PREVIEW_MIN_LINES = 8;
const LOCKED_SOURCE_PREVIEW_MAX_LINES = 80;
const LOCKED_SOURCE_PREVIEW_NOTICE =
  "// Preview only. Buy this component to unlock the full SwiftUI source.";

function getLockedSourcePreview(swiftCode: string) {
  const normalized = swiftCode.replace(/\r\n/g, "\n").trimEnd();
  const lines = normalized.split("\n");

  if (!lines.length) {
    return LOCKED_SOURCE_PREVIEW_NOTICE;
  }

  const percentLines = Math.ceil(lines.length * LOCKED_SOURCE_PREVIEW_PERCENT);
  const previewLineCount = Math.min(
    LOCKED_SOURCE_PREVIEW_MAX_LINES,
    Math.max(LOCKED_SOURCE_PREVIEW_MIN_LINES, percentLines)
  );
  const maxVisibleLines = lines.length > 1 ? lines.length - 1 : 1;
  const visibleLineCount = Math.min(previewLineCount, maxVisibleLines);
  const previewBody = lines.slice(0, visibleLineCount).join("\n").trimEnd();

  return previewBody
    ? `${LOCKED_SOURCE_PREVIEW_NOTICE}\n\n${previewBody}`
    : LOCKED_SOURCE_PREVIEW_NOTICE;
}

async function assertCategorySelectionExists(
  tx: Prisma.TransactionClient,
  primaryCategoryId: string,
  categoryIds: string[]
) {
  const uniqueCategoryIds = Array.from(new Set(categoryIds));

  if (uniqueCategoryIds.length < 1 || uniqueCategoryIds.length > 3) {
    throw new Error("Select between 1 and 3 categories.");
  }

  if (!uniqueCategoryIds.includes(primaryCategoryId)) {
    throw new Error("Primary category must be one of the selected categories.");
  }

  const categories = await tx.category.findMany({
    where: {
      id: {
        in: uniqueCategoryIds,
      },
    },
    select: {
      id: true,
    },
  });

  if (categories.length !== uniqueCategoryIds.length) {
    throw new Error("Choose valid categories.");
  }

  return uniqueCategoryIds;
}

async function syncComponentCategories(
  tx: Prisma.TransactionClient,
  componentId: string,
  primaryCategoryId: string,
  categoryIds: string[]
) {
  const uniqueCategoryIds = await assertCategorySelectionExists(
    tx,
    primaryCategoryId,
    categoryIds
  );

  await tx.component.update({
    where: { id: componentId },
    data: {
      primaryCategoryId,
    },
  });

  await tx.componentCategory.deleteMany({
    where: {
      componentId,
    },
  });

  await tx.componentCategory.createMany({
    data: uniqueCategoryIds.map((categoryId, index) => ({
      componentId,
      categoryId,
      sortOrder: index,
    })),
  });

  return uniqueCategoryIds;
}

function canSeePrivateComponent(component: DetailComponentRecord, viewer: Viewer | null) {
  return Boolean(
    viewer &&
      (
        viewer.role === UserRole.MODERATOR ||
        viewer.role === UserRole.ADMIN ||
        viewer.id === component.ownerId
      )
  );
}

function isFavoriteForViewer(
  component: { favorites: Array<{ userId: string }> },
  viewerId?: string | null
) {
  return viewerId ? component.favorites.some((favorite) => favorite.userId === viewerId) : false;
}

export function toPublicCard(
  component: ListComponentRecord,
  premiumMarkupPercent: number,
  viewerId?: string | null
) {
  const revision = component.approvedRevision;

  if (!revision) {
    throw new Error(`Component "${component.slug}" does not have a public revision.`);
  }

  const pricing = getRevisionPricing(revision, premiumMarkupPercent);

  return {
    id: component.id,
    slug: component.slug,
    title: revision.title,
    summary: revision.summary,
    category: component.primaryCategory,
    categories: getOrderedCategories(component),
    primaryCategoryId: component.primaryCategoryId,
    owner: component.owner,
    previewImage: getPreviewImageUrl(revision.screenshots),
    screenshots: revision.screenshots,
    publishedAt: component.publishedAt,
    favoritesCount: component.favoritesCount,
    isFavorite: isFavoriteForViewer(component, viewerId),
    accessType: pricing.accessType,
    sellerTargetPriceCents: pricing.sellerTargetPriceCents,
    salePriceCents: pricing.salePriceCents,
    platformFeeCents: pricing.platformFeeCents,
    hasPendingUpdate:
      component.activeRevision?.status === ComponentStatus.PENDING_REVIEW &&
      component.activeRevisionId !== null &&
      component.activeRevisionId !== component.approvedRevisionId,
    featured: component.featured,
  };
}

function toDashboardItem(component: DetailComponentRecord, premiumMarkupPercent: number) {
  const visibleRevision = component.activeRevision ?? component.approvedRevision;
  const pricing = visibleRevision
    ? getRevisionPricing(visibleRevision, premiumMarkupPercent)
    : {
        accessType: ComponentAccessType.FREE,
        sellerTargetPriceCents: null,
        salePriceCents: null,
        platformFeeCents: null,
      };

  return {
    id: component.id,
    slug: component.slug,
    category: component.primaryCategory,
    categories: getOrderedCategories(component),
    primaryCategoryId: component.primaryCategoryId,
    categoryIds: getOrderedCategories(component).map((category) => category.id),
    title:
      component.activeRevision?.title ??
      component.approvedRevision?.title ??
      "Untitled component",
    summary:
      component.activeRevision?.summary ??
      component.approvedRevision?.summary ??
      "No summary yet.",
    accessType: pricing.accessType,
    sellerTargetPriceCents: pricing.sellerTargetPriceCents,
    salePriceCents: pricing.salePriceCents,
    status: component.status,
    updatedAt: component.updatedAt,
    hasPublicVersion: Boolean(component.approvedRevisionId),
    previewImage: component.activeRevision
      ? getPreviewImageUrl(component.activeRevision.screenshots)
      : component.approvedRevision
        ? getPreviewImageUrl(component.approvedRevision.screenshots)
        : null,
    canEditDraft: component.activeRevision?.status === ComponentStatus.DRAFT,
    canStartUpdate: component.activeRevision?.status !== ComponentStatus.PENDING_REVIEW,
    pendingReview:
      component.activeRevision?.status === ComponentStatus.PENDING_REVIEW
        ? component.activeRevision.submittedAt
        : null,
    latestReviewNote:
      component.activeRevision?.reviewNote ??
      component.revisions.find((revision) => revision.reviewNote)?.reviewNote ??
      null,
  };
}

function toRevisionHistory(component: DetailComponentRecord) {
  return component.revisions.map((revision) => ({
    id: revision.id,
    version: revision.version,
    title: revision.title,
    status: revision.status,
    reviewNote: revision.reviewNote,
    createdAt: revision.createdAt,
    submittedAt: revision.submittedAt,
    reviewedAt: revision.reviewedAt,
    changelog: revision.changelog,
    reviewer: revision.reviewer,
    screenshots: revision.screenshots,
    moderationLogs: revision.moderationLogs,
  }));
}

async function createUniqueSlug(
  tx: Prisma.TransactionClient,
  title: string,
  excludeComponentId?: string
) {
  const base = slugify(title, { lower: true, strict: true }) || "swiftui-component";
  let suffix = 1;

  while (true) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const existing = await tx.component.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeComponentId) {
      return candidate;
    }

    suffix += 1;
  }
}

async function recountComponentMetrics(tx: Prisma.TransactionClient, componentId: string) {
  const favoritesCount = await tx.favorite.count({
    where: {
      componentId,
    },
  });

  await tx.component.update({
    where: { id: componentId },
    data: {
      favoritesCount,
    },
  });

  return { favoritesCount };
}

async function getOwnedComponentForMutation(
  tx: Prisma.TransactionClient,
  componentId: string,
  ownerId: string
) {
  const component = await tx.component.findUnique({
    where: { id: componentId },
    include: {
      activeRevision: {
        include: {
          screenshots: orderedScreenshots,
        },
      },
      approvedRevision: {
        include: {
          screenshots: orderedScreenshots,
        },
      },
    },
  });

  if (!component || component.ownerId !== ownerId) {
    throw new Error("You do not have permission to change this component.");
  }

  return component;
}

export async function listCategories() {
  return prisma.category.findMany({
    include: categoryInclude,
    orderBy: {
      name: "asc",
    },
  });
}

export async function getHomepageData(viewerId?: string | null) {
  const platformConfig = await getPlatformConfig();
  const [topRated, newest, categoryHighlights, premium] = await Promise.all([
    prisma.component.findMany({
      where: {
        approvedRevisionId: { not: null },
      },
      orderBy: [{ favoritesCount: "desc" }, { publishedAt: "desc" }],
      take: 8,
      include: listInclude,
    }),
    prisma.component.findMany({
      where: {
        approvedRevisionId: { not: null },
      },
      orderBy: [{ publishedAt: "desc" }, { favoritesCount: "desc" }],
      take: 4,
      include: listInclude,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: categoryInclude,
    }),
    prisma.component.findMany({
      where: {
        approvedRevisionId: { not: null },
        approvedRevision: {
          is: {
            accessType: ComponentAccessType.PREMIUM,
          },
        },
      },
      orderBy: [{ favoritesCount: "desc" }, { publishedAt: "desc" }],
      take: 4,
      include: listInclude,
    }),
  ]);

  return {
    topRated: topRated.map((component) =>
      toPublicCard(component, platformConfig.premiumMarkupPercent, viewerId)
    ),
    newest: newest.map((component) =>
      toPublicCard(component, platformConfig.premiumMarkupPercent, viewerId)
    ),
    premium: premium.map((component) =>
      toPublicCard(component, platformConfig.premiumMarkupPercent, viewerId)
    ),
    categoryHighlights: (
      await Promise.all(
        categoryHighlights.map(async (category) => {
          const component = await prisma.component.findFirst({
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

          return {
            ...category,
            component: component
              ? toPublicCard(
                  component,
                  platformConfig.premiumMarkupPercent,
                  viewerId
                )
              : null,
          };
        })
      )
    ).filter((category) => category.component),
  };
}

export async function listPublicComponents(
  {
    query,
    categorySlug,
    accessType,
    sort = "top",
  }: {
    query?: string;
    categorySlug?: string;
    accessType?: "free" | "premium";
    sort?: "top" | "newest";
  },
  viewerId?: string | null
) {
  const platformConfig = await getPlatformConfig();
  const normalizedQuery = query?.trim();
  const searchedIds = normalizedQuery
    ? await searchApprovedComponentIds({
        query: normalizedQuery,
        categorySlug,
        accessType,
        sort,
        limit: 60,
      })
    : null;

  const components = await prisma.component.findMany({
    where: {
      approvedRevisionId: { not: null },
      id: searchedIds
        ? {
            in: searchedIds.ids.length > 0 ? searchedIds.ids : ["__no-component__"],
          }
        : undefined,
      categoryLinks: categorySlug
        ? {
            some: {
              category: {
                slug: categorySlug,
              },
            },
          }
        : undefined,
      approvedRevision:
        accessType === "premium"
          ? {
              is: {
                accessType: ComponentAccessType.PREMIUM,
              },
            }
          : accessType === "free"
            ? {
                is: {
                  accessType: ComponentAccessType.FREE,
                },
              }
            : undefined,
    },
    orderBy:
      normalizedQuery && searchedIds
        ? undefined
        : sort === "newest"
          ? [{ publishedAt: "desc" }, { favoritesCount: "desc" }]
          : [{ favoritesCount: "desc" }, { publishedAt: "desc" }],
    include: listInclude,
  });

  const orderedComponents =
    normalizedQuery && searchedIds
      ? searchedIds.ids
          .map((id) => components.find((component) => component.id === id))
          .filter((component): component is (typeof components)[number] => Boolean(component))
      : components;

  return orderedComponents.map((component) =>
    toPublicCard(component, platformConfig.premiumMarkupPercent, viewerId)
  );
}

async function getPublicComponent(
  where: Prisma.ComponentWhereUniqueInput,
  viewer: Viewer | null
) {
  const platformConfig = await getPlatformConfig();
  const component = await prisma.component.findUnique({
    where,
    include: detailInclude,
  });

  if (!component) {
    return null;
  }

  const maySeePrivate = canSeePrivateComponent(component, viewer);
  const visibleRevision = component.approvedRevision ?? (maySeePrivate ? component.activeRevision : null);
  const purchase =
    viewer?.id && component.approvedRevisionId
      ? await prisma.componentPurchase.findUnique({
          where: {
            componentId_buyerId: {
              componentId: component.id,
              buyerId: viewer.id,
            },
          },
          select: {
            id: true,
          },
        })
      : null;

  if (!visibleRevision) {
    return null;
  }

  const pricing = getRevisionPricing(visibleRevision, platformConfig.premiumMarkupPercent);
  const hasUnlockedPremium =
    pricing.accessType !== ComponentAccessType.PREMIUM ||
    Boolean(
      viewer &&
        (
          viewer.id === component.ownerId ||
          viewer.role === UserRole.MODERATOR ||
          viewer.role === UserRole.ADMIN ||
          purchase
        )
    );

  return {
    id: component.id,
    slug: component.slug,
    category: component.primaryCategory,
    categories: getOrderedCategories(component),
    primaryCategoryId: component.primaryCategoryId,
    owner: component.owner,
    status: component.status,
    featured: component.featured,
    accessType: pricing.accessType,
    sellerTargetPriceCents: pricing.sellerTargetPriceCents,
    salePriceCents: pricing.salePriceCents,
    platformFeeCents: pricing.platformFeeCents,
    title: visibleRevision.title,
    summary: visibleRevision.summary,
    description: visibleRevision.description,
    swiftCode: hasUnlockedPremium ? visibleRevision.swiftCode : null,
    swiftCodePreview: hasUnlockedPremium ? null : getLockedSourcePreview(visibleRevision.swiftCode),
    changelog: visibleRevision.changelog,
    screenshots: visibleRevision.screenshots,
    publishedAt: component.publishedAt,
    favoritesCount: component.favoritesCount,
    isFavorite: isFavoriteForViewer(component, viewer?.id),
    isPrivateView: !component.approvedRevisionId,
    canViewSource: hasUnlockedPremium,
    canPurchase:
      pricing.accessType === ComponentAccessType.PREMIUM &&
      Boolean(
        component.approvedRevisionId &&
          viewer &&
          viewer.id !== component.ownerId &&
          !purchase &&
          viewer.role !== UserRole.MODERATOR &&
          viewer.role !== UserRole.ADMIN
      ),
    viewerHasPurchased: Boolean(purchase),
    hasPendingUpdate:
      component.activeRevision?.status === ComponentStatus.PENDING_REVIEW &&
      component.activeRevisionId !== null &&
      component.activeRevisionId !== component.approvedRevisionId,
    revisions: toRevisionHistory(component),
    canEditDraft:
      viewer?.id === component.ownerId &&
      component.activeRevision?.status === ComponentStatus.DRAFT,
    canStartUpdate:
      viewer?.id === component.ownerId &&
      component.activeRevision?.status !== ComponentStatus.PENDING_REVIEW,
  };
}

export async function getPublicComponentBySlug(slug: string, viewer: Viewer | null) {
  return getPublicComponent({ slug }, viewer);
}

export async function getPublicComponentById(componentId: string, viewer: Viewer | null) {
  return getPublicComponent({ id: componentId }, viewer);
}

export async function getDashboardData(ownerId: string) {
  const platformConfig = await getPlatformConfig();
  const components = await prisma.component.findMany({
    where: {
      ownerId,
    },
    orderBy: [{ updatedAt: "desc" }],
    include: detailInclude,
  });

  return components.map((component) =>
    toDashboardItem(component, platformConfig.premiumMarkupPercent)
  );
}

export async function getAdminComponentsByCategory() {
  const [categories, components] = await Promise.all([
    prisma.category.findMany({
      include: categoryInclude,
      orderBy: { name: "asc" },
    }),
    prisma.component.findMany({
      orderBy: [{ updatedAt: "desc" }],
      include: {
        primaryCategory: {
          include: categoryInclude,
        },
        categoryLinks: orderedCategoryLinks,
        owner: {
          select: publicUserSelect,
        },
        activeRevision: {
          select: {
            title: true,
            summary: true,
            accessType: true,
            screenshots: {
              orderBy: {
                sortOrder: "asc",
              },
              select: {
                url: true,
                previewUrl: true,
                mimeType: true,
                mediaType: true,
              },
            },
          },
        },
        approvedRevision: {
          select: {
            title: true,
            summary: true,
            accessType: true,
            screenshots: {
              orderBy: {
                sortOrder: "asc",
              },
              select: {
                url: true,
                previewUrl: true,
                mimeType: true,
                mediaType: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const mappedComponents = components.map((component) => {
    const visibleRevision = component.activeRevision ?? component.approvedRevision;

    return {
      id: component.id,
      slug: component.slug,
      status: component.status,
      featured: component.featured,
      updatedAt: component.updatedAt,
      publishedAt: component.publishedAt,
      favoritesCount: component.favoritesCount,
      owner: component.owner,
      primaryCategory: component.primaryCategory,
      primaryCategoryId: component.primaryCategoryId,
      categories: getOrderedCategories(component),
      title: visibleRevision?.title ?? "Untitled component",
      summary: visibleRevision?.summary ?? "No summary yet.",
      accessType: visibleRevision?.accessType ?? ComponentAccessType.FREE,
      previewImage: visibleRevision
        ? getPreviewImageUrl(visibleRevision.screenshots)
        : null,
      hasApprovedRevision: Boolean(component.approvedRevisionId),
    };
  });

  return categories.map((category) => ({
    category,
    components: mappedComponents.filter(
      (component) => component.primaryCategoryId === category.id
    ),
  }));
}

export async function getAdminComponentEditorData(componentId: string) {
  const component = await prisma.component.findUnique({
    where: { id: componentId },
    include: {
      primaryCategory: {
        include: categoryInclude,
      },
      categoryLinks: orderedCategoryLinks,
      activeRevision: {
        select: {
          id: true,
          title: true,
          summary: true,
          accessType: true,
        },
      },
      approvedRevision: {
        select: {
          id: true,
          title: true,
          summary: true,
          accessType: true,
        },
      },
    },
  });

  if (!component) {
    return null;
  }

  const editableRevision = component.activeRevision ?? component.approvedRevision;

  if (!editableRevision) {
    return null;
  }

  return {
    id: component.id,
    slug: component.slug,
    status: component.status,
    featured: component.featured,
    primaryCategoryId: component.primaryCategoryId,
    categoryIds: getOrderedCategories(component).map((category) => category.id),
    categories: getOrderedCategories(component),
    title: editableRevision.title,
    summary: editableRevision.summary,
    accessType: editableRevision.accessType,
  };
}

export async function updateComponentMetadataByAdmin(
  componentId: string,
  input: {
    title: string;
    summary: string;
    primaryCategoryId: string;
    featured: boolean;
  }
) {
  return prisma.$transaction(async (tx) => {
    const component = await tx.component.findUnique({
      where: { id: componentId },
      include: {
        categoryLinks: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (!component) {
      throw new Error("Component not found.");
    }

    const existingCategoryIds = component.categoryLinks.map((link) => link.categoryId);
    const nextCategoryIds = [
      input.primaryCategoryId,
      ...existingCategoryIds.filter((categoryId) => categoryId !== input.primaryCategoryId),
    ].slice(0, 3);

    await syncComponentCategories(
      tx,
      component.id,
      input.primaryCategoryId,
      nextCategoryIds
    );

    await tx.component.update({
      where: { id: component.id },
      data: {
        featured: input.featured,
      },
    });

    const revisionIds = Array.from(
      new Set([component.activeRevisionId, component.approvedRevisionId].filter(Boolean))
    ) as string[];

    if (revisionIds.length === 0) {
      throw new Error("No active revision exists for this component.");
    }

    await tx.componentRevision.updateMany({
      where: {
        id: {
          in: revisionIds,
        },
      },
      data: {
        title: input.title,
        summary: input.summary,
      },
    });

    await syncApprovedComponentSearchIndex(tx, component.id);

    return {
      componentId: component.id,
      slug: component.slug,
    };
  });
}

export async function declineComponentByAdmin(
  componentId: string,
  adminId: string,
  note?: string | null
) {
  return prisma.$transaction(async (tx) => {
    const component = await tx.component.findUnique({
      where: { id: componentId },
      select: {
        id: true,
        slug: true,
        activeRevisionId: true,
      },
    });

    if (!component) {
      throw new Error("Component not found.");
    }

    const now = new Date();
    const trimmedNote = note?.trim() || "Declined by admin.";

    if (component.activeRevisionId) {
      await tx.componentRevision.update({
        where: {
          id: component.activeRevisionId,
        },
        data: {
          status: ComponentStatus.DECLINED,
          reviewNote: trimmedNote,
          reviewerId: adminId,
          reviewedAt: now,
        },
      });

      await tx.moderationLog.create({
        data: {
          revisionId: component.activeRevisionId,
          moderatorId: adminId,
          decision: ModerationDecision.DECLINED,
          note: trimmedNote,
        },
      });
    }

    await tx.component.update({
      where: { id: component.id },
      data: {
        status: ComponentStatus.DECLINED,
        approvedRevisionId: null,
        publishedAt: null,
      },
    });

    await syncApprovedComponentSearchIndex(tx, component.id);

    return {
      componentId: component.id,
      slug: component.slug,
    };
  });
}

export async function deleteComponentByAdmin(componentId: string) {
  return prisma.$transaction(async (tx) => {
    const component = await tx.component.findUnique({
      where: { id: componentId },
      select: {
        id: true,
        slug: true,
      },
    });

    if (!component) {
      throw new Error("Component not found.");
    }

    await tx.component.delete({
      where: {
        id: componentId,
      },
    });

    await syncApprovedComponentSearchIndex(tx, componentId);

    return {
      slug: component.slug,
    };
  });
}

export async function getFavoritesData(userId: string) {
  const platformConfig = await getPlatformConfig();
  const favorites = await prisma.favorite.findMany({
    where: {
      userId,
      component: {
        approvedRevisionId: { not: null },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      component: {
        include: listInclude,
      },
    },
  });

  return favorites.map((favorite) =>
    toPublicCard(favorite.component, platformConfig.premiumMarkupPercent, userId)
  );
}

export async function getModerationQueue() {
  const platformConfig = await getPlatformConfig();
  const components = await prisma.component.findMany({
    where: {
      status: ComponentStatus.PENDING_REVIEW,
      activeRevisionId: { not: null },
    },
    orderBy: {
      updatedAt: "asc",
    },
    include: detailInclude,
  });

  return components.map((component) => ({
    ...getRevisionPricing(
      component.activeRevision ?? component.approvedRevision ?? {
        accessType: ComponentAccessType.FREE,
        sellerTargetPriceCents: null,
      },
      platformConfig.premiumMarkupPercent
    ),
    id: component.id,
    slug: component.slug,
    owner: component.owner,
    category: component.primaryCategory,
    categories: getOrderedCategories(component),
    primaryCategoryId: component.primaryCategoryId,
    categoryIds: getOrderedCategories(component).map((category) => category.id),
    publicRevision: component.approvedRevision,
    pendingRevision: component.activeRevision,
    title:
      component.activeRevision?.title ??
      component.approvedRevision?.title ??
      "Untitled component",
    summary:
      component.activeRevision?.summary ??
      component.approvedRevision?.summary ??
      "No summary yet.",
    submittedAt: component.activeRevision?.submittedAt,
    screenshots:
      component.activeRevision?.screenshots ??
      component.approvedRevision?.screenshots ??
      [],
    history: toRevisionHistory(component),
  }));
}

export async function getDraftEditorData(componentId: string, ownerId: string) {
  const component = await prisma.component.findUnique({
    where: { id: componentId },
    include: detailInclude,
  });

  if (!component || component.ownerId !== ownerId) {
    return null;
  }

  if (component.activeRevision?.status !== ComponentStatus.DRAFT) {
    return null;
  }

  return {
    ...component,
    categories: getOrderedCategories(component),
    categoryIds: getOrderedCategories(component).map((category) => category.id),
  };
}

export async function createComponentDraft(ownerId: string, input: DraftInput) {
  const parsed = assertDraftInput(input);

  return prisma.$transaction(async (tx) => {
    const categoryIds = await assertCategorySelectionExists(
      tx,
      parsed.primaryCategoryId,
      parsed.categoryIds
    );
    const slug = await createUniqueSlug(tx, parsed.title);
    const component = await tx.component.create({
      data: {
        slug,
        ownerId,
        primaryCategoryId: parsed.primaryCategoryId,
        status: ComponentStatus.DRAFT,
        categoryLinks: {
          create: categoryIds.map((categoryId, index) => ({
            categoryId,
            sortOrder: index,
          })),
        },
      },
    });

    const revision = await tx.componentRevision.create({
      data: {
        componentId: component.id,
        version: 1,
        title: parsed.title,
        summary: parsed.summary,
        description: parsed.description,
        swiftCode: parsed.swiftCode,
        changelog: parsed.changelog || null,
        accessType: parsed.accessType,
        sellerTargetPriceCents: parsed.sellerTargetPriceCents,
        status: ComponentStatus.DRAFT,
        screenshots: {
          create: parsed.screenshots.map((screenshot, index) => ({
            ...screenshot,
            sortOrder: index,
          })),
        },
      },
    });

    await tx.component.update({
      where: { id: component.id },
      data: {
        activeRevisionId: revision.id,
      },
    });

    return {
      componentId: component.id,
      slug: component.slug,
    };
  });
}

export async function updateComponentDraft(
  componentId: string,
  ownerId: string,
  input: DraftInput
) {
  const parsed = assertDraftInput(input);

  return prisma.$transaction(async (tx) => {
    const component = await getOwnedComponentForMutation(tx, componentId, ownerId);

    if (component.activeRevision?.status !== ComponentStatus.DRAFT) {
      throw new Error("Only draft revisions can be edited.");
    }

    const componentData: Prisma.ComponentUpdateInput = {};

    if (!component.approvedRevisionId) {
      componentData.slug = await createUniqueSlug(tx, parsed.title, component.id);
    }

    if (Object.keys(componentData).length > 0) {
      await tx.component.update({
        where: { id: component.id },
        data: componentData,
      });
    }

    if (!component.approvedRevisionId) {
      await syncComponentCategories(
        tx,
        component.id,
        parsed.primaryCategoryId,
        parsed.categoryIds
      );
    }

    await tx.componentRevision.update({
      where: { id: component.activeRevision.id },
      data: {
        title: parsed.title,
        summary: parsed.summary,
        description: parsed.description,
        swiftCode: parsed.swiftCode,
        changelog: parsed.changelog || null,
        accessType: parsed.accessType,
        sellerTargetPriceCents: parsed.sellerTargetPriceCents,
        screenshots: {
          deleteMany: {},
          create: parsed.screenshots.map((screenshot, index) => ({
            ...screenshot,
            sortOrder: index,
          })),
        },
      },
    });

    return {
      componentId: component.id,
      slug: component.slug,
    };
  });
}

export async function startRevisionDraft(componentId: string, ownerId: string) {
  return prisma.$transaction(async (tx) => {
    const component = await getOwnedComponentForMutation(tx, componentId, ownerId);

    if (!component.activeRevision) {
      throw new Error("This component does not have an editable revision.");
    }

    if (component.activeRevision.status === ComponentStatus.DRAFT) {
      return {
        componentId: component.id,
      };
    }

    if (component.activeRevision.status === ComponentStatus.PENDING_REVIEW) {
      throw new Error("Wait for moderation before starting another update.");
    }

    const revision = await tx.componentRevision.create({
      data: {
        componentId: component.id,
        version: component.activeRevision.version + 1,
        title: component.activeRevision.title,
        summary: component.activeRevision.summary,
        description: component.activeRevision.description,
        swiftCode: component.activeRevision.swiftCode,
        changelog: component.activeRevision.changelog,
        accessType: component.activeRevision.accessType,
        sellerTargetPriceCents: component.activeRevision.sellerTargetPriceCents,
        status: ComponentStatus.DRAFT,
        screenshots: {
          create: component.activeRevision.screenshots.map((screenshot, index) => ({
            mediaType: screenshot.mediaType,
            mimeType: screenshot.mimeType,
            url: screenshot.url,
            storagePath: screenshot.storagePath,
            previewUrl: screenshot.previewUrl,
            previewStoragePath: screenshot.previewStoragePath,
            width: screenshot.width,
            height: screenshot.height,
            altText: screenshot.altText,
            sortOrder: index,
          })),
        },
      },
    });

    await tx.component.update({
      where: { id: component.id },
      data: {
        status: ComponentStatus.DRAFT,
        activeRevisionId: revision.id,
      },
    });

    return {
      componentId: component.id,
    };
  });
}

export async function submitActiveRevision(componentId: string, ownerId: string) {
  return prisma.$transaction(async (tx) => {
    const component = await getOwnedComponentForMutation(tx, componentId, ownerId);

    if (component.activeRevision?.status !== ComponentStatus.DRAFT) {
      throw new Error("Only draft revisions can be submitted.");
    }

    await tx.componentRevision.update({
      where: { id: component.activeRevision.id },
      data: {
        status: ComponentStatus.PENDING_REVIEW,
        submittedAt: new Date(),
        reviewNote: null,
        reviewerId: null,
        reviewedAt: null,
      },
    });

    await tx.component.update({
      where: { id: component.id },
      data: {
        status: ComponentStatus.PENDING_REVIEW,
      },
    });

    return {
      componentId: component.id,
      slug: component.slug,
    };
  });
}

export async function reviewActiveRevision(
  componentId: string,
  moderatorId: string,
  decision: ModerationDecision,
  note?: string | null,
  categorySelection?: {
    primaryCategoryId: string;
    categoryIds: string[];
  }
) {
  return prisma.$transaction(async (tx) => {
    const component = await tx.component.findUnique({
      where: { id: componentId },
      include: {
        activeRevision: true,
        categoryLinks: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (!component?.activeRevision) {
      throw new Error("No active revision exists for this component.");
    }

    if (component.activeRevision.status !== ComponentStatus.PENDING_REVIEW) {
      throw new Error("Only pending revisions can be reviewed.");
    }

    if (decision === ModerationDecision.DECLINED && !note?.trim()) {
      throw new Error("Declining a component requires a moderator note.");
    }

    const nextStatus =
      decision === ModerationDecision.APPROVED
        ? ComponentStatus.APPROVED
        : ComponentStatus.DECLINED;
    const now = new Date();

    await tx.componentRevision.update({
      where: {
        id: component.activeRevision.id,
      },
      data: {
        status: nextStatus,
        reviewNote: note?.trim() || null,
        reviewerId: moderatorId,
        reviewedAt: now,
      },
    });

    await tx.moderationLog.create({
      data: {
        revisionId: component.activeRevision.id,
        moderatorId,
        decision,
        note: note?.trim() || null,
      },
    });

    await tx.component.update({
      where: { id: component.id },
      data:
        decision === ModerationDecision.APPROVED
          ? {
              status: ComponentStatus.APPROVED,
              approvedRevisionId: component.activeRevision.id,
              publishedAt: now,
            }
          : {
              status: ComponentStatus.DECLINED,
            },
    });

    if (decision === ModerationDecision.APPROVED) {
      await syncComponentCategories(
        tx,
        component.id,
        categorySelection?.primaryCategoryId ?? component.primaryCategoryId,
        categorySelection?.categoryIds ??
          component.categoryLinks.map((link) => link.categoryId)
      );
    }

    await syncApprovedComponentSearchIndex(tx, component.id);

    return {
      componentId: component.id,
      slug: component.slug,
    };
  });
}

export async function toggleComponentFavorite(componentId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const component = await tx.component.findUnique({
      where: { id: componentId },
      select: {
        id: true,
        approvedRevisionId: true,
      },
    });

    if (!component?.approvedRevisionId) {
      throw new Error("Only approved components can be favorited.");
    }

    const existing = await tx.favorite.findUnique({
      where: {
        componentId_userId: {
          componentId,
          userId,
        },
      },
    });

    let isFavorite = true;

    if (existing) {
      await tx.favorite.delete({
        where: {
          componentId_userId: {
            componentId,
            userId,
          },
        },
      });
      isFavorite = false;
    } else {
      await tx.favorite.create({
        data: {
          componentId,
          userId,
        },
      });
    }

    const counts = await recountComponentMetrics(tx, componentId);

    return {
      favoritesCount: counts.favoritesCount,
      isFavorite,
    };
  });
}

export async function setComponentFavorite(
  componentId: string,
  userId: string,
  isFavorite: boolean
) {
  return prisma.$transaction(async (tx) => {
    const component = await tx.component.findUnique({
      where: { id: componentId },
      select: {
        id: true,
        approvedRevisionId: true,
      },
    });

    if (!component?.approvedRevisionId) {
      throw new Error("Only approved components can be favorited.");
    }

    const existing = await tx.favorite.findUnique({
      where: {
        componentId_userId: {
          componentId,
          userId,
        },
      },
    });

    if (isFavorite && !existing) {
      await tx.favorite.create({
        data: {
          componentId,
          userId,
        },
      });
    }

    if (!isFavorite && existing) {
      await tx.favorite.delete({
        where: {
          componentId_userId: {
            componentId,
            userId,
          },
        },
      });
    }

    const counts = await recountComponentMetrics(tx, componentId);

    return {
      favoritesCount: counts.favoritesCount,
      isFavorite,
    };
  });
}
