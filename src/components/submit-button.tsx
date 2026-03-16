"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { AppActionButton } from "@/components/ui/app-action-button";

export function SubmitButton({
  children,
  intent,
  pendingLabel,
  icon,
  pendingIcon,
  variant = "default",
  disabled = false,
}: {
  children: ReactNode;
  intent: string;
  pendingLabel: string;
  icon?: ReactNode;
  pendingIcon?: ReactNode;
  variant?: "default" | "outline" | "secondary";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const activeIcon = pending
    ? (pendingIcon ?? <Loader2 className="size-4 animate-spin" />)
    : (icon ?? <span className="size-4" aria-hidden />);

  return (
    <AppActionButton
      type="submit"
      name="intent"
      value={intent}
      tone={variant}
      uiSize="lg"
      className="px-5"
      icon={activeIcon}
      disabled={pending || disabled}
    >
      {pending ? pendingLabel : children}
    </AppActionButton>
  );
}
