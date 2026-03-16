"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { googleSignInAction } from "@/lib/actions/auth-actions";
import { useI18n } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CodeCopyButtonProps = {
  code: string;
  isAuthenticated: boolean;
  nextPath: string;
};

export function CodeCopyButton({ code, isAuthenticated, nextPath }: CodeCopyButtonProps) {
  const { messages } = useI18n();
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full border-black/10 bg-white text-foreground hover:bg-white/90"
        onClick={() => setAuthModalOpen(true)}
      >
        <Copy className="size-4" />
        {messages.codeCopy.button}
      </Button>
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messages.codeCopy.authRequiredTitle}</DialogTitle>
            <DialogDescription>{messages.codeCopy.authRequiredDescription}</DialogDescription>
          </DialogHeader>
          <form action={googleSignInAction}>
            <input type="hidden" name="next" value={nextPath} />
            <Button type="submit" className="w-full">
              {messages.signInPage.continueWithGoogle}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
