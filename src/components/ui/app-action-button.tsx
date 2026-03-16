import type { ButtonHTMLAttributes, ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type AppActionButtonSize = "sm" | "md" | "lg";

type AppActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  uiSize?: AppActionButtonSize;
  icon: ReactNode;
  iconPosition?: "left" | "right";
  tone?: "default" | "outline" | "secondary" | "ghost" | "destructive";
};

const sizeClassMap: Record<AppActionButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-4.5 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function AppActionButton({
  className,
  children,
  uiSize = "lg",
  icon,
  iconPosition = "left",
  tone = "default",
  type = "button",
  ...props
}: AppActionButtonProps) {
  const iconNode = icon ? <span className="shrink-0">{icon}</span> : null;

  return (
    <button
      type={type}
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
    </button>
  );
}
