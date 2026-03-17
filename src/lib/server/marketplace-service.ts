import { ComponentAccessType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  calculateBuyerPriceCents,
  calculatePlatformFeeCents,
} from "@/lib/pricing";
import { listInclude, toPublicCard } from "@/lib/server/component-service";
import { getPlatformConfig } from "@/lib/server/platform-service";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  profileSlug: true,
} satisfies Prisma.UserSelect;

const ALLOWED_REGISTRATION_RANGES = [7, 30, 90] as const;

function normalizeRegistrationRange(days?: number) {
  if (!days) {
    return 30;
  }

  return ALLOWED_REGISTRATION_RANGES.includes(days as (typeof ALLOWED_REGISTRATION_RANGES)[number])
    ? days
    : 30;
}

function startOfUtcDay(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
  );
}

function toUtcDayKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildRegistrationDays(days: number) {
  const normalizedDays = normalizeRegistrationRange(days);
  const today = startOfUtcDay(new Date());
  const result: Date[] = [];

  for (let index = normalizedDays - 1; index >= 0; index -= 1) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - index);
    result.push(day);
  }

  return result;
}

export async function purchasePremiumComponent(componentId: string, buyerId: string) {
  const platformConfig = await getPlatformConfig();

  return prisma.$transaction(async (tx) => {
    const component = await tx.component.findUnique({
      where: { id: componentId },
      include: {
        owner: {
          select: publicUserSelect,
        },
        approvedRevision: true,
      },
    });

    if (!component?.approvedRevision) {
      throw new Error("Only approved premium components can be purchased.");
    }

    if (
      component.approvedRevision.accessType !== ComponentAccessType.PREMIUM ||
      component.approvedRevision.sellerTargetPriceCents === null
    ) {
      throw new Error("Only approved premium components can be purchased.");
    }

    if (component.ownerId === buyerId) {
      throw new Error("You already have access to your own component.");
    }

    const existingPurchase = await tx.componentPurchase.findUnique({
      where: {
        componentId_buyerId: {
          componentId,
          buyerId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingPurchase) {
      return {
        slug: component.slug,
      };
    }

    const sellerTargetPriceCents = component.approvedRevision.sellerTargetPriceCents;
    const salePriceCents = calculateBuyerPriceCents(
      sellerTargetPriceCents,
      platformConfig.premiumMarkupPercent
    );
    const platformFeeCents = calculatePlatformFeeCents(
      sellerTargetPriceCents,
      platformConfig.premiumMarkupPercent
    );

    await tx.componentPurchase.create({
      data: {
        componentId: component.id,
        buyerId,
        sellerId: component.ownerId,
        approvedRevisionId: component.approvedRevision.id,
        sellerTargetPriceCents,
        platformMarkupPercent: platformConfig.premiumMarkupPercent,
        platformFeeCents,
        salePriceCents,
      },
    });

    return {
      slug: component.slug,
    };
  });
}

export async function getPurchasesData(userId: string) {
  const platformConfig = await getPlatformConfig();
  const purchases = await prisma.componentPurchase.findMany({
    where: {
      buyerId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      seller: {
        select: publicUserSelect,
      },
      component: {
        include: listInclude,
      },
    },
  });

  return purchases.map((purchase) => ({
    id: purchase.id,
    createdAt: purchase.createdAt,
    salePriceCents: purchase.salePriceCents,
    sellerTargetPriceCents: purchase.sellerTargetPriceCents,
    platformFeeCents: purchase.platformFeeCents,
    seller: purchase.seller,
    component: toPublicCard(
      purchase.component,
      platformConfig.premiumMarkupPercent,
      userId
    ),
  }));
}

export async function getPublicCreatorProfile(profileSlug: string, viewerId?: string | null) {
  const platformConfig = await getPlatformConfig();
  const creator = await prisma.user.findUnique({
    where: {
      profileSlug,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      profileSlug: true,
      createdAt: true,
      ownedComponents: {
        where: {
          approvedRevisionId: { not: null },
        },
        orderBy: [{ favoritesCount: "desc" }, { publishedAt: "desc" }],
        include: listInclude,
      },
    },
  });

  if (!creator || creator.ownedComponents.length === 0) {
    return null;
  }

  const components = creator.ownedComponents.map((component) =>
    toPublicCard(component, platformConfig.premiumMarkupPercent, viewerId)
  );

  return {
    ...creator,
    components,
    componentCount: components.length,
    premiumCount: components.filter(
      (component) => component.accessType === ComponentAccessType.PREMIUM
    ).length,
  };
}

export async function getAdminDashboardData(days: number = 30) {
  const registrationDays = buildRegistrationDays(days);
  const registrationStart = registrationDays[0] ?? startOfUtcDay(new Date());
  const platformConfig = await getPlatformConfig();
  const [premiumComponents, recentPurchases, users] = await Promise.all([
    prisma.component.findMany({
      where: {
        approvedRevisionId: { not: null },
        approvedRevision: {
          is: {
            accessType: ComponentAccessType.PREMIUM,
          },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { favoritesCount: "desc" }],
      take: 6,
      include: listInclude,
    }),
    prisma.componentPurchase.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        buyer: {
          select: publicUserSelect,
        },
        seller: {
          select: publicUserSelect,
        },
        component: {
          include: listInclude,
        },
      },
    }),
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: registrationStart,
        },
      },
      select: {
        createdAt: true,
      },
    }),
  ]);

  const registrationsByDay = users.reduce<Map<string, number>>((map, user) => {
    const key = toUtcDayKey(startOfUtcDay(user.createdAt));
    map.set(key, (map.get(key) ?? 0) + 1);
    return map;
  }, new Map());

  const totals = recentPurchases.reduce(
    (summary, purchase) => ({
      grossCents: summary.grossCents + purchase.salePriceCents,
      feeCents: summary.feeCents + purchase.platformFeeCents,
      sellerPayoutCents: summary.sellerPayoutCents + purchase.sellerTargetPriceCents,
      salesCount: summary.salesCount + 1,
    }),
    {
      grossCents: 0,
      feeCents: 0,
      sellerPayoutCents: 0,
      salesCount: 0,
    }
  );

  return {
    platformConfig,
    totals,
    premiumComponents: premiumComponents.map((component) =>
      toPublicCard(component, platformConfig.premiumMarkupPercent, null)
    ),
    recentPurchases: recentPurchases.map((purchase) => ({
      id: purchase.id,
      createdAt: purchase.createdAt,
      salePriceCents: purchase.salePriceCents,
      platformFeeCents: purchase.platformFeeCents,
      sellerTargetPriceCents: purchase.sellerTargetPriceCents,
      buyer: purchase.buyer,
      seller: purchase.seller,
      component: toPublicCard(
        purchase.component,
        platformConfig.premiumMarkupPercent,
        purchase.buyerId
      ),
    })),
    userRegistrations: registrationDays.map((day) => {
      const key = toUtcDayKey(day);
      return {
        date: day,
        count: registrationsByDay.get(key) ?? 0,
      };
    }),
  };
}
