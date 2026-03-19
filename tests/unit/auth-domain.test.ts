import { describe, expect, it } from "vitest";

import {
  getCanonicalAuthHost,
  isAllowedAuthReturnUrl,
  resolveAuthReturnUrl,
} from "@/lib/auth-domain";

describe("auth domain helpers", () => {
  it("resolves default auth host from locale subdomains", () => {
    expect(getCanonicalAuthHost("ru.copymyui.com")).toBe("copymyui.com");
    expect(getCanonicalAuthHost("copymyui.com")).toBe("copymyui.com");
    expect(getCanonicalAuthHost("localhost:3000")).toBe("localhost:3000");
  });

  it("accepts only project domains for cross-subdomain returns", () => {
    expect(
      isAllowedAuthReturnUrl(new URL("https://copymyui.com/en/components"), "ru.copymyui.com")
    ).toBe(true);
    expect(
      isAllowedAuthReturnUrl(new URL("https://zh.copymyui.com/components/demo"), "ru.copymyui.com")
    ).toBe(true);
    expect(
      isAllowedAuthReturnUrl(new URL("https://evil.example.com/phish"), "ru.copymyui.com")
    ).toBe(false);
  });

  it("resolves explicit, referer, and fallback return urls safely", () => {
    const fromRelativeNext = resolveAuthReturnUrl({
      explicitNext: "/components/demo",
      referer: null,
      fallbackPath: "/dashboard",
      requestHost: "ru.copymyui.com",
      requestOrigin: "https://ru.copymyui.com",
    });
    expect(fromRelativeNext.toString()).toBe("https://ru.copymyui.com/components/demo");

    const fromSafeReferer = resolveAuthReturnUrl({
      explicitNext: "https://evil.example.com/phish",
      referer: "https://de.copymyui.com/components/real-card",
      fallbackPath: "/dashboard",
      requestHost: "ru.copymyui.com",
      requestOrigin: "https://ru.copymyui.com",
    });
    expect(fromSafeReferer.toString()).toBe("https://de.copymyui.com/components/real-card");

    const fallback = resolveAuthReturnUrl({
      explicitNext: "https://evil.example.com/phish",
      referer: "https://another-evil.example.com/pwn",
      fallbackPath: "/dashboard",
      requestHost: "ru.copymyui.com",
      requestOrigin: "https://ru.copymyui.com",
    });
    expect(fallback.toString()).toBe("https://ru.copymyui.com/dashboard");
  });
});
