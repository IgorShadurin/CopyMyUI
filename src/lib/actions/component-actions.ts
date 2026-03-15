"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ComponentAccessType, ModerationDecision } from "@prisma/client";
import { ZodError } from "zod";

import { withLocalePath } from "@/i18n/routing";
import {
  getI18n,
  translateServerError,
  translateZodIssue,
} from "@/i18n/server";
import { parseUsdToCents } from "@/lib/pricing";
import {
  createComponentDraft,
  reviewActiveRevision,
  startRevisionDraft,
  submitActiveRevision,
  updateComponentDraft,
} from "@/lib/server/component-service";
import { requireModerator, requireViewer } from "@/lib/viewer";
import { parseCategoryIds, parseScreenshots } from "@/lib/validation/component";
import type { FormState } from "@/lib/actions/form-state";

function draftInputFromFormData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    primaryCategoryId: String(formData.get("primaryCategoryId") ?? ""),
    categoryIds: parseCategoryIds(
      typeof formData.get("categoryIds") === "string"
        ? String(formData.get("categoryIds"))
        : null
    ),
    summary: String(formData.get("summary") ?? ""),
    description: String(formData.get("description") ?? ""),
    changelog: String(formData.get("changelog") ?? ""),
    accessType:
      formData.get("accessType") === ComponentAccessType.PREMIUM
        ? ComponentAccessType.PREMIUM
        : ComponentAccessType.FREE,
    sellerTargetPriceCents:
      formData.get("accessType") === ComponentAccessType.PREMIUM
        ? parseUsdToCents(String(formData.get("sellerTargetPriceUsd") ?? ""))
        : null,
    swiftCode: String(formData.get("swiftCode") ?? ""),
    screenshots: parseScreenshots(
      typeof formData.get("screenshots") === "string"
        ? String(formData.get("screenshots"))
        : null
    ),
  };
}

function revalidateComponentPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/components");
  revalidatePath("/dashboard");
  revalidatePath("/favorites");
  revalidatePath("/moderation");
  revalidatePath("/admin");
  revalidatePath("/categories/[slug]", "page");

  if (slug) {
    revalidatePath(`/components/${slug}`);
  }
}

function formatActionError(
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

export async function createComponentFormAction(
  _state: FormState,
  formData: FormData
) {
  const { locale, messages } = await getI18n();
  const viewer = await requireViewer();
  const intent = String(formData.get("intent") ?? "draft");

  try {
    const created = await createComponentDraft(viewer.id, draftInputFromFormData(formData));

    if (intent === "submit") {
      await submitActiveRevision(created.componentId, viewer.id);
      revalidateComponentPaths(created.slug);
      return {
        error: null,
        redirectTo: `${withLocalePath(locale, "/dashboard")}?submitted=1`,
      };
    }

    revalidateComponentPaths(created.slug);
    return {
      error: null,
      redirectTo: `${withLocalePath(
        locale,
        `/dashboard/components/${created.componentId}/edit`
      )}?saved=1`,
    };
  } catch (error) {
    return {
      error: formatActionError(error, messages),
      redirectTo: null,
    };
  }
}

export async function updateComponentFormAction(
  componentId: string,
  _state: FormState,
  formData: FormData
) {
  const { locale, messages } = await getI18n();
  const viewer = await requireViewer();
  const intent = String(formData.get("intent") ?? "draft");

  try {
    const updated = await updateComponentDraft(
      componentId,
      viewer.id,
      draftInputFromFormData(formData)
    );

    if (intent === "submit") {
      await submitActiveRevision(componentId, viewer.id);
      revalidateComponentPaths(updated.slug);
      return {
        error: null,
        redirectTo: `${withLocalePath(locale, "/dashboard")}?submitted=1`,
      };
    }

    revalidateComponentPaths(updated.slug);
    return {
      error: null,
      redirectTo: `${withLocalePath(
        locale,
        `/dashboard/components/${componentId}/edit`
      )}?saved=1`,
    };
  } catch (error) {
    return {
      error: formatActionError(error, messages),
      redirectTo: null,
    };
  }
}

export async function startRevisionDraftAction(componentId: string) {
  const { locale } = await getI18n();
  const viewer = await requireViewer();
  const result = await startRevisionDraft(componentId, viewer.id);

  revalidateComponentPaths();
  redirect(withLocalePath(locale, `/dashboard/components/${result.componentId}/edit`));
}

export async function reviewComponentAction(
  componentId: string,
  decision: ModerationDecision,
  formData: FormData
) {
  const { locale } = await getI18n();
  const moderator = await requireModerator();
  const note = String(formData.get("note") ?? "");
  const reviewed = await reviewActiveRevision(
    componentId,
    moderator.id,
    decision,
    note,
    {
      primaryCategoryId: String(formData.get("primaryCategoryId") ?? ""),
      categoryIds: parseCategoryIds(
        typeof formData.get("categoryIds") === "string"
          ? String(formData.get("categoryIds"))
          : null
      ),
    }
  );

  revalidateComponentPaths(reviewed.slug);
  redirect(`${withLocalePath(locale, "/moderation")}?decision=${decision.toLowerCase()}`);
}
