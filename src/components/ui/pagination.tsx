import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<typeof Link>;

function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size: "icon-sm",
        }),
        "rounded-full",
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      aria-label="Go to previous page"
      data-slot="pagination-previous"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "gap-1 rounded-full pl-2.5",
        className
      )}
      {...props}
    >
      <ChevronLeft className="size-4" />
      <span>{children}</span>
    </Link>
  );
}

function PaginationNext({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      aria-label="Go to next page"
      data-slot="pagination-next"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "gap-1 rounded-full pr-2.5",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronRight className="size-4" />
    </Link>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex h-7 w-7 items-center justify-center rounded-full", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
};
