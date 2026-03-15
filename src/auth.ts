import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";

import { PrismaAdapter } from "@auth/prisma-adapter";

import { getAuthSecret, getAdminEmails, getModeratorEmails } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createUniqueProfileSlug } from "@/lib/server/profile-slug";
import { resolveUserRole } from "@/lib/server/user-management";

const moderatorEmails = getModeratorEmails();
const adminEmails = getAdminEmails();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  trustHost: true,
  secret: getAuthSecret(),
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "database",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "copymyui-dev-google-id",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "copymyui-dev-google-secret",
    }),
  ],
  callbacks: {
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
