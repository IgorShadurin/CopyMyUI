import { describe, expect, it } from "vitest";

import { getMessagesForLocale } from "@/i18n/messages";
import {
  getLocaleFromPathname,
  stripLocaleFromPathname,
  switchLocaleInPath,
  withLocalePath,
} from "@/i18n/routing";

describe("i18n routing", () => {
  it("prefixes internal hrefs with the requested locale", () => {
    expect(withLocalePath("en", "/components/aurora-tab-orbit")).toBe(
      "/en/components/aurora-tab-orbit"
    );
    expect(withLocalePath("de", "/components?category=media")).toBe(
      "/de/components?category=media"
    );
    expect(withLocalePath("ru", "https://copymyui.dev")).toBe("https://copymyui.dev");
  });

  it("can detect, strip, and switch locales in existing paths", () => {
    expect(getLocaleFromPathname("/es/components")).toBe("es");
    expect(stripLocaleFromPathname("/es/components")).toBe("/components");
    expect(switchLocaleInPath("/es/components", "de")).toBe("/de/components");
  });

  it("returns translated message catalogs for supported locales", () => {
    expect(getMessagesForLocale("es").header.explore).toBe("Explorar");
    expect(getMessagesForLocale("ru").favoritesPage.title).toBe("Ваше избранное");
    expect(getMessagesForLocale("de").localeSwitcher.label).toBe("Sprache");
  });
});
