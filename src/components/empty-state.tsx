import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { AppActionLink } from "@/components/ui/app-action-link";

export function EmptyState({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  actionIcon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-black/6 bg-white/80 p-10 text-center shadow-[0_30px_80px_-45px_rgba(32,22,12,0.45)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <AppActionLink
          href={actionHref}
          uiSize="lg"
          icon={actionIcon ?? <ArrowRight className="size-4" />}
          className="mt-6"
        >
          {actionLabel}
        </AppActionLink>
      ) : null}
    </div>
  );
}
