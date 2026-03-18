import type { AppLocale } from "@/i18n/config";

type TranslationNode = string | { [key: string]: TranslationNode };

export type AuditFinding = {
  kind:
    | "missing-key"
    | "extra-key"
    | "invalid-value"
    | "empty-string"
    | "placeholder-mismatch"
    | "untranslated-value";
  locale: AppLocale;
  path: string;
  message: string;
};

const exactMatchAllowedPaths = new Set([
  "app.name",
  "languages.en",
  "languages.es",
  "languages.ru",
  "languages.de",
  "footer.xLabel",
  "share.linkedIn",
  "share.reddit",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function extractPlaceholders(value: string) {
  return Array.from(value.matchAll(/\{([a-zA-Z0-9_]+)\}/g))
    .map((match) => match[1] ?? "")
    .filter(Boolean)
    .sort();
}

function samePlaceholders(baseValue: string, localeValue: string) {
  const basePlaceholders = extractPlaceholders(baseValue);
  const localePlaceholders = extractPlaceholders(localeValue);

  return JSON.stringify(basePlaceholders) === JSON.stringify(localePlaceholders);
}

function pathLabel(path: string[]) {
  return path.join(".");
}

function isExactMatchAllowed(path: string) {
  return exactMatchAllowedPaths.has(path);
}

function auditAgainstBase(
  baseNode: TranslationNode,
  localeNode: unknown,
  locale: AppLocale,
  path: string[],
  findings: AuditFinding[]
) {
  const currentPath = pathLabel(path);

  if (typeof baseNode === "string") {
    if (typeof localeNode !== "string") {
      findings.push({
        kind: localeNode === undefined ? "missing-key" : "invalid-value",
        locale,
        path: currentPath,
        message:
          localeNode === undefined
            ? `Missing translation for "${currentPath}".`
            : `Expected a string at "${currentPath}".`,
      });
      return;
    }

    if (localeNode.trim().length === 0) {
      findings.push({
        kind: "empty-string",
        locale,
        path: currentPath,
        message: `Translation at "${currentPath}" is empty.`,
      });
    }

    if (!samePlaceholders(baseNode, localeNode)) {
      findings.push({
        kind: "placeholder-mismatch",
        locale,
        path: currentPath,
        message: `Placeholder mismatch at "${currentPath}".`,
      });
    }

    if (
      locale !== "en" &&
      baseNode.trim() === localeNode.trim() &&
      !isExactMatchAllowed(currentPath)
    ) {
      findings.push({
        kind: "untranslated-value",
        locale,
        path: currentPath,
        message: `Translation at "${currentPath}" still matches English exactly.`,
      });
    }

    return;
  }

  if (!isPlainObject(localeNode)) {
    findings.push({
      kind: localeNode === undefined ? "missing-key" : "invalid-value",
      locale,
      path: currentPath,
      message:
        localeNode === undefined
          ? `Missing translation group for "${currentPath}".`
          : `Expected an object at "${currentPath}".`,
    });
    return;
  }

  for (const [key, child] of Object.entries(baseNode)) {
    auditAgainstBase(child, localeNode[key], locale, [...path, key], findings);
  }

  for (const extraKey of Object.keys(localeNode)) {
    if (!(extraKey in baseNode)) {
      findings.push({
        kind: "extra-key",
        locale,
        path: pathLabel([...path, extraKey]),
        message: `Extra translation key "${pathLabel([...path, extraKey])}".`,
      });
    }
  }
}

export function auditMessages<TBase extends TranslationNode>(
  messagesByLocale: Partial<Record<AppLocale, TBase>>,
  baseLocale: AppLocale = "en"
) {
  const baseMessages = messagesByLocale[baseLocale];
  if (!baseMessages) {
    return [
      {
        kind: "missing-key" as const,
        locale: baseLocale,
        path: "root",
        message: `Base locale "${baseLocale}" is missing from messagesByLocale.`,
      },
    ];
  }
  const findings: AuditFinding[] = [];

  for (const locale of Object.keys(messagesByLocale) as AppLocale[]) {
    const localeMessages = messagesByLocale[locale];
    if (!localeMessages) {
      continue;
    }

    auditAgainstBase(baseMessages, localeMessages, locale, [], findings);
  }

  return findings;
}
