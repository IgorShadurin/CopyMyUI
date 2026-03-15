export const locales = ["en", "es", "ru", "de"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";
export const localeCookieName = "copymyui-locale";
export const localeHeaderName = "x-copymyui-locale";
