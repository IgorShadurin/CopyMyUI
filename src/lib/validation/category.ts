import { z } from "zod";

import { categorySelectionSchema } from "@/lib/validation/component";

export const categoryAdminSchema = z.object({
  categoryId: z.string().trim().min(1),
  name: z.string().trim().min(2).max(40),
  slug: z.string().trim().min(2).max(40).regex(/^[a-z0-9-]+$/),
  accent: z.string().trim().min(3).max(80),
  description: z.string().trim().min(20).max(280),
});

export const moderationCategorySchema = categorySelectionSchema.extend({
  note: z.string().trim().max(400).optional().or(z.literal("")),
});

export type CategoryAdminInput = z.infer<typeof categoryAdminSchema>;
export type ModerationCategoryInput = z.infer<typeof moderationCategorySchema>;
