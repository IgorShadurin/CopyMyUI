import { APP_NAME } from "@/lib/constants";

export function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}

export function getAuthSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? `${APP_NAME}-development-secret`;
}

export function isGoogleAuthConfigured() {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export function getModeratorEmails() {
  return new Set(
    (process.env.MODERATOR_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function getAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function isDevSessionEnabled() {
  return !isProduction() || process.env.ALLOW_DEV_SESSION === "true";
}
