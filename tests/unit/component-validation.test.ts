import { describe, expect, it } from "vitest";

import { ComponentAccessType } from "@prisma/client";

import {
  buildSearchIndexQuery,
  normalizeSearchQuery,
  tokenizeSearchQuery,
} from "@/lib/search";
import {
  componentDraftSchema,
  isSwiftUiSource,
  parseScreenshots,
} from "@/lib/validation/component";

const validSwiftCode = `import SwiftUI

struct DemoCard: View {
    var body: some View {
        Text("Hello")
    }
}
`;

describe("component validation", () => {
  it("accepts well-formed SwiftUI source", () => {
    expect(isSwiftUiSource(validSwiftCode)).toBe(true);
    expect(isSwiftUiSource("struct DemoCard { }")).toBe(false);
  });

  it("parses screenshot payloads and falls back safely on invalid input", () => {
    const parsed = parseScreenshots(
      JSON.stringify([
        {
          url: "/uploads/components/demo.png",
          storagePath: "uploads/components/demo.png",
          altText: "Demo screenshot",
        },
      ])
    );

    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.altText).toBe("Demo screenshot");
    expect(parseScreenshots("{not-json")).toEqual([]);
  });

  it("requires screenshots and sufficiently detailed content for drafts", () => {
    expect(() =>
      componentDraftSchema.parse({
        title: "Demo card",
        primaryCategoryId: "category-1",
        categoryIds: ["category-1"],
        summary: "This summary is definitely long enough to pass validation.",
        description:
          "This is a detailed description that explains the component clearly and satisfies the minimum length requirement.",
        changelog: "Initial version.",
        accessType: ComponentAccessType.FREE,
        sellerTargetPriceCents: null,
        swiftCode: validSwiftCode.repeat(10),
        screenshots: [],
      })
    ).toThrowError();
  });

  it("requires a payout target for premium drafts", () => {
    expect(() =>
      componentDraftSchema.parse({
        title: "Premium card",
        primaryCategoryId: "category-1",
        categoryIds: ["category-1"],
        summary: "This premium summary is definitely long enough to pass validation.",
        description:
          "This premium component description is long enough, detailed enough, and suitable for schema validation in the unit tests.",
        changelog: "Premium version.",
        accessType: ComponentAccessType.PREMIUM,
        sellerTargetPriceCents: null,
        swiftCode: validSwiftCode.repeat(10),
        screenshots: [
          {
            url: "/uploads/components/demo.png",
            storagePath: "uploads/components/demo.png",
            altText: "Premium demo screenshot",
          },
        ],
      })
    ).toThrowError();
  });

  it("rejects duplicate or excessive category selections", () => {
    expect(() =>
      componentDraftSchema.parse({
        title: "Duplicate category card",
        primaryCategoryId: "category-1",
        categoryIds: ["category-1", "category-1"],
        summary: "This summary is definitely long enough to pass validation.",
        description:
          "This is a detailed description that explains the component clearly and satisfies the minimum length requirement.",
        changelog: "Initial version.",
        accessType: ComponentAccessType.FREE,
        sellerTargetPriceCents: null,
        swiftCode: validSwiftCode.repeat(10),
        screenshots: [
          {
            url: "/uploads/components/demo.png",
            storagePath: "uploads/components/demo.png",
            altText: "Demo screenshot",
          },
        ],
      })
    ).toThrowError();

    expect(() =>
      componentDraftSchema.parse({
        title: "Too many categories",
        primaryCategoryId: "category-1",
        categoryIds: ["category-1", "category-2", "category-3", "category-4"],
        summary: "This summary is definitely long enough to pass validation.",
        description:
          "This is a detailed description that explains the component clearly and satisfies the minimum length requirement.",
        changelog: "Initial version.",
        accessType: ComponentAccessType.FREE,
        sellerTargetPriceCents: null,
        swiftCode: validSwiftCode.repeat(10),
        screenshots: [
          {
            url: "/uploads/components/demo.png",
            storagePath: "uploads/components/demo.png",
            altText: "Demo screenshot",
          },
        ],
      })
    ).toThrowError();
  });

  it("requires the primary category to be included in the selected category list", () => {
    expect(() =>
      componentDraftSchema.parse({
        title: "Primary mismatch",
        primaryCategoryId: "category-1",
        categoryIds: ["category-2"],
        summary: "This summary is definitely long enough to pass validation.",
        description:
          "This is a detailed description that explains the component clearly and satisfies the minimum length requirement.",
        changelog: "Initial version.",
        accessType: ComponentAccessType.FREE,
        sellerTargetPriceCents: null,
        swiftCode: validSwiftCode.repeat(10),
        screenshots: [
          {
            url: "/uploads/components/demo.png",
            storagePath: "uploads/components/demo.png",
            altText: "Demo screenshot",
          },
        ],
      })
    ).toThrowError();
  });
});

describe("search helpers", () => {
  it("normalizes and tokenizes search input safely for shared URLs and FTS", () => {
    expect(normalizeSearchQuery("   hello   world   ")).toBe("hello world");
    expect(tokenizeSearchQuery("<script>alert(1)</script> Aurora Creator")).toEqual([
      "script",
      "alert",
      "1",
      "aurora",
      "creator",
    ]);
    expect(buildSearchIndexQuery("Aurora creator")).toBe("aurora* AND creator*");
  });
});
