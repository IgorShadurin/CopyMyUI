"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/i18n/client";
import { Button } from "@/components/ui/button";

export function CodeCopyButton({ code }: { code: string }) {
  const { messages } = useI18n();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full border-black/10 bg-white text-foreground hover:bg-white/90"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        toast.success(messages.codeCopy.copied);
      }}
    >
      <Copy className="size-4" />
      {messages.codeCopy.button}
    </Button>
  );
}
