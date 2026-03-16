"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { GoogleSignInModalButton } from "@/components/google-signin-modal-button";

type CodeCopyButtonProps = {
  code: string;
  isAuthenticated: boolean;
  nextPath: string;
};

export function CodeCopyButton({ code, isAuthenticated, nextPath }: CodeCopyButtonProps) {
  const { messages } = useI18n();

  if (isAuthenticated) {
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

  return (
    <GoogleSignInModalButton
      nextPath={nextPath}
      triggerLabel={messages.codeCopy.button}
      triggerIcon={<Copy className="size-4" />}
      tone="outline"
      uiSize="sm"
      triggerClassName="rounded-full border-black/10 bg-white text-foreground hover:bg-white/90"
    />
  );
}
