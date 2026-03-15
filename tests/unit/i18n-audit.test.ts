import { describe, expect, it } from "vitest";

import { auditMessages } from "@/i18n/audit";
import { messagesByLocale } from "@/i18n/messages";

describe("i18n audit", () => {
  it("passes for the current message catalogs", () => {
    expect(auditMessages(messagesByLocale)).toEqual([]);
  });

  it("flags untranslated English duplicates outside the allowlist", () => {
    const findings = auditMessages({
      en: {
        app: {
          name: "CopyMyUI",
        },
        section: {
          title: "Explore components",
        },
      },
      es: {
        app: {
          name: "CopyMyUI",
        },
        section: {
          title: "Explore components",
        },
      },
      ru: {
        app: {
          name: "CopyMyUI",
        },
        section: {
          title: "Компоненты",
        },
      },
      de: {
        app: {
          name: "CopyMyUI",
        },
        section: {
          title: "Komponenten",
        },
      },
    } as const);

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "untranslated-value",
          locale: "es",
          path: "section.title",
        }),
      ])
    );
    expect(findings).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          locale: "es",
          path: "app.name",
        }),
      ])
    );
  });
});
