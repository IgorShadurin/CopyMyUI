"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ZodError } from "zod";

import { withLocalePath } from "@/i18n/routing";
import {
  getI18n,
  translateServerError,
  translateZodIssue,
} from "@/i18n/server";
import { updateCategoryByAdmin } from "@/lib/server/category-service";
import { updatePlatformMarkupPercent } from "@/lib/server/platform-service";
import { categoryAdminSchema } from "@/lib/validation/category";
import { requireAdmin } from "@/lib/viewer";

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
