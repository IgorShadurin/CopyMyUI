import { writeFile } from "node:fs/promises";
import path from "node:path";

import { locales, type AppLocale } from "../src/i18n/config";
import { ar } from "../src/i18n/locales/ar";
import { bg } from "../src/i18n/locales/bg";
import { cs } from "../src/i18n/locales/cs";
import { de } from "../src/i18n/locales/de";
import { en } from "../src/i18n/locales/en";
import { es } from "../src/i18n/locales/es";
import { fa } from "../src/i18n/locales/fa";
import { fr } from "../src/i18n/locales/fr";
import { he } from "../src/i18n/locales/he";
import { hi } from "../src/i18n/locales/hi";
import { id } from "../src/i18n/locales/id";
import { it } from "../src/i18n/locales/it";
import { ja } from "../src/i18n/locales/ja";
import { ko } from "../src/i18n/locales/ko";
import { nl } from "../src/i18n/locales/nl";
import { pl } from "../src/i18n/locales/pl";
import { pt } from "../src/i18n/locales/pt";
import { ru } from "../src/i18n/locales/ru";
import { th } from "../src/i18n/locales/th";
import { tr } from "../src/i18n/locales/tr";
import { uk } from "../src/i18n/locales/uk";
import { vi } from "../src/i18n/locales/vi";
import { zh } from "../src/i18n/locales/zh";
import { WORLD_LANGUAGES } from "../src/i18n/world-languages";
import type { Messages } from "../src/i18n/locales/types";

const canonicalLocaleObjects: Record<AppLocale, Messages> = {
  en,
  es,
  ru,
  de,
  fr,
  it,
  pt,
  ja,
  zh,
  ko,
  uk,
  ar,
  nl,
  pl,
  tr,
  hi,
  id,
  fa,
  vi,
  he,
  th,
  bg,
  cs,
} as Record<AppLocale, Messages>;

const canonicalLocales = new Set(Object.keys(canonicalLocaleObjects) as AppLocale[]);

const romanceFallbacks = new Set([
  "an",
  "ca",
  "co",
  "eo",
  "gl",
  "la",
  "oc",
  "ro",
  "rm",
  "sc",
  "wa",
]);

const germanicFallbacks = new Set(["af", "da", "fo", "fy", "is", "lb", "nn", "no", "sv"]);
const slavicFallbacks = new Set(["be", "cu", "mk", "sh", "sk", "sl", "sr"]);
const turkicFallbacks = new Set(["az", "ba", "kk", "ky", "tk", "tt", "ug", "uz"]);
const indoAryanFallbacks = new Set(["as", "bh", "bn", "gu", "mr", "ne", "pa", "sa", "sd", "si"]);
const southeastAsianFallbacks = new Set(["jv", "ms", "su", "tl"]);

function chooseFallback(locale: AppLocale): AppLocale {
  if (canonicalLocales.has(locale)) {
    return locale;
  }

  if (romanceFallbacks.has(locale)) {
    return "es";
  }

  if (germanicFallbacks.has(locale)) {
    return "de";
  }

  if (slavicFallbacks.has(locale)) {
    return "ru";
  }

  if (turkicFallbacks.has(locale)) {
    return "tr";
  }

  if (indoAryanFallbacks.has(locale)) {
    return "hi";
  }

  if (southeastAsianFallbacks.has(locale)) {
    return "id";
  }

  const sample = `${WORLD_LANGUAGES[locale]?.nativeName ?? ""} ${WORLD_LANGUAGES[locale]?.name ?? ""}`;

  if (/[\u0600-\u06FF]/.test(sample)) return "ar";
  if (/[\u0590-\u05FF]/.test(sample)) return "he";
  if (/[\u0400-\u04FF]/.test(sample)) return "ru";
  if (/[\u0370-\u03FF]/.test(sample)) return "de";
  if (/[\u0900-\u097F]/.test(sample)) return "hi";
  if (/[\u0980-\u09FF]/.test(sample)) return "hi";
  if (/[\u0A00-\u0A7F]/.test(sample)) return "hi";
  if (/[\u0A80-\u0AFF]/.test(sample)) return "hi";
  if (/[\u0B80-\u0BFF]/.test(sample)) return "hi";
  if (/[\u0C00-\u0C7F]/.test(sample)) return "hi";
  if (/[\u0D00-\u0D7F]/.test(sample)) return "hi";
  if (/[\u0E00-\u0E7F]/.test(sample)) return "th";
  if (/[\u1200-\u137F]/.test(sample)) return "ar";
  if (/[\u3040-\u30FF]/.test(sample)) return "ja";
  if (/[\uAC00-\uD7AF]/.test(sample)) return "ko";
  if (/[\u4E00-\u9FFF]/.test(sample)) return "zh";

  return "es";
}

function cloneMessages(messages: Messages): Messages {
  return JSON.parse(JSON.stringify(messages)) as Messages;
}

async function writeLocaleFile(locale: AppLocale, messages: Messages) {
  const fileContent = `import type { Messages } from "@/i18n/locales/types";\n\nexport const ${locale}: Messages = ${JSON.stringify(messages, null, 2)};\n`;
  const filePath = path.join(process.cwd(), "src", "i18n", "locales", `${locale}.ts`);
  await writeFile(filePath, fileContent, "utf8");
}

async function rewriteMessagesRegistry() {
  const lines = [
    `import type { AppLocale } from "@/i18n/config";`,
    ...locales.map((locale) => `import { ${locale} } from "@/i18n/locales/${locale}";`),
    `import type { Messages } from "@/i18n/locales/types";`,
    "",
    `export type { Messages } from "@/i18n/locales/types";`,
    "",
    `export const messagesByLocale: Partial<Record<AppLocale, Messages>> = {`,
    ...locales.map((locale) => `  ${locale},`),
    `};`,
    "",
    `const inProgressMessagesByLocale: Partial<Record<AppLocale, Messages>> = {};`,
    "",
    `export function getMessagesForLocale(locale: AppLocale) {`,
    `  return messagesByLocale[locale] ?? inProgressMessagesByLocale[locale] ?? en;`,
    `}`,
    "",
  ];

  await writeFile(path.join(process.cwd(), "src", "i18n", "messages.ts"), lines.join("\n"), "utf8");
}

async function main() {
  for (const locale of locales) {
    const fallback = chooseFallback(locale);
    const source = canonicalLocaleObjects[fallback] ?? en;
    await writeLocaleFile(locale, cloneMessages(source));
  }

  await rewriteMessagesRegistry();
  console.log(`Locale files written: ${locales.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
