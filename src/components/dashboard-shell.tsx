import type { ReactNode } from "react";

import { Bookmark, KeyRound, LayoutTemplate, ShoppingBag } from "lucide-react";

import type { AppLocale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { withLocalePath } from "@/i18n/routing";
import { AppActionLink } from "@/components/ui/app-action-link";

type DashboardSection =
  | "dashboard"
  | "new-component"
  | "favorites"
  | "purchases"
  | "api-keys";

function sectionTone(activeSection: DashboardSection, current: DashboardSection) {
  return activeSection === current ? "outline" : "ghost";
}

export function DashboardShell({
  locale,
  messages,
  activeSection,
  children,
}: {
  locale: AppLocale;
  messages: Messages;
  activeSection: DashboardSection;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
      <aside className="rounded-[1.4rem] border border-black/6 bg-white/90 p-2 shadow-[0_16px_42px_-36px_rgba(22,18,12,0.35)] lg:sticky lg:top-24">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <AppActionLink
            href={withLocalePath(locale, "/dashboard")}
            uiSize="sm"
            tone={sectionTone(activeSection, "dashboard")}
            icon={<LayoutTemplate className="size-4" />}
            className="w-full justify-start"
          >
            {messages.header.dashboard}
          </AppActionLink>
          <AppActionLink
            href={withLocalePath(locale, "/favorites")}
            uiSize="sm"
            tone={sectionTone(activeSection, "favorites")}
            icon={<Bookmark className="size-4" />}
            className="w-full justify-start"
          >
            {messages.header.favorites}
          </AppActionLink>
          <AppActionLink
            href={withLocalePath(locale, "/purchases")}
            uiSize="sm"
            tone={sectionTone(activeSection, "purchases")}
            icon={<ShoppingBag className="size-4" />}
            className="w-full justify-start"
          >
            {messages.header.purchases}
          </AppActionLink>
          <AppActionLink
            href={withLocalePath(locale, "/dashboard/api-keys")}
            uiSize="sm"
            tone={sectionTone(activeSection, "api-keys")}
            icon={<KeyRound className="size-4" />}
            className="w-full justify-start"
          >
            {messages.header.apiKeys}
          </AppActionLink>
        </div>
      </aside>

      <div className="space-y-6">{children}</div>
    </div>
  );
}
