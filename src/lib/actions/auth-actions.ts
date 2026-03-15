"use server";

import { signIn, signOut } from "@/auth";
import { withLocalePath } from "@/i18n/routing";
import { getRequestLocale } from "@/i18n/server";
import { headers } from "next/headers";
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

export async function googleSignInAction() {
  const locale = await getRequestLocale();
  await signIn("google", {
    redirectTo: await toAbsoluteRedirect(withLocalePath(locale, "/dashboard")),
  });
}

export async function signOutAction() {
  const locale = await getRequestLocale();
  const redirectPath = withLocalePath(locale, "/");

  await signOut({
    redirect: false,
    redirectTo: await toAbsoluteRedirect(redirectPath),
  });

  redirect(redirectPath);
}
