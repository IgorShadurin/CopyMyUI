"use server";

import { signIn, signOut } from "@/auth";
import { withLocalePath } from "@/i18n/routing";
import { getRequestLocale } from "@/i18n/server";
import { DEV_SESSION_COOKIE } from "@/lib/constants";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

async function getRequestOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) {
    return null;
  }

  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  return `${protocol}://${host}`;
}

async function toAbsoluteRedirect(path: string) {
  const origin = await getRequestOrigin();

  if (!origin) {
    return path;
  }

  return new URL(path, origin).toString();
}

export async function googleSignInAction(formData?: FormData) {
  const locale = await getRequestLocale();
  const fallbackRedirectPath = withLocalePath(locale, "/dashboard");
  let redirectPath = fallbackRedirectPath;

  // When provided, keep users on the same page after Google auth.
  // Only allow internal absolute paths to avoid open redirects.
  const nextValue = formData?.get("next");

  if (typeof nextValue === "string" && nextValue.startsWith("/") && !nextValue.startsWith("//")) {
    redirectPath = nextValue;
  }

  await signIn("google", {
    redirectTo: await toAbsoluteRedirect(redirectPath),
  });
}

export async function signOutAction() {
  const locale = await getRequestLocale();
  const redirectPath = withLocalePath(locale, "/");
  const cookieStore = await cookies();

  // Clear local dev-session impersonation so signed-out users do not
  // fall back to demo accounts (e.g. demo admin).
  cookieStore.delete(DEV_SESSION_COOKIE);

  await signOut({
    redirect: false,
    redirectTo: await toAbsoluteRedirect(redirectPath),
  });

  redirect(redirectPath);
}
