"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { withLocalePath } from "@/i18n/routing";
import { getI18n, translateServerError } from "@/i18n/server";
import { purchasePremiumComponent } from "@/lib/server/marketplace-service";
import { requireViewer } from "@/lib/viewer";

export async function purchasePremiumComponentAction(componentId: string, slug: string) {
  const { locale, messages } = await getI18n();
  const viewer = await requireViewer();

  try {
    const purchased = await purchasePremiumComponent(componentId, viewer.id);

    revalidatePath("/");
    revalidatePath("/components");
    revalidatePath("/favorites");
    revalidatePath("/purchases");
    revalidatePath(`/components/${purchased.slug}`);
    redirect(
      `${withLocalePath(locale, `/components/${purchased.slug}`)}?purchased=1`
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error
        ? translateServerError(error.message, messages)
        : messages.errors.generic;
    redirect(
      `${withLocalePath(locale, `/components/${slug}`)}?purchaseError=${encodeURIComponent(
        message
      )}`
    );
  }
}
