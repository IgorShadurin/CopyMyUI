import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PREMIUM_MARKUP_PERCENT,
  PLATFORM_CONFIG_ID,
} from "@/lib/constants";

export async function getPlatformConfig() {
  return prisma.platformConfig.upsert({
    where: { id: PLATFORM_CONFIG_ID },
    update: {},
    create: {
      id: PLATFORM_CONFIG_ID,
      premiumMarkupPercent: DEFAULT_PREMIUM_MARKUP_PERCENT,
    },
  });
}

export async function updatePlatformMarkupPercent(
  adminId: string,
  premiumMarkupPercent: number
) {
  if (!Number.isInteger(premiumMarkupPercent) || premiumMarkupPercent < 0 || premiumMarkupPercent > 200) {
    throw new Error("Markup percent must be a whole number between 0 and 200.");
  }

  return prisma.platformConfig.upsert({
    where: { id: PLATFORM_CONFIG_ID },
    update: {
      premiumMarkupPercent,
      updatedById: adminId,
    },
    create: {
      id: PLATFORM_CONFIG_ID,
      premiumMarkupPercent,
      updatedById: adminId,
    },
  });
}
