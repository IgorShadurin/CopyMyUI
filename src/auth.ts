import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";

import { PrismaAdapter } from "@auth/prisma-adapter";

import {
  getAuthBaseDomain,
  getAuthCookieDomain,
  getAuthSecret,
  getAdminEmails,
  getModeratorEmails,
} from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createUniqueProfileSlug } from "@/lib/server/profile-slug";
import { sendTelegramNewUserRegistrationNotification } from "@/lib/server/telegram-notifications";
import { resolveUserRole } from "@/lib/server/user-management";
import { isLocalDebugHost } from "@/i18n/routing";

// Multi-domain setup (copymyui.com + locale subdomains) requires using the
// incoming request host. If AUTH_URL/NEXTAUTH_URL is set in platform env,
// next-auth forces that single origin and can redirect to localhost on errors.
delete process.env.AUTH_URL;
delete process.env.NEXTAUTH_URL;
delete process.env.NEXTAUTH_URL_INTERNAL;

const moderatorEmails = getModeratorEmails();
const adminEmails = getAdminEmails();
const authBaseDomain = getAuthBaseDomain();
const authCookieDomain = getAuthCookieDomain();
const isProduction = process.env.NODE_ENV === "production";
const sessionCookieName = isProduction
  ? "__Secure-copymyui.session-token"
  : "copymyui.session-token";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  trustHost: true,
  secret: getAuthSecret(),
  useSecureCookies: isProduction,
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "database",
  },
  cookies: {
    sessionToken: {
      name: sessionCookieName,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        ...(authCookieDomain ? { domain: authCookieDomain } : {}),
      },
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "copymyui-dev-google-id",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "copymyui-dev-google-secret",
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      let targetUrl: URL;
      let parsedBaseUrl: URL;

      try {
        targetUrl = new URL(url);
        parsedBaseUrl = new URL(baseUrl);
      } catch {
        return baseUrl;
      }

      if (targetUrl.origin === parsedBaseUrl.origin) {
        return targetUrl.toString();
      }

      const baseHost = parsedBaseUrl.hostname.toLowerCase();
      const candidateHost = targetUrl.hostname.toLowerCase();
      const allowedBaseDomain =
        authBaseDomain ?? (!isLocalDebugHost(baseHost) ? baseHost : null);

      if (!allowedBaseDomain) {
        return baseUrl;
      }

      if (targetUrl.protocol !== "https:") {
        return baseUrl;
      }

      if (
        candidateHost === allowedBaseDomain ||
        candidateHost.endsWith(`.${allowedBaseDomain}`)
      ) {
        return targetUrl.toString();
      }

      return baseUrl;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.profileSlug = user.profileSlug ?? null;
        session.user.role = user.role;
      }

      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) {
        return;
      }

      await sendTelegramNewUserRegistrationNotification({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
    },
    async signIn({ user }) {
      if (!user.email) {
        return;
      }

      const email = user.email.toLowerCase();
      const existing = await prisma.user.findUnique({
        where: { id: user.id! },
        select: {
          id: true,
          profileSlug: true,
          role: true,
        },
      });
      const nextRole = resolveUserRole({
        email,
        existingRole: existing?.role,
        adminEmails,
        moderatorEmails,
      });
      const profileSlug =
        existing?.profileSlug ??
        (await createUniqueProfileSlug(
          prisma,
          user.name?.trim() || email.split("@")[0] || "creator",
          user.id!
        ));

      await prisma.user.update({
        where: { id: user.id! },
        data: {
          role: nextRole,
          profileSlug,
        },
      });
    },
  },
});
