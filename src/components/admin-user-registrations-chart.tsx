import { BarChart3 } from "lucide-react";

import { AppActionLink } from "@/components/ui/app-action-link";
import type { AppLocale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { withLocalePath } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type SupportedRange = 7 | 30 | 90;

export function AdminUserRegistrationsChart({
  locale,
  messages,
  selectedRange,
  categoryId,
  usersPage,
  points,
}: {
  locale: AppLocale;
  messages: Messages;
  selectedRange: SupportedRange;
  categoryId?: string;
  usersPage?: number;
  points: Array<{
    date: Date;
    count: number;
  }>;
}) {
  const maxCount = Math.max(1, ...points.map((point) => point.count));
  const totalCount = points.reduce((sum, point) => sum + point.count, 0);
  const middlePoint = points[Math.floor(points.length / 2)];
  const dateLabelFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  });

  function buildRangeHref(range: SupportedRange) {
    const params = new URLSearchParams();
    params.set("usersDays", String(range));

    if (categoryId) {
      params.set("categoryId", categoryId);
    }

    if (usersPage && usersPage > 1) {
      params.set("usersPage", String(usersPage));
    }

    return withLocalePath(locale, `/admin?${params.toString()}`);
  }

  function getBarTitle(date: Date, count: number) {
    const usersLabel = count === 1 ? "user registered" : "users registered";
    return `${dateLabelFormatter.format(date)} · ${count} ${usersLabel}`;
  }

  return (
    <section className="rounded-lg border border-black/8 bg-[rgba(252,251,247,0.76)] p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
            <BarChart3 className="size-5 text-muted-foreground" />
            {messages.adminPage.userRegistrationsTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {messages.adminPage.userRegistrationsDescription}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[7, 30, 90].map((range) => (
            <AppActionLink
              key={range}
              href={buildRangeHref(range as SupportedRange)}
              uiSize="sm"
              tone={selectedRange === range ? "secondary" : "outline"}
              icon={<BarChart3 className="size-4" />}
            >
              {messages.adminPage.userRegistrationsRangeLabel.replace(
                "{days}",
                String(range)
              )}
            </AppActionLink>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-md border border-black/8 bg-white p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            {messages.adminPage.userRegistrationsTotalLabel} {totalCount}
          </p>
          <p>
            {messages.adminPage.userRegistrationsPeakLabel} {maxCount}
          </p>
        </div>

        <div className="overflow-x-auto">
          <div
            className="flex h-40 items-end gap-1 rounded-md border border-black/6 bg-[rgba(252,251,247,0.72)] px-2 py-2"
            style={{ minWidth: `${Math.max(520, points.length * 11)}px` }}
          >
            {points.map((point, index) => {
              const rawHeight = Math.round((point.count / maxCount) * 100);
              const heightPercent = point.count > 0 ? Math.max(6, rawHeight) : 2;
              const isEveryNthTick = index % Math.max(1, Math.floor(points.length / 10)) === 0;

              return (
                <div
                  key={point.date.toISOString()}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
                >
                  <div
                    className={cn(
                      "w-full rounded-[4px] border border-orange-200/70 bg-orange-400/80",
                      point.count === 0 ? "bg-black/10 border-black/10" : ""
                    )}
                    style={{ height: `${heightPercent}%` }}
                    title={getBarTitle(point.date, point.count)}
                    aria-label={getBarTitle(point.date, point.count)}
                  />
                  <span className="h-3 text-[10px] text-muted-foreground">
                    {isEveryNthTick ? dateLabelFormatter.format(point.date) : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {points.length > 0 ? (
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{dateLabelFormatter.format(points[0].date)}</span>
            <span>{middlePoint ? dateLabelFormatter.format(middlePoint.date) : ""}</span>
            <span>{dateLabelFormatter.format(points[points.length - 1].date)}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
