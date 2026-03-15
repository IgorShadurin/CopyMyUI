"use client";

import { CheckCircle2, Info } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const noticeStyles = {
  info: "border-sky-200 bg-sky-50 text-sky-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
} as const;

export function PageNotice({
  tone = "info",
  message,
}: {
  tone?: keyof typeof noticeStyles;
  message: string;
}) {
  const Icon = tone === "success" ? CheckCircle2 : Info;

  return (
    <Alert className={cn("rounded-[1.6rem]", noticeStyles[tone])}>
      <Icon className="size-4" />
      <div>{message}</div>
    </Alert>
  );
}
