import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type AppActionLinkSize = "sm" | "md" | "lg";

type AppActionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    uiSize?: AppActionLinkSize;
    icon: ReactNode;
    iconPosition?: "left" | "right";
    tone?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  };

const sizeClassMap: Record<AppActionLinkSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-4.5 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function AppActionLink({
  className,
  children,
  uiSize = "lg",
  icon,
  iconPosition = "left",
  tone = "default",
  ...props
}: AppActionLinkProps) {
  const iconNode = icon ? <span className="shrink-0">{icon}</span> : null;

  return (
    <Link
      className={cn(
        buttonVariants({ variant: tone, size: "sm" }),
        "rounded-full",
        sizeClassMap[uiSize],
        className
      )}
      {...props}
    >
      {iconPosition === "left" ? iconNode : null}
      <span className="truncate">{children}</span>
      {iconPosition === "right" ? iconNode : null}
    </Link>
  );
}
