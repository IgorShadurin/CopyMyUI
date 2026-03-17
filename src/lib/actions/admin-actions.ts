"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ZodError, z } from "zod";

import { withLocalePath } from "@/i18n/routing";
import {
  getI18n,
  translateServerError,
  translateZodIssue,
} from "@/i18n/server";
import { updateCategoryByAdmin } from "@/lib/server/category-service";
import { updatePlatformMarkupPercent } from "@/lib/server/platform-service";
import {
  declineComponentByAdmin,
  deleteComponentByAdmin,
  updateComponentMetadataByAdmin,
} from "@/lib/server/component-service";
import { categoryAdminSchema } from "@/lib/validation/category";
import { requireAdmin } from "@/lib/viewer";

const adminComponentMetadataSchema = z.object({
  title: z.string().trim().min(3).max(80),
  summary: z.string().trim().min(20).max(160),
  primaryCategoryId: z.string().trim().min(1),
  featured: z.boolean(),
});

const adminBulkComponentActionSchema = z.object({
  bulkAction: z.enum(["decline", "delete"]),
  componentIds: z.array(z.string().trim().min(1)).min(1),
});

function revalidateAdminComponentPaths(componentSlug?: string) {
  revalidatePath("/");
  revalidatePath("/components");
  revalidatePath("/admin");
  revalidatePath("/admin/components");
  revalidatePath("/moderation");
  revalidatePath("/dashboard");
  revalidatePath("/favorites");
  revalidatePath("/purchases");
  revalidatePath("/categories/[slug]", "page");
  revalidatePath("/components/[slug]", "page");

  if (componentSlug) {
    revalidatePath(`/components/${componentSlug}`);
  }
}

export async function updatePlatformMarkupAction(formData: FormData) {
  const { locale, messages } = await getI18n();
  const admin = await requireAdmin();
  const nextMarkup = Number(String(formData.get("premiumMarkupPercent") ?? ""));

  try {
    await updatePlatformMarkupPercent(admin.id, nextMarkup);
    revalidatePath("/");
    revalidatePath("/components");
    revalidatePath("/admin");
    revalidatePath("/purchases");
    revalidatePath("/creators/[profileSlug]", "page");
    revalidatePath("/components/[slug]", "page");
    redirect(`${withLocalePath(locale, "/admin")}?updated=1`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof ZodError
        ? error.issues[0]
          ? translateZodIssue(error.issues[0], messages)
          : messages.errors.formIncomplete
        : error instanceof Error
        ? translateServerError(error.message, messages)
        : messages.errors.generic;
    redirect(
      `${withLocalePath(locale, "/admin")}?error=${encodeURIComponent(message)}`
    );
  }
}

export async function updateCategoryAction(formData: FormData) {
  const { locale, messages } = await getI18n();
  const admin = await requireAdmin();

  try {
    const input = categoryAdminSchema.parse({
      categoryId: String(formData.get("categoryId") ?? ""),
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      accent: String(formData.get("accent") ?? ""),
      description: String(formData.get("description") ?? ""),
    });

    const updated = await updateCategoryByAdmin(admin.id, input);

    revalidatePath("/");
    revalidatePath("/components");
    revalidatePath("/admin");
    revalidatePath(`/categories/${updated.slug}`);
    redirect(`${withLocalePath(locale, "/admin")}?updated=category`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof ZodError
        ? error.issues[0]
          ? translateZodIssue(error.issues[0], messages)
          : messages.errors.formIncomplete
        : error instanceof Error
        ? translateServerError(error.message, messages)
        : messages.errors.generic;
    redirect(
      `${withLocalePath(locale, "/admin")}?error=${encodeURIComponent(message)}`
    );
  }
}

export async function updateAdminComponentAction(
  componentId: string,
  formData: FormData
) {
  const { locale, messages } = await getI18n();
  await requireAdmin();

  try {
    const input = adminComponentMetadataSchema.parse({
      title: String(formData.get("title") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      primaryCategoryId: String(formData.get("primaryCategoryId") ?? ""),
      featured: formData.get("featured") === "on",
    });

    const updated = await updateComponentMetadataByAdmin(componentId, input);
    revalidateAdminComponentPaths(updated.slug);
    redirect(
      `${withLocalePath(locale, `/admin/components/${componentId}/edit`)}?updated=1`
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof ZodError
        ? error.issues[0]
          ? translateZodIssue(error.issues[0], messages)
          : messages.errors.formIncomplete
        : error instanceof Error
          ? translateServerError(error.message, messages)
          : messages.errors.generic;
    redirect(
      `${withLocalePath(
        locale,
        `/admin/components/${componentId}/edit`
      )}?error=${encodeURIComponent(message)}`
    );
  }
}

export async function declineAdminComponentAction(formData: FormData) {
  const { locale, messages } = await getI18n();
  const admin = await requireAdmin();
  const componentId = String(formData.get("componentId") ?? "");

  try {
    if (!componentId) {
      throw new Error(messages.errors.formIncomplete);
    }

    const declined = await declineComponentByAdmin(componentId, admin.id);
    revalidateAdminComponentPaths(declined.slug);
    redirect(`${withLocalePath(locale, "/admin/components")}?updated=declined`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error
        ? translateServerError(error.message, messages)
        : messages.errors.generic;
    redirect(
      `${withLocalePath(
        locale,
        "/admin/components"
      )}?error=${encodeURIComponent(message)}`
    );
  }
}

export async function deleteAdminComponentAction(formData: FormData) {
  const { locale, messages } = await getI18n();
  await requireAdmin();
  const componentId = String(formData.get("componentId") ?? "");

  try {
    if (!componentId) {
      throw new Error(messages.errors.formIncomplete);
    }

    const deleted = await deleteComponentByAdmin(componentId);
    revalidateAdminComponentPaths(deleted.slug);
    redirect(`${withLocalePath(locale, "/admin/components")}?updated=deleted`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error
        ? translateServerError(error.message, messages)
        : messages.errors.generic;
    redirect(
      `${withLocalePath(
        locale,
        "/admin/components"
      )}?error=${encodeURIComponent(message)}`
    );
  }
}

export async function bulkAdminComponentsAction(formData: FormData) {
  const { locale, messages } = await getI18n();
  const admin = await requireAdmin();

  try {
    const parsed = adminBulkComponentActionSchema.parse({
      bulkAction: String(formData.get("bulkAction") ?? ""),
      componentIds: Array.from(
        new Set(
          formData
            .getAll("componentIds")
            .map((value) => String(value).trim())
            .filter(Boolean)
        )
      ),
    });

    if (parsed.bulkAction === "decline") {
      for (const componentId of parsed.componentIds) {
        await declineComponentByAdmin(componentId, admin.id);
      }
      revalidateAdminComponentPaths();
      redirect(
        `${withLocalePath(locale, "/admin/components")}?updated=bulk-declined`
      );
    }

    for (const componentId of parsed.componentIds) {
      await deleteComponentByAdmin(componentId);
    }
    revalidateAdminComponentPaths();
    redirect(`${withLocalePath(locale, "/admin/components")}?updated=bulk-deleted`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof ZodError
        ? error.issues[0]
          ? translateZodIssue(error.issues[0], messages)
          : messages.errors.formIncomplete
        : error instanceof Error
          ? translateServerError(error.message, messages)
          : messages.errors.generic;
    redirect(
      `${withLocalePath(
        locale,
        "/admin/components"
      )}?error=${encodeURIComponent(message)}`
    );
  }
}
