import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

type SeoBreadcrumbItem = {
  label: string;
  href?: string;
};

export function SeoBreadcrumbs({
  items,
  className,
}: {
  items: SeoBreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("mb-4 overflow-x-auto", className)}
    >
      <ol className="flex min-w-max items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 ? <ChevronRight className="size-3.5 shrink-0" /> : null}
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70 focus-visible:outline-offset-2"
                >
                  {index === 0 ? <Home className="size-3.5 shrink-0" /> : null}
                  <span className="truncate">{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-1 py-0.5",
                    isCurrent ? "font-semibold text-foreground" : ""
                  )}
                >
                  {index === 0 ? <Home className="size-3.5 shrink-0" /> : null}
                  <span className="truncate">{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

