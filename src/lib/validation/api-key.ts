import { z } from "zod";

export const apiKeyCreateSchema = z.object({
  name: z.string().trim().min(2).max(40),
  canPurchase: z.boolean().default(false),
});

export const apiKeyUpdateSchema = apiKeyCreateSchema.extend({
  apiKeyId: z.string().trim().min(1),
});

export const apiKeyDeleteSchema = z.object({
  apiKeyId: z.string().trim().min(1),
});

export type ApiKeyCreateInput = z.infer<typeof apiKeyCreateSchema>;
export type ApiKeyUpdateInput = z.infer<typeof apiKeyUpdateSchema>;
