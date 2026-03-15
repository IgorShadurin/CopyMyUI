import { NextResponse, type NextRequest } from "next/server";

import { DEV_SESSION_COOKIE } from "@/lib/constants";
import { getAdminEmails, getModeratorEmails, isDevSessionEnabled } from "@/lib/env";
import { getRequestOrigin } from "@/lib/request-origin";
import { prisma } from "@/lib/prisma";
import { createUniqueProfileSlug } from "@/lib/server/profile-slug";
import { resolveUserRole } from "@/lib/server/user-management";

const moderatorEmails = getModeratorEmails();
const adminEmails = getAdminEmails();

export async function GET(request: NextRequest) {
  if (!isDevSessionEnabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  const redirectTo = request.nextUrl.searchParams.get("redirectTo") || "/";
  const response = NextResponse.redirect(new URL(redirectTo, getRequestOrigin(request)));

  if (!email) {
    response.cookies.delete(DEV_SESSION_COOKIE);
    return response;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      profileSlug: true,
      role: true,
    },
  });
  const role = resolveUserRole({
    email,
    existingRole: existingUser?.role,
    adminEmails,
    moderatorEmails,
  });

  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0].replace(/[-_.]/g, " "),
        role,
        profileSlug: await createUniqueProfileSlug(
          prisma,
          email.split("@")[0].replace(/[-_.]/g, " ")
        ),
      },
    }));

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        profileSlug:
          existingUser.profileSlug ??
          (await createUniqueProfileSlug(
            prisma,
            existingUser.name ?? email.split("@")[0],
            existingUser.id
          )),
      },
    });
  }

  response.cookies.set(DEV_SESSION_COOKIE, user.email!, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  return response;
}
