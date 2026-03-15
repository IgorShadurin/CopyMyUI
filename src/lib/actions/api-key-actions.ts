"use server";

import { revalidatePath } from "next/cache";

import { ZodError } from "zod";

import { getI18n, translateServerError, translateZodIssue } from "@/i18n/server";
import {
  createApiKeyForUser,
  deleteApiKeyForUser,
  updateApiKeyForUser,
} from "@/lib/server/api-key-service";
import { requireViewer } from "@/lib/viewer";
import {
  apiKeyCreateSchema,
  apiKeyDeleteSchema,
  apiKeyUpdateSchema,
} from "@/lib/validation/api-key";

export type ApiKeyActionState = {
  error: string | null;
  createdKey: string | null;
  createdKeyName: string | null;
  createdApiKey: Awaited<ReturnType<typeof createApiKeyForUser>>["apiKey"] | null;
};

function formatApiKeyActionError(
  error: unknown,
  messages: Awaited<ReturnType<typeof getI18n>>["messages"]
) {
  if (error instanceof ZodError) {
    return error.issues[0]
      ? translateZodIssue(error.issues[0], messages)
      : messages.errors.formIncomplete;
  }

  return error instanceof Error
    ? translateServerError(error.message, messages)
    : messages.errors.generic;
}

export async function createApiKeyAction(
  _state: ApiKeyActionState,
  formData: FormData
) {
  const { messages } = await getI18n();
  const viewer = await requireViewer();

  try {
    const input = apiKeyCreateSchema.parse({
      name: String(formData.get("name") ?? ""),
      canPurchase: formData.get("canPurchase") === "on",
    });
    const created = await createApiKeyForUser(viewer.id, input);

    revalidatePath("/dashboard");

    return {
      error: null,
      createdKey: created.rawKey,
      createdKeyName: created.apiKey.name,
      createdApiKey: created.apiKey,
    };
  } catch (error) {
    return {
      error: formatApiKeyActionError(error, messages),
      createdKey: null,
      createdKeyName: null,
      createdApiKey: null,
    };
  }
}

export async function updateApiKeyAction(formData: FormData) {
  const { messages } = await getI18n();
  const viewer = await requireViewer();

  try {
    const input = apiKeyUpdateSchema.parse({
      apiKeyId: String(formData.get("apiKeyId") ?? ""),
      name: String(formData.get("name") ?? ""),
      canPurchase: formData.get("canPurchase") === "on",
    });

    const apiKey = await updateApiKeyForUser(viewer.id, input);
    revalidatePath("/dashboard");

    return {
      error: null,
      apiKey,
    };
  } catch (error) {
    return {
      error: formatApiKeyActionError(error, messages),
      apiKey: null,
    };
  }
}

export async function deleteApiKeyAction(formData: FormData) {
  const { messages } = await getI18n();
  const viewer = await requireViewer();

  try {
    const input = apiKeyDeleteSchema.parse({
      apiKeyId: String(formData.get("apiKeyId") ?? ""),
    });

    await deleteApiKeyForUser(viewer.id, input.apiKeyId);
    revalidatePath("/dashboard");

    return {
      error: null,
      deletedId: input.apiKeyId,
    };
  } catch (error) {
    return {
      error: formatApiKeyActionError(error, messages),
      deletedId: null,
    };
  }
}
