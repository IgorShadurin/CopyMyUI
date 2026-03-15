"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function SubmitButton({
  children,
  intent,
  pendingLabel,
  variant = "default",
}: {
  children: React.ReactNode;
  intent: string;
  pendingLabel: string;
  variant?: "default" | "outline" | "secondary";
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      name="intent"
      value={intent}
      variant={variant}
      size="lg"
      className="rounded-full px-5"
      disabled={pending}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
