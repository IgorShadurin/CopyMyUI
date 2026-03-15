import os from "node:os";

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  workers: Math.min(4, Math.max(1, os.cpus().length)),
  retries: 0,
  use: {
    trace: "retain-on-failure",
  },
});
