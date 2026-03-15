"use client";

import { createContext, useContext } from "react";

import type { AppLocale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";

const I18nContext = createContext<{
  locale: AppLocale;
  messages: Messages;
} | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: AppLocale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, messages }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider.");
  }

  return context;
}
