import "dotenv/config";

import { UserRole } from "@prisma/client";

import { prisma } from "../src/lib/prisma";
import { createConsoleUser, parseUserRole } from "../src/lib/server/user-management";

function parseArgs(argv: string[]) {
  const args = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const [key, inlineValue] = token.slice(2).split("=", 2);

    if (inlineValue !== undefined) {
      args.set(key, inlineValue);
      continue;
    }

    const nextToken = argv[index + 1];

    if (nextToken && !nextToken.startsWith("--")) {
      args.set(key, nextToken);
      index += 1;
      continue;
    }

    args.set(key, "true");
  }

  return args;
}

function getRequiredArg(args: Map<string, string>, name: string) {
  const value = args.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing required argument --${name}.`);
  }

  return value;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = getRequiredArg(args, "email");
  const name = args.get("name")?.trim();
  const role = args.has("role") ? parseUserRole(getRequiredArg(args, "role")) : UserRole.USER;
  const { created, user } = await createConsoleUser(prisma, {
    email,
    name,
    role,
  });

  console.log(
    created
      ? `Created user ${user.email} with role ${user.role} and profile slug "${user.profileSlug}".`
      : `User ${user.email} already exists with role ${user.role} and profile slug "${user.profileSlug}".`
  );
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error.";
    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
