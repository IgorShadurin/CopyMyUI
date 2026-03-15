import { cleanupPath, E2E_BUILD_DIR } from "../helpers/test-runtime";

export default async function globalTeardown() {
  await cleanupPath(E2E_BUILD_DIR);
}
