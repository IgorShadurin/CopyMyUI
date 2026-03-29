/* eslint-disable react-hooks/rules-of-hooks */

import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import {
  expect,
  test as base,
  type APIRequestContext,
  type BrowserContext,
  type Page,
} from "@playwright/test";

import {
  cleanupPath,
  createTempTestWorkspace,
  E2E_BUILD_DIR,
  findAvailablePort,
  type TempTestWorkspace,
} from "../helpers/test-runtime";

type RunningApp = {
  baseURL: string;
  port: number;
  workspace: TempTestWorkspace;
};

function getCommand(binary: "npm" | "npx") {
  return process.platform === "win32" ? `${binary}.cmd` : binary;
}

async function runCommand(command: string, args: string[], env: NodeJS.ProcessEnv, logs: string[]) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout?.on("data", (chunk: Buffer | string) => {
    logs.push(chunk.toString());
  });
  child.stderr?.on("data", (chunk: Buffer | string) => {
    logs.push(chunk.toString());
  });

  const [exitCode] = (await once(child, "exit")) as [number | null];

  if (exitCode !== 0) {
    throw new Error(`Command "${command} ${args.join(" ")}" failed with exit code ${exitCode}.`);
  }
}

async function stopProcess(child: ChildProcess | null) {
  if (!child || child.exitCode !== null) {
    return;
  }

  child.kill("SIGTERM");

  await Promise.race([
    once(child, "exit"),
    delay(3_000).then(() => {
      if (child.exitCode === null) {
        child.kill("SIGKILL");
      }
    }),
  ]);
}

async function waitForServer(url: string, child: ChildProcess, logs: string[]) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 30_000) {
    if (child.exitCode !== null) {
      throw new Error(`Server process exited early.\n${logs.join("")}`);
    }

    try {
      const response = await fetch(url, {
        redirect: "manual",
      });

      if (response.ok || response.status === 307 || response.status === 308) {
        return;
      }
    } catch {}

    await delay(250);
  }

  throw new Error(`Timed out waiting for ${url}.\n${logs.join("")}`);
}

const host = "127.0.0.1";

export const test = base.extend<{
  app: RunningApp;
  baseURL: string;
  context: BrowserContext;
  page: Page;
  request: APIRequestContext;
}>({
  app: async ({}, use, testInfo) => {
    const logs: string[] = [];
    const workspace = await createTempTestWorkspace("copymyui-e2e");
    const uploadRoot = path.join(
      process.cwd(),
      "public",
      "uploads",
      "components",
      workspace.uploadNamespace
    );
    const port = await findAvailablePort({
      host,
      preferredPorts: [30_000 + (testInfo.parallelIndex % 1_000)],
    });
    const baseURL = `http://${host}:${port}`;
    const sharedEnv: NodeJS.ProcessEnv = {
      ...process.env,
      ADMIN_EMAILS: "admin@copymyui.dev",
      ALLOW_DEV_SESSION: "true",
      AUTH_SECRET: "copymyui-playwright-secret",
      COPYMYUI_UPLOAD_NAMESPACE: workspace.uploadNamespace,
      COPYMYUI_SEED_PROFILE: "e2e",
      DATABASE_URL: workspace.dbUrl,
      MODERATOR_EMAILS: "moderator@copymyui.dev",
      NEXTAUTH_URL: baseURL,
      NEXT_DIST_DIR: E2E_BUILD_DIR,
      NEXT_PUBLIC_LOCALE_ROUTING_MODE: "path",
      NEXT_TELEMETRY_DISABLED: "1",
      NODE_ENV: "production",
      LOCALE_ROUTING_MODE: "path",
    };

    let serverProcess: ChildProcess | null = null;

    try {
      await runCommand(
        getCommand("npx"),
        ["prisma", "db", "push"],
        sharedEnv,
        logs
      );
      await runCommand(getCommand("npx"), ["tsx", "prisma/seed.ts"], sharedEnv, logs);

      const startedServerProcess = spawn(
        getCommand("npm"),
        ["run", "start", "--", "--hostname", host, "--port", String(port)],
        {
          cwd: process.cwd(),
          env: sharedEnv,
          stdio: ["ignore", "pipe", "pipe"],
        }
      );
      serverProcess = startedServerProcess;

      startedServerProcess.stdout?.on("data", (chunk: Buffer | string) => {
        logs.push(chunk.toString());
      });
      startedServerProcess.stderr?.on("data", (chunk: Buffer | string) => {
        logs.push(chunk.toString());
      });

      await waitForServer(`${baseURL}/en`, startedServerProcess, logs);

      await use({
        baseURL,
        port,
        workspace,
      });
    } catch (error) {
      await testInfo.attach("e2e-server.log", {
        body: Buffer.from(logs.join("")),
        contentType: "text/plain",
      });
      throw error;
    } finally {
      await stopProcess(serverProcess);
      await cleanupPath(uploadRoot);
      await workspace.cleanup();

      if (testInfo.status !== testInfo.expectedStatus) {
        await testInfo.attach("e2e-server.log", {
          body: Buffer.from(logs.join("")),
          contentType: "text/plain",
        });
      }
    }
  },

  baseURL: async ({ app }, use) => {
    await use(app.baseURL);
  },

  context: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext({
      baseURL,
    });

    await use(context);
    await context.close();
  },

  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
  },

  request: async ({ playwright, baseURL }, use) => {
    const request = await playwright.request.newContext({
      baseURL,
    });

    await use(request);
    await request.dispose();
  },
});

export { expect };
