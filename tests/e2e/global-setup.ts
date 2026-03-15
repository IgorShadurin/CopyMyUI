import { spawn } from "node:child_process";
import { once } from "node:events";

import { cleanupPath, E2E_BUILD_DIR } from "../helpers/test-runtime";

function getCommand(binary: "npm" | "npx") {
  return process.platform === "win32" ? `${binary}.cmd` : binary;
}

async function runCommand(command: string, args: string[], env: NodeJS.ProcessEnv) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env,
    stdio: "inherit",
  });

  const [exitCode] = (await once(child, "exit")) as [number | null];

  if (exitCode !== 0) {
    throw new Error(`Command "${command} ${args.join(" ")}" failed with exit code ${exitCode}.`);
  }
}

export default async function globalSetup() {
  await cleanupPath(".next");
  await cleanupPath(E2E_BUILD_DIR);

  await runCommand(getCommand("npm"), ["run", "build"], {
    ...process.env,
    NEXT_DIST_DIR: E2E_BUILD_DIR,
    NEXT_TELEMETRY_DISABLED: "1",
  });
}
