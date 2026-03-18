"use client";

import { useMemo, useState } from "react";
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
import {
  getLocaleLabel,
  localeOptions,
  type AppLocale,
} from "@/i18n/config";
import {
  getLocaleHostForLocale,
  isDomainLocaleRoutingEnabled,
  isLocalDebugHost,
  stripLocaleFromPathname,
  switchLocaleInPath,
} from "@/i18n/routing";
import { cn } from "@/lib/utils";

const DISPUTED_REGION_CODES = new Set(["TW", "HK", "MO", "PS", "XK", "EH"]);

const localeRegionOverrides: Partial<Record<AppLocale, string>> = {
  en: "US",
  es: "ES",
  pt: "PT",
  zh: "CN",
};

const localeFlagCache = new Map<string, string>();

function regionCodeToFlagEmoji(regionCode: string) {
  if (!/^[A-Z]{2}$/.test(regionCode)) {
    return null;
  }

  return String.fromCodePoint(
    ...regionCode
      .split("")
      .map((character) => 0x1f1e6 + character.charCodeAt(0) - 65)
  );
}

function getLocaleFlagEmoji(localeCode: string) {
  const cached = localeFlagCache.get(localeCode);
  if (cached) {
    return cached;
  }

  const override = localeRegionOverrides[localeCode as AppLocale];
  if (override) {
    const overrideFlag = regionCodeToFlagEmoji(override.toUpperCase());
    if (overrideFlag) {
      localeFlagCache.set(localeCode, overrideFlag);
      return overrideFlag;
    }
  }

  try {
    const maximizedLocale = new Intl.Locale(localeCode).maximize();
    const region = maximizedLocale.region?.toUpperCase();

    if (region && DISPUTED_REGION_CODES.has(region)) {
      localeFlagCache.set(localeCode, "🌐");
      return "🌐";
    }

    if (region) {
      const flag = regionCodeToFlagEmoji(region);
      if (flag) {
        localeFlagCache.set(localeCode, flag);
        return flag;
      }
    }
  } catch {
    // Fall through to neutral icon when locale subtags are unsupported.
  }

  localeFlagCache.set(localeCode, "🌐");
  return "🌐";
}

export function LocaleSwitcher({
  locale,
  label,
  languageLabels,
  className,
}: {
  locale: AppLocale;
  label: string;
  languageLabels?: Readonly<Record<string, string>>;
  className?: string;
}) {
  const pathname = usePathname() ?? `/${locale}`;
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [localeQuery, setLocaleQuery] = useState("");
  const normalizedQuery = localeQuery.trim().toLowerCase();

  const filteredLocaleOptions = useMemo(() => {
    if (!normalizedQuery) {
      return localeOptions;
    }

    return localeOptions.filter((option) => {
      const overrideLabel = languageLabels?.[option.code];
      const labelValue = (overrideLabel ?? option.label).toLowerCase();

      return (
        option.code.includes(normalizedQuery) ||
        option.name.toLowerCase().includes(normalizedQuery) ||
        option.nativeName.toLowerCase().includes(normalizedQuery) ||
        labelValue.includes(normalizedQuery)
      );
    });
  }, [languageLabels, normalizedQuery]);

  const currentLocaleLabel = languageLabels?.[locale] ?? getLocaleLabel(locale);

  function navigateToLocale(nextLocale: AppLocale) {
    if (nextLocale === locale) {
      return;
    }

    const useDomainRouting =
      isDomainLocaleRoutingEnabled() && !isLocalDebugHost(window.location.host);

    const href = useDomainRouting
      ? (() => {
          const host = getLocaleHostForLocale(nextLocale, window.location.host);
          const localizedPath = stripLocaleFromPathname(pathname);
          const relativeHref = `${localizedPath}${query ? `?${query}` : ""}`;

          if (!host) {
            return relativeHref;
          }

          return `${window.location.protocol}//${host}${relativeHref}`;
        })()
      : `${switchLocaleInPath(pathname, nextLocale)}${query ? `?${query}` : ""}`;

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
              {getLocaleFlagEmoji(locale)}
            </span>
            <span className="truncate">{currentLocaleLabel}</span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-80 rounded-2xl border border-black/6 bg-[rgba(252,251,247,0.98)] p-1.5 shadow-[0_24px_60px_-36px_rgba(22,18,12,0.28)]"
        >
          <div className="px-1 pb-2">
            <input
              type="text"
              value={localeQuery}
              onChange={(event) => setLocaleQuery(event.target.value)}
              onKeyDown={(event) => {
                event.stopPropagation();
              }}
              onKeyUp={(event) => {
                event.stopPropagation();
              }}
              onKeyPress={(event) => {
                event.stopPropagation();
              }}
              placeholder="Search language..."
              className="h-9 w-full rounded-lg border border-black/10 bg-white/90 px-2.5 text-sm outline-none ring-0 transition focus:border-black/25"
            />
          </div>
          <DropdownMenuRadioGroup value={locale}>
            <div className="max-h-80 overflow-y-auto pr-1">
              {filteredLocaleOptions.map((option) => {
                const optionLabel =
                  languageLabels?.[option.code] ?? option.label;

                return (
                  <DropdownMenuRadioItem
                    key={option.code}
                    value={option.code}
                    data-testid={`locale-option-${option.code}`}
                    className="rounded-xl px-3 py-2.5 text-sm"
                    onClick={() => navigateToLocale(option.code)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden="true" className="text-base">
                        {getLocaleFlagEmoji(option.code)}
                      </span>
                      <span className="flex flex-col leading-tight">
                        <span>{optionLabel}</span>
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {option.code}
                        </span>
                      </span>
                    </span>
                  </DropdownMenuRadioItem>
                );
              })}
            </div>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
