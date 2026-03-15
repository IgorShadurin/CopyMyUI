import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import net from "node:net";

export type TempTestWorkspace = {
  rootDir: string;
  dbPath: string;
  dbUrl: string;
  uploadNamespace: string;
  cleanup: () => Promise<void>;
};

export const E2E_BUILD_DIR = ".tmp/playwright-next-build";
export const E2E_PORT_RANGE = {
  min: 20_000,
  max: 55_000,
};

export async function cleanupPath(targetPath: string) {
  await rm(targetPath, {
    recursive: true,
    force: true,
  });
}

export function toSqliteUrl(dbPath: string) {
  return `file:${dbPath}`;
}

export async function createTempTestWorkspace(prefix: string): Promise<TempTestWorkspace> {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), `${prefix}-`));
  const dbPath = path.join(rootDir, "test.sqlite");
  const uploadNamespace = `${path.basename(rootDir)}-${randomUUID().slice(0, 8)}`;

  return {
    rootDir,
    dbPath,
    dbUrl: toSqliteUrl(dbPath),
    uploadNamespace,
    cleanup: async () => {
      await cleanupPath(rootDir);
    },
  };
}

async function canListenOnPort(port: number, host: string) {
  return new Promise<boolean>((resolve) => {
    const server = net.createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.listen(port, host, () => {
      server.close(() => {
        resolve(true);
      });
    });
  });
}

type FindAvailablePortOptions = {
  host?: string;
  min?: number;
  max?: number;
  attempts?: number;
  preferredPorts?: number[];
};

export async function findAvailablePort({
  host = "127.0.0.1",
  min = E2E_PORT_RANGE.min,
  max = E2E_PORT_RANGE.max,
  attempts = 30,
  preferredPorts = [],
}: FindAvailablePortOptions = {}) {
  const attempted = new Set<number>();

  for (const preferredPort of preferredPorts) {
    if (preferredPort <= 0) {
      continue;
    }

    attempted.add(preferredPort);

    if (await canListenOnPort(preferredPort, host)) {
      return preferredPort;
    }
  }

  for (let index = 0; index < attempts; index += 1) {
    const candidate =
      Math.floor(Math.random() * (max - min + 1)) + min;

    if (attempted.has(candidate)) {
      continue;
    }

    attempted.add(candidate);

    if (await canListenOnPort(candidate, host)) {
      return candidate;
    }
  }

  return new Promise<number>((resolve, reject) => {
    const server = net.createServer();

    server.once("error", reject);
    server.listen(0, host, () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        server.close(() => {
          reject(new Error("Unable to allocate a fallback port."));
        });
        return;
      }

      const port = address.port;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(port);
      });
    });
  });
}
