import "dotenv/config";

import { prisma } from "../src/lib/prisma";
import { parseUserRole, setConsoleUserRole } from "../src/lib/server/user-management";

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
  const role = parseUserRole(getRequiredArg(args, "role"));
  const { changed, previousRole, user } = await setConsoleUserRole(prisma, {
    email,
    role,
  });

  console.log(
    changed
      ? `Updated ${user.email} from ${previousRole} to ${user.role}.`
      : `${user.email} already has role ${user.role}.`
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
