import { cache } from "react";

import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { withLocalePath } from "@/i18n/routing";
import { getRequestLocale } from "@/i18n/server";
import { DEV_SESSION_COOKIE } from "@/lib/constants";
import { isDevSessionEnabled } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export type Viewer = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  profileSlug: string | null;
  role: UserRole;
};

async function getDevViewer() {
  if (!isDevSessionEnabled()) {
    return null;
  }

  const cookieStore = await cookies();
  const email = cookieStore.get(DEV_SESSION_COOKIE)?.value;

  if (!email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      profileSlug: true,
      role: true,
    },
  });
}

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const session = await auth();

  if (session?.user?.id) {
    return {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
      profileSlug: session.user.profileSlug ?? null,
      role: session.user.role,
    };
  }

  return getDevViewer();
});

export async function requireViewer() {
  const viewer = await getViewer();

  if (!viewer) {
    const locale = await getRequestLocale();
    redirect(withLocalePath(locale, "/auth/signin"));
  }

  return viewer;
}

export async function requireModerator() {
  const viewer = await requireViewer();

  if (viewer.role !== UserRole.MODERATOR && viewer.role !== UserRole.ADMIN) {
    const locale = await getRequestLocale();
    redirect(withLocalePath(locale, "/"));
  }

  return viewer;
}

export async function requireAdmin() {
  const viewer = await requireViewer();

  if (viewer.role !== UserRole.ADMIN) {
    const locale = await getRequestLocale();
    redirect(withLocalePath(locale, "/"));
  }

  return viewer;
}
