import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";
import type {
  ApiKeyCreateInput,
  ApiKeyUpdateInput,
} from "@/lib/validation/api-key";

function hashApiKey(rawKey: string) {
  return createHash("sha256").update(rawKey).digest("hex");
}

function generateRawApiKey() {
  return `cmu_${randomBytes(24).toString("base64url")}`;
}

function toPublicApiKey(apiKey: {
  id: string;
  name: string;
  keyPrefix: string;
  canPurchase: boolean;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: apiKey.id,
    name: apiKey.name,
    keyPrefix: apiKey.keyPrefix,
    canPurchase: apiKey.canPurchase,
    lastUsedAt: apiKey.lastUsedAt?.toISOString() ?? null,
    createdAt: apiKey.createdAt.toISOString(),
    updatedAt: apiKey.updatedAt.toISOString(),
  };
}

async function getOwnedApiKey(userId: string, apiKeyId: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: {
      id: apiKeyId,
    },
  });

  if (!apiKey || apiKey.userId !== userId) {
    throw new Error("API key not found.");
  }

  return apiKey;
}

export async function listApiKeysForUser(userId: string) {
  const apiKeys = await prisma.apiKey.findMany({
    where: {
      userId,
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  return apiKeys.map(toPublicApiKey);
}

export async function createApiKeyForUser(
  userId: string,
  input: ApiKeyCreateInput
) {
  const rawKey = generateRawApiKey();
  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name: input.name,
      keyHash: hashApiKey(rawKey),
      keyPrefix: rawKey.slice(0, 12),
      canPurchase: input.canPurchase,
    },
  });

  return {
    rawKey,
    apiKey: toPublicApiKey(apiKey),
  };
}

export async function updateApiKeyForUser(
  userId: string,
  input: ApiKeyUpdateInput
) {
  await getOwnedApiKey(userId, input.apiKeyId);

  const apiKey = await prisma.apiKey.update({
    where: {
      id: input.apiKeyId,
    },
    data: {
      name: input.name,
      canPurchase: input.canPurchase,
    },
  });

  return toPublicApiKey(apiKey);
}

export async function deleteApiKeyForUser(userId: string, apiKeyId: string) {
  await getOwnedApiKey(userId, apiKeyId);

  await prisma.apiKey.delete({
    where: {
      id: apiKeyId,
    },
  });
}

export async function authenticateApiKey(rawKey: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: {
      keyHash: hashApiKey(rawKey.trim()),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          profileSlug: true,
          role: true,
        },
      },
    },
  });

  if (!apiKey) {
    throw new Error("Invalid API key.");
  }

  await prisma.apiKey.update({
    where: {
      id: apiKey.id,
    },
    data: {
      lastUsedAt: new Date(),
    },
  });

  return {
    apiKey: toPublicApiKey(apiKey),
    user: apiKey.user,
  };
}
