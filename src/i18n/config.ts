import { WORLD_LANGUAGES } from "@/i18n/world-languages";

type LanguageMeta = {
  name: string;
  nativeName: string;
};

export type AppLocale = keyof typeof WORLD_LANGUAGES;
export const defaultLocale: AppLocale = "en";

const languageEntries = Object.entries(WORLD_LANGUAGES) as Array<
  [AppLocale, LanguageMeta]
>;

const sortedLanguageCodes = languageEntries
  .map(([code]) => code)
  .sort((a, b) => a.localeCompare(b));

export const locales: AppLocale[] = [
  defaultLocale,
  ...sortedLanguageCodes.filter((code) => code !== defaultLocale),
];

// Keep SEO alternates and crawler metadata limited to locales with complete translations.
export const fullyTranslatedLocales: AppLocale[] = [
  defaultLocale,
  "es",
  "ru",
  "de",
  "fr",
  "it",
  "pt",
  "ja",
  "zh",
  "ko",
  "uk",
  "ar",
  "nl",
  "pl",
  "tr",
  "hi",
  "id",
  "fa",
  "vi",
  "he",
  "th",
  "bg",
  "cs",
];

export type LocaleOption = {
  code: AppLocale;
  name: string;
  nativeName: string;
  label: string;
};

// Priority languages for the largest global economies.
const richEconomyPriorityLocales: AppLocale[] = [
  "en",
  "zh",
  "de",
  "ja",
  "hi",
  "fr",
  "it",
  "pt",
  "ko",
  "es",
];

const worldLanguageMap = new Map<string, LanguageMeta>(languageEntries);

const localeOptionsBase: LocaleOption[] = locales.map((code) => {
  const meta = worldLanguageMap.get(code) ?? {
    name: code.toUpperCase(),
    nativeName: code.toUpperCase(),
  };
  const nativeName = meta.nativeName.trim();
  const englishName = meta.name.trim();
  const label =
    nativeName.toLowerCase() === englishName.toLowerCase()
      ? nativeName
      : `${nativeName} (${englishName})`;

  return {
    code,
    name: englishName,
    nativeName,
    label,
  };
});

const localeOptionByCode = new Map(localeOptionsBase.map((option) => [option.code, option]));
const priorityLocaleSet = new Set(richEconomyPriorityLocales);
const priorityLocaleOptions = richEconomyPriorityLocales
  .map((code) => localeOptionByCode.get(code))
  .filter((option): option is LocaleOption => Boolean(option));

const alphabeticalLocaleOptions = localeOptionsBase
  .filter((option) => !priorityLocaleSet.has(option.code))
  .sort((a, b) => a.name.localeCompare(b.name));

export const localeOptions: LocaleOption[] = [
  ...priorityLocaleOptions,
  ...alphabeticalLocaleOptions,
];

export function getLocaleOption(locale: AppLocale) {
  return localeOptions.find((option) => option.code === locale) ?? null;
}

export function getLocaleLabel(locale: AppLocale) {
  return getLocaleOption(locale)?.label ?? locale.toUpperCase();
}

export const localeCookieName = "copymyui-locale";
export const localeHeaderName = "x-copymyui-locale";
