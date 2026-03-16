"use client";

import { Moon, Sun } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { type SourceTheme } from "@/lib/source-theme";
import { cn } from "@/lib/utils";

export function SourceThemeToggle({
  value,
  onChange,
  surface = "dark",
  className,
}: {
  value: SourceTheme;
  onChange: (next: SourceTheme) => void;
  surface?: SourceTheme;
  className?: string;
}) {
  const { messages } = useI18n();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border p-1",
        surface === "dark" ? "border-white/15 bg-white/5" : "border-black/10 bg-black/[0.04]",
        className
      )}
    >
      <button
        type="button"
        aria-label={messages.editor.sourceThemeDark}
        aria-pressed={value === "dark"}
        onClick={() => onChange("dark")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
          value === "dark"
            ? "bg-white text-black shadow-sm"
            : surface === "dark"
              ? "text-white/70 hover:text-white"
              : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Moon className="size-3.5" />
        {messages.editor.sourceThemeDark}
      </button>
      <button
        type="button"
        aria-label={messages.editor.sourceThemeLight}
        aria-pressed={value === "light"}
        onClick={() => onChange("light")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
          value === "light"
            ? "bg-white text-black shadow-sm"
            : surface === "dark"
              ? "text-white/70 hover:text-white"
              : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Sun className="size-3.5" />
        {messages.editor.sourceThemeLight}
      </button>
    </div>
  );
}
