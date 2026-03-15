import { UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  buildConsoleUserName,
  createConsoleUser,
  normalizeUserEmail,
  parseUserRole,
  resolveUserRole,
  setConsoleUserRole,
  type ManagedUser,
  type UserManagementClient,
} from "@/lib/server/user-management";

type MockUser = ManagedUser & {
  email: string;
};

function createMockClient(initialUsers: MockUser[] = []) {
  const state = {
    users: [...initialUsers],
  };

  function applySelect(user: MockUser, select?: Record<string, boolean>) {
    if (!select) {
      return { ...user };
    }

    return Object.fromEntries(
      Object.entries(select)
        .filter(([, enabled]) => enabled)
        .map(([key]) => [key, user[key as keyof MockUser]])
    );
  }

  const client = {
    user: {
      async findUnique(args: {
        where: { email?: string; id?: string; profileSlug?: string };
        select?: Record<string, boolean>;
      }) {
        const user =
          state.users.find((candidate) => {
            if (args.where.email) {
              return candidate.email === args.where.email;
            }

            if (args.where.id) {
              return candidate.id === args.where.id;
            }

            if (args.where.profileSlug) {
              return candidate.profileSlug === args.where.profileSlug;
            }

            return false;
          }) ?? null;

        return user ? applySelect(user, args.select) : null;
      },
      async create(args: {
        data: Partial<MockUser>;
        select?: Record<string, boolean>;
      }) {
        const user: MockUser = {
          id: `user-${state.users.length + 1}`,
          email: args.data.email ?? `user-${state.users.length + 1}@example.com`,
          name: args.data.name ?? null,
          profileSlug: args.data.profileSlug ?? null,
          role: (args.data.role as UserRole | undefined) ?? UserRole.USER,
          emailVerified: (args.data.emailVerified as Date | null | undefined) ?? null,
        };
        state.users.push(user);
        return applySelect(user, args.select);
      },
      async update(args: {
        where: { id: string };
        data: Partial<MockUser>;
        select?: Record<string, boolean>;
      }) {
        const user = state.users.find((candidate) => candidate.id === args.where.id);

        if (!user) {
          throw new Error(`Missing user ${args.where.id}`);
        }

        Object.assign(user, args.data);
        return applySelect(user, args.select);
      },
    },
  } as unknown as UserManagementClient;

  return { client, state };
}

describe("user management helpers", () => {
  it("normalizes valid emails and rejects invalid ones", () => {
    expect(normalizeUserEmail(" Admin@CopyMyUI.dev ")).toBe("admin@copymyui.dev");
    expect(() => normalizeUserEmail("not-an-email")).toThrowError(
      'Invalid email "not-an-email". Provide a valid email address.'
    );
  });

  it("builds a readable default name from an email", () => {
    expect(buildConsoleUserName("creator.team@copymyui.dev")).toBe("Creator Team");
  });

  it("parses only supported roles", () => {
    expect(parseUserRole("admin")).toBe(UserRole.ADMIN);
    expect(parseUserRole("MODERATOR")).toBe(UserRole.MODERATOR);
    expect(() => parseUserRole("owner")).toThrowError(
      'Invalid role "owner". Use one of: USER, MODERATOR, ADMIN.'
    );
  });

  it("keeps an existing database role instead of overwriting it from env lists", () => {
    expect(
      resolveUserRole({
        email: "editor@example.com",
        existingRole: UserRole.USER,
        adminEmails: new Set(["editor@example.com"]),
        moderatorEmails: new Set(),
      })
    ).toBe(UserRole.USER);

    expect(
      resolveUserRole({
        email: "fresh-admin@example.com",
        existingRole: null,
        adminEmails: new Set(["fresh-admin@example.com"]),
        moderatorEmails: new Set(),
      })
    ).toBe(UserRole.ADMIN);
  });

  it("creates a console user with a generated name, slug, and verified email", async () => {
    const { client } = createMockClient();
    const result = await createConsoleUser(client, {
      email: "creator.team@copymyui.dev",
    });

    expect(result.created).toBe(true);
    expect(result.user.email).toBe("creator.team@copymyui.dev");
    expect(result.user.name).toBe("Creator Team");
    expect(result.user.profileSlug).toBe("creator-team");
    expect(result.user.role).toBe(UserRole.USER);
    expect(result.user.emailVerified).toBeInstanceOf(Date);
  });

  it("backfills missing fields for an existing console user without recreating it", async () => {
    const { client, state } = createMockClient([
      {
        id: "user-1",
        email: "fan@copymyui.dev",
        name: null,
        profileSlug: null,
        role: UserRole.USER,
        emailVerified: null,
      },
    ]);

    const result = await createConsoleUser(client, {
      email: "fan@copymyui.dev",
    });

    expect(result.created).toBe(false);
    expect(result.user.id).toBe("user-1");
    expect(result.user.name).toBe("Fan");
    expect(result.user.profileSlug).toBe("fan");
    expect(result.user.emailVerified).toBeInstanceOf(Date);
    expect(state.users).toHaveLength(1);
  });

  it("updates a user's role and preserves a stable slug", async () => {
    const { client } = createMockClient([
      {
        id: "user-1",
        email: "moderator@copymyui.dev",
        name: "Moderator",
        profileSlug: "moderator",
        role: UserRole.USER,
        emailVerified: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);

    const result = await setConsoleUserRole(client, {
      email: "moderator@copymyui.dev",
      role: UserRole.MODERATOR,
    });

    expect(result.changed).toBe(true);
    expect(result.previousRole).toBe(UserRole.USER);
    expect(result.user.role).toBe(UserRole.MODERATOR);
    expect(result.user.profileSlug).toBe("moderator");
  });

  it("throws a descriptive error when trying to update a missing user", async () => {
    const { client } = createMockClient();

    await expect(
      setConsoleUserRole(client, {
        email: "missing@copymyui.dev",
        role: UserRole.ADMIN,
      })
    ).rejects.toThrowError(
      'User "missing@copymyui.dev" was not found. Run "npm run user:create -- --email=missing@copymyui.dev" first.'
    );
  });
});
