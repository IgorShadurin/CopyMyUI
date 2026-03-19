"use server";

import { signIn, signOut } from "@/auth";
import {
  getCanonicalAuthHost,
  getRequestHostFromHeaders,
  getRequestOriginFromHeaders,
  getRequestProtocolFromHeaders,
  isSameHost,
  resolveAuthReturnUrl,
} from "@/lib/auth-domain";
import { withLocalePath } from "@/i18n/routing";
import { getRequestLocale } from "@/i18n/server";
import { DEV_SESSION_COOKIE } from "@/lib/constants";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function googleSignInAction(formData?: FormData) {
  const headerStore = await headers();
  const locale = await getRequestLocale();
  const fallbackRedirectPath = withLocalePath(locale, "/dashboard");

  const requestHost = getRequestHostFromHeaders(headerStore);
  const requestOrigin = getRequestOriginFromHeaders(headerStore);

  if (!requestHost || !requestOrigin) {
    await signIn("google", {
      redirectTo: fallbackRedirectPath,
    });
    return;
  }

  const nextValue = formData?.get("next");
  const explicitNext = typeof nextValue === "string" ? nextValue : null;
  const returnUrl = resolveAuthReturnUrl({
    explicitNext,
    referer: headerStore.get("referer"),
    fallbackPath: fallbackRedirectPath,
    requestHost,
    requestOrigin,
  });

  const canonicalAuthHost = getCanonicalAuthHost(requestHost);
  if (!isSameHost(requestHost, canonicalAuthHost)) {
    const protocol = getRequestProtocolFromHeaders(headerStore, requestHost);
    const signInUrl = new URL(
      withLocalePath(locale, "/auth/signin"),
      `${protocol}://${canonicalAuthHost}`
    );
    signInUrl.searchParams.set("next", returnUrl.toString());
    redirect(signInUrl.toString());
  }

  await signIn("google", {
    redirectTo: returnUrl.toString(),
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
    redirectTo: redirectPath,
  });

  redirect(redirectPath);
}
