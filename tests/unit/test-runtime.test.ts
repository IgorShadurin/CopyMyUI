import { access } from "node:fs/promises";
import net from "node:net";

import { afterAll, describe, expect, it } from "vitest";

import { createTempTestWorkspace, findAvailablePort } from "../helpers/test-runtime";

const servers: net.Server[] = [];

afterAll(async () => {
  await Promise.all(
    servers.map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        })
    )
  );
});

describe("test runtime helpers", () => {
  it("creates and cleans up isolated temp workspaces", async () => {
    const workspace = await createTempTestWorkspace("copymyui-unit");

    expect(workspace.dbUrl).toContain(workspace.dbPath);
    expect(workspace.uploadNamespace).not.toHaveLength(0);

    await workspace.cleanup();

    await expect(access(workspace.rootDir)).rejects.toThrow();
  });

  it("falls back to a different port when a preferred one is busy", async () => {
    const busyServer = net.createServer();
    servers.push(busyServer);

    await new Promise<void>((resolve) => {
      busyServer.listen(0, "127.0.0.1", () => resolve());
    });

    const address = busyServer.address();

    if (!address || typeof address === "string") {
      throw new Error("Failed to allocate a busy test port.");
    }

    const freePort = await findAvailablePort({
      host: "127.0.0.1",
      preferredPorts: [address.port],
      min: address.port,
      max: address.port + 20,
      attempts: 10,
    });

    expect(freePort).not.toBe(address.port);
  });
});
