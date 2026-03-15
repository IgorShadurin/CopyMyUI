import Link from "next/link";

import {
  ChevronDown,
  ChevronRight,
  Compass,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button-variants";
import { type AppLocale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { withLocalePath } from "@/i18n/routing";
import { translateCategory } from "@/i18n/server";
import { cn } from "@/lib/utils";
import { type Viewer } from "@/lib/viewer";

type BrowseCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  translations?: Array<{ locale: string; name: string; description: string }>;
};

type BrowseRailProps = {
  locale: AppLocale;
  messages: Messages;
  categories: BrowseCategory[];
  viewer: Viewer | null;
  currentQuery?: string;
  currentSort?: "top" | "newest";
  currentAccess?: "free" | "premium";
  activeCategorySlug?: string | null;
  activeQuickLink?: "all" | "premium" | "newest" | null;
  categoryLinkMode?: "filters" | "pages";
  showAdvancedFilters?: boolean;
};

function buildLocalizedHref(
  locale: AppLocale,
  pathname: string,
  params: Record<string, string | undefined>
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return withLocalePath(locale, query ? `${pathname}?${query}` : pathname);
}

function railLinkClass(active: boolean) {
  return cn(
    "flex items-center justify-between rounded-[1rem] px-3 py-2.5 text-sm transition-colors",
    active
      ? "bg-foreground text-background shadow-sm"
      : "text-muted-foreground hover:bg-[rgba(248,245,238,0.96)] hover:text-foreground"
  );
}

function BrowseRailContent({
  locale,
  messages,
  categories,
  currentQuery,
  currentSort = "top",
  currentAccess,
  activeCategorySlug,
  categoryLinkMode = "pages",
  showAdvancedFilters = false,
  panelId,
}: BrowseRailProps & {
  panelId: "mobile" | "desktop";
}) {
  const currentCategoryValue =
    categoryLinkMode === "filters" && activeCategorySlug ? activeCategorySlug : undefined;

  return (
    <div
      data-testid={panelId === "desktop" ? "browse-rail" : "browse-rail-mobile"}
      className="rounded-[1.8rem] border border-black/6 bg-white/88 p-3 shadow-[0_18px_48px_-38px_rgba(22,18,12,0.22)] backdrop-blur sm:p-4"
    >
      <form
        action={withLocalePath(locale, "/components")}
        className="space-y-3 rounded-[1.4rem] border border-black/6 bg-[rgba(252,251,247,0.96)] p-3"
      >
        {currentCategoryValue ? (
          <input type="hidden" name="category" value={currentCategoryValue} />
        ) : null}
        {!showAdvancedFilters && currentAccess ? (
          <input type="hidden" name="access" value={currentAccess} />
        ) : null}
        {!showAdvancedFilters && currentSort === "newest" ? (
          <input type="hidden" name="sort" value="newest" />
        ) : null}
        <label className="flex items-center gap-3 rounded-[1rem] border border-black/8 bg-white px-3 py-3 shadow-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={currentQuery ?? ""}
            placeholder={messages.explorePage.searchPlaceholder}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>

        {showAdvancedFilters ? (
          <div className="grid grid-cols-2 gap-2">
            <select
              name="access"
              defaultValue={currentAccess ?? ""}
              className="h-11 rounded-[1rem] border border-black/8 bg-white px-3 text-sm outline-none"
            >
              <option value="">{messages.explorePage.allAccessTypes}</option>
              <option value="free">{messages.explorePage.freeOnly}</option>
              <option value="premium">{messages.explorePage.premiumOnly}</option>
            </select>
            <select
              name="sort"
              defaultValue={currentSort}
              className="h-11 rounded-[1rem] border border-black/8 bg-white px-3 text-sm outline-none"
            >
              <option value="top">{messages.explorePage.topRated}</option>
              <option value="newest">{messages.explorePage.newest}</option>
            </select>
          </div>
        ) : null}

        <button
          type="submit"
          className={cn(
            buttonVariants({ size: "sm" }),
            "h-11 w-full rounded-[1rem] justify-center"
          )}
        >
          {showAdvancedFilters ? (
            <SlidersHorizontal className="size-4" />
          ) : (
            <Search className="size-4" />
          )}
          {showAdvancedFilters
            ? messages.explorePage.updateFilters
            : messages.home.exploreComponents}
        </button>
      </form>

      <div className="mt-4 border-t border-black/6 pt-4">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {messages.explorePage.allCategories}
        </p>
        <div className="mt-2 grid gap-1">
          {categories.map((category) => {
            const translatedCategory = translateCategory(category, messages, locale);
            const href =
              categoryLinkMode === "filters"
                ? buildLocalizedHref(locale, "/components", {
                    q: currentQuery,
                    category: category.slug,
                    access: currentAccess,
                    sort: currentSort === "newest" ? "newest" : undefined,
                  })
                : withLocalePath(locale, `/categories/${category.slug}`);
            const active = category.slug === activeCategorySlug;

            return (
              <Link
                key={category.id}
                href={href}
                data-active={active ? "true" : "false"}
                data-testid={`browse-category-link-${panelId}-${category.slug}`}
                className={railLinkClass(active)}
              >
                <span>{translatedCategory.name}</span>
                <ChevronRight className="size-4 opacity-55" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function BrowseRail(props: BrowseRailProps) {
  return (
    <>
      <details className="group lg:hidden">
        <summary
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "flex w-full list-none items-center justify-between rounded-[1.2rem] bg-white/80 px-4 py-3 text-left shadow-sm [&::-webkit-details-marker]:hidden"
          )}
        >
          <span className="inline-flex items-center gap-2">
            <Compass className="size-4" />
            {props.messages.header.explore}
          </span>
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3">
          <BrowseRailContent {...props} panelId="mobile" />
        </div>
      </details>

      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <BrowseRailContent {...props} panelId="desktop" />
        </div>
      </aside>
    </>
  );
}
