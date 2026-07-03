import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppLocale } from "@/i18n/config";

const originalEnv = {
  localeRoutingMode: process.env.NEXT_PUBLIC_LOCALE_ROUTING_MODE,
  localeBaseDomain: process.env.NEXT_PUBLIC_LOCALE_BASE_DOMAIN,
  nextAuthUrl: process.env.NEXTAUTH_URL,
};

async function generateComponentsMetadata(searchParams: {
  q?: string;
  category?: string;
  access?: string;
  sort?: string;
  page?: string;
}, locale: AppLocale = "th") {
  const [{ buildComponentsPageMetadata }, { getMessagesForLocale }] = await Promise.all([
    import("@/lib/components-page-metadata"),
    import("@/i18n/messages"),
  ]);

  return buildComponentsPageMetadata({
    locale,
    messages: getMessagesForLocale(locale),
    searchParams,
  });
}

describe("components page metadata", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_LOCALE_ROUTING_MODE = "domain";
    process.env.NEXT_PUBLIC_LOCALE_BASE_DOMAIN = "copymyui.com";
    process.env.NEXTAUTH_URL = "https://copymyui.com";
  });

  afterEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_LOCALE_ROUTING_MODE = originalEnv.localeRoutingMode;
    process.env.NEXT_PUBLIC_LOCALE_BASE_DOMAIN = originalEnv.localeBaseDomain;
    process.env.NEXTAUTH_URL = originalEnv.nextAuthUrl;
  });

  it("keeps localized faceted listing pages indexable", async () => {
    const metadata = await generateComponentsMetadata({
      category: "media",
      page: "2",
    });

    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    });
    expect(metadata.alternates?.canonical).toBe(
      "https://th.copymyui.com/components?category=media&page=2"
    );
  });

  it("keeps search result pages out of the index", async () => {
    const metadata = await generateComponentsMetadata({
      q: "Aurora",
      category: "media",
      page: "2",
    });

    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    });
    expect(metadata.alternates?.canonical).toBe("https://th.copymyui.com/components");
  });
});
