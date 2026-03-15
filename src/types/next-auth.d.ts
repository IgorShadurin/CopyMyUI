import type { DefaultSession } from "next-auth";

import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      profileSlug?: string | null;
      role: UserRole;
    };
  }

  interface User {
    profileSlug?: string | null;
    role: UserRole;
  }
}
