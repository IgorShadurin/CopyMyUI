import { z } from "zod";

import { ComponentAccessType } from "@prisma/client";

import { MAX_SCREENSHOTS, MIN_SCREENSHOTS } from "@/lib/constants";

const swiftPatterns = [
  /import\s+SwiftUI/,
  /struct\s+\w+\s*:\s*View/,
  /var\s+body\s*:\s*some\s+View/,
];

export const screenshotPayloadSchema = z.object({
  mediaType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  mimeType: z.string().trim().min(1).max(120).optional().nullable(),
  url: z.string().trim().min(1),
  storagePath: z.string().trim().min(1),
  previewUrl: z.string().trim().min(1).optional().nullable(),
  previewStoragePath: z.string().trim().min(1).optional().nullable(),
  altText: z.string().trim().min(2).max(100),
});

export const categorySelectionSchema = z.object({
  primaryCategoryId: z.string().trim().min(1),
  categoryIds: z.array(z.string().trim().min(1)).min(1).max(3),
}).superRefine((value, ctx) => {
  const uniqueIds = new Set(value.categoryIds);

  if (uniqueIds.size !== value.categoryIds.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["categoryIds"],
      message: "Select each category only once.",
    });
  }

  if (!value.categoryIds.includes(value.primaryCategoryId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["primaryCategoryId"],
      message: "Primary category must be included in the selected categories.",
    });
  }
});

export const componentDraftSchema = z.object({
  title: z.string().trim().min(3).max(80),
  primaryCategoryId: z.string().trim().min(1),
  categoryIds: z.array(z.string().trim().min(1)).min(1).max(3),
  summary: z.string().trim().min(20).max(160),
  description: z.string().trim().min(40).max(1400),
  changelog: z.string().trim().max(400).optional().or(z.literal("")),
  accessType: z.nativeEnum(ComponentAccessType),
  sellerTargetPriceCents: z.number().int().positive().nullable(),
  swiftCode: z.string().trim().min(80).max(20000),
  screenshots: z.array(screenshotPayloadSchema).min(MIN_SCREENSHOTS).max(MAX_SCREENSHOTS),
}).superRefine((value, ctx) => {
  const categorySelection = categorySelectionSchema.safeParse({
    primaryCategoryId: value.primaryCategoryId,
    categoryIds: value.categoryIds,
  });

  if (!categorySelection.success) {
    for (const issue of categorySelection.error.issues) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: issue.path,
        message: issue.message,
      });
    }
  }

  if (value.accessType === ComponentAccessType.PREMIUM && !value.sellerTargetPriceCents) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["sellerTargetPriceCents"],
      message: "Set a target payout price for premium components.",
    });
  }

  if (value.accessType === ComponentAccessType.FREE && value.sellerTargetPriceCents !== null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["sellerTargetPriceCents"],
      message: "Free components cannot include a premium payout target.",
    });
  }
});

export function isSwiftUiSource(source: string) {
  return swiftPatterns.every((pattern) => pattern.test(source));
}

export function parseScreenshots(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    return screenshotPayloadSchema.array().parse(JSON.parse(value));
  } catch {
    return [];
  }
}

export function parseCategoryIds(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    return z.array(z.string()).parse(JSON.parse(value));
  } catch {
    return [];
  }
}
