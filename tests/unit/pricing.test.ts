import { describe, expect, it } from "vitest";

import {
  calculateBuyerPriceCents,
  calculatePlatformFeeCents,
  formatUsdCents,
  parseUsdToCents,
} from "@/lib/pricing";

describe("pricing helpers", () => {
  it("calculates buyer price and platform fee from the seller target", () => {
    expect(calculateBuyerPriceCents(10_000, 35)).toBe(13_500);
    expect(calculatePlatformFeeCents(10_000, 35)).toBe(3_500);
  });

  it("parses usd input safely", () => {
    expect(parseUsdToCents("$100")).toBe(10_000);
    expect(parseUsdToCents("114.75")).toBe(11_475);
    expect(parseUsdToCents("")).toBeNull();
    expect(parseUsdToCents("abc")).toBeNull();
  });

  it("formats usd cents for display", () => {
    expect(formatUsdCents(13_500)).toBe("$135.00");
  });
});
