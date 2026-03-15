import { afterEach, describe, expect, it } from "vitest";

import { absoluteUrl, buildShareLinks } from "@/lib/share";

const originalNextAuthUrl = process.env.NEXTAUTH_URL;

describe("share helpers", () => {
  afterEach(() => {
    process.env.NEXTAUTH_URL = originalNextAuthUrl;
  });

  it("builds absolute urls from relative component paths", () => {
    process.env.NEXTAUTH_URL = "https://copymyui.dev";

    expect(absoluteUrl("/en/components/aurora-tab-orbit")).toBe(
      "https://copymyui.dev/en/components/aurora-tab-orbit"
    );
  });

  it("creates social share links for both paths and full urls", () => {
    process.env.NEXTAUTH_URL = "https://copymyui.dev";

    const fromPath = buildShareLinks(
      "Aurora Tab Orbit",
      "/en/components/aurora-tab-orbit",
      "{title} en CopyMyUI"
    );
    const fromUrl = buildShareLinks(
      "Aurora Tab Orbit",
      "https://preview.copymyui.dev/de/components/aurora-tab-orbit",
      "{title} auf CopyMyUI"
    );

    const xPathUrl = new URL(fromPath.x);
    const redditUrl = new URL(fromUrl.reddit);

    expect(xPathUrl.searchParams.get("url")).toBe(
      "https://copymyui.dev/en/components/aurora-tab-orbit"
    );
    expect(xPathUrl.searchParams.get("text")).toBe("Aurora Tab Orbit en CopyMyUI");
    expect(redditUrl.searchParams.get("url")).toBe(
      "https://preview.copymyui.dev/de/components/aurora-tab-orbit"
    );
    expect(redditUrl.searchParams.get("title")).toBe("Aurora Tab Orbit auf CopyMyUI");
  });
});
