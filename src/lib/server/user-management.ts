import type { PrismaClient } from "@prisma/client";
import { UserRole } from "@prisma/client";

import { createUniqueProfileSlug } from "@/lib/server/profile-slug";

export type UserManagementClient = Pick<PrismaClient, "user">;

export type ManagedUser = {
  id: string;
  email: string | null;
  name: string | null;
  profileSlug: string | null;
  role: UserRole;
  emailVerified: Date | null;
};

type CreateConsoleUserOptions = {
  email: string;
  name?: string;
  role?: UserRole;
};

type SetConsoleUserRoleOptions = {
  email: string;
  role: UserRole;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const managedUserSelect = {
  id: true,
  email: true,
  name: true,
  profileSlug: true,
  role: true,
  emailVerified: true,
} as const;

export function normalizeUserEmail(value: string) {
  const email = value.trim().toLowerCase();

  if (!emailPattern.test(email)) {
    throw new Error(`Invalid email "${value}". Provide a valid email address.`);
  }

  return email;
}

export function buildConsoleUserName(email: string) {
  const localPart = email.split("@")[0] ?? "creator";
  const words = localPart.split(/[^a-zA-Z0-9]+/).filter(Boolean);

  if (words.length === 0) {
    return "Creator";
  }

  return words
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function parseUserRole(value: string) {
  const normalized = value.trim().toUpperCase();

  switch (normalized) {
    case "USER":
      return UserRole.USER;
    case "MODERATOR":
      return UserRole.MODERATOR;
    case "ADMIN":
      return UserRole.ADMIN;
    default:
      throw new Error(
        `Invalid role "${value}". Use one of: USER, MODERATOR, ADMIN.`
      );
  }
}

export function resolveUserRole({
  email,
  existingRole,
  adminEmails,
  moderatorEmails,
}: {
  email: string;
  existingRole?: UserRole | null;
  adminEmails: Set<string>;
  moderatorEmails: Set<string>;
}) {
  if (existingRole) {
    return existingRole;
  }

  if (adminEmails.has(email)) {
    return UserRole.ADMIN;
  }

  if (moderatorEmails.has(email) || email.includes("moderator")) {
    return UserRole.MODERATOR;
  }

  return UserRole.USER;
}

async function ensureProfileSlug(
  client: UserManagementClient,
  user: Pick<ManagedUser, "id" | "email" | "name" | "profileSlug">
) {
  if (user.profileSlug) {
    return user.profileSlug;
  }

  return createUniqueProfileSlug(
    client,
    user.name?.trim() || buildConsoleUserName(user.email ?? "creator@example.com"),
    user.id
  );
}

export async function createConsoleUser(
  client: UserManagementClient,
  options: CreateConsoleUserOptions
) {
  const email = normalizeUserEmail(options.email);
  const name = options.name?.trim() || buildConsoleUserName(email);
  const existing = await client.user.findUnique({
    where: { email },
    select: managedUserSelect,
  });

  if (existing) {
    const data: Partial<ManagedUser> = {};

    if (!existing.name) {
      data.name = name;
    }

    if (!existing.profileSlug) {
      data.profileSlug = await ensureProfileSlug(client, existing);
    }

    if (!existing.emailVerified) {
      data.emailVerified = new Date();
    }

    if (Object.keys(data).length === 0) {
      return {
        created: false,
        user: existing,
      };
    }

    const user = await client.user.update({
      where: { id: existing.id },
      data,
      select: managedUserSelect,
    });

    return {
      created: false,
      user,
    };
  }

  const user = await client.user.create({
    data: {
      email,
      name,
      role: options.role ?? UserRole.USER,
      emailVerified: new Date(),
      profileSlug: await createUniqueProfileSlug(client, name),
    },
    select: managedUserSelect,
  });

  return {
    created: true,
    user,
  };
}

export async function setConsoleUserRole(
  client: UserManagementClient,
  options: SetConsoleUserRoleOptions
) {
  const email = normalizeUserEmail(options.email);
  const existing = await client.user.findUnique({
    where: { email },
    select: managedUserSelect,
  });

  if (!existing) {
    throw new Error(
      `User "${email}" was not found. Run "npm run user:create -- --email=${email}" first.`
    );
  }

  const data: Partial<ManagedUser> = {};

  if (existing.role !== options.role) {
    data.role = options.role;
  }

  if (!existing.profileSlug) {
    data.profileSlug = await ensureProfileSlug(client, existing);
  }

  if (!existing.emailVerified) {
    data.emailVerified = new Date();
  }

  if (Object.keys(data).length === 0) {
    return {
      changed: false,
      previousRole: existing.role,
      user: existing,
    };
  }

  const user = await client.user.update({
    where: { id: existing.id },
    data,
    select: managedUserSelect,
  });

  return {
    changed: existing.role !== options.role,
    previousRole: existing.role,
    user,
  };
}
