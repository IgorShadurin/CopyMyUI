"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button-variants";
import { locales, type AppLocale } from "@/i18n/config";
import { switchLocaleInPath } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const localeFlags: Record<AppLocale, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  ru: "🇷🇺",
  de: "🇩🇪",
};

export function LocaleSwitcher({
  locale,
  label,
  languageLabels,
  className,
}: {
  locale: AppLocale;
  label: string;
  languageLabels: Record<AppLocale, string>;
  className?: string;
}) {
  const pathname = usePathname() ?? `/${locale}`;
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  function navigateToLocale(nextLocale: AppLocale) {
    const href = `${switchLocaleInPath(pathname, nextLocale)}${query ? `?${query}` : ""}`;

    if (nextLocale === locale) {
      return;
    }

    window.location.assign(href);
  }

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          data-testid="locale-switcher-trigger"
          aria-label={label}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-11 min-w-[8.75rem] justify-between rounded-full border-black/8 bg-white/85 px-4 shadow-sm"
          )}
        >
          <span className="inline-flex items-center gap-2 truncate">
            <span aria-hidden="true" className="text-base">
              {localeFlags[locale]}
            </span>
            <span className="truncate">{languageLabels[locale]}</span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 rounded-2xl border border-black/6 bg-[rgba(252,251,247,0.98)] p-1.5 shadow-[0_24px_60px_-36px_rgba(22,18,12,0.28)]"
        >
          <DropdownMenuRadioGroup value={locale}>
            {locales.map((item) => (
              <DropdownMenuRadioItem
                key={item}
                value={item}
                data-testid={`locale-option-${item}`}
                className="rounded-xl px-3 py-2.5 text-sm"
                onClick={() => navigateToLocale(item)}
              >
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="text-base">
                    {localeFlags[item]}
                  </span>
                  <span>{languageLabels[item]}</span>
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
