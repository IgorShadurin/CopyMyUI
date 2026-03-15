"use client";

import { Toaster } from "sonner";

import { I18nProvider } from "@/i18n/client";
import type { AppLocale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({
  locale,
  messages,
  children,
}: {
  locale: AppLocale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <TooltipProvider>
        {children}
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </I18nProvider>
  );
}
