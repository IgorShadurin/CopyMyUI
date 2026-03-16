"use client";

import { useState, type ReactNode } from "react";
import { LogIn } from "lucide-react";

import { googleSignInAction } from "@/lib/actions/auth-actions";
import { useI18n } from "@/i18n/client";
import { GoogleIcon } from "@/components/icons/google-icon";
import { AppActionButton } from "@/components/ui/app-action-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type GoogleSignInModalButtonProps = {
  nextPath: string;
  triggerLabel: string;
  triggerIcon: ReactNode;
  triggerClassName?: string;
  modalTitle?: string;
  modalDescription?: string;
  tone?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  uiSize?: "sm" | "md" | "lg";
};

type GoogleSignInDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextPath: string;
  modalTitle?: string;
  modalDescription?: string;
};

export function GoogleSignInDialog({
  open,
  onOpenChange,
  nextPath,
  modalTitle,
  modalDescription,
}: GoogleSignInDialogProps) {
  const { messages } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[min(32rem,calc(100vw-2rem))] rounded-[1.8rem] border border-black/6 bg-[rgba(252,251,247,0.98)] p-5 shadow-[0_35px_90px_-45px_rgba(22,18,12,0.45)] backdrop-blur sm:max-w-[min(32rem,calc(100vw-2rem))] sm:p-6">
        <DialogHeader className="gap-2 pr-10">
          <DialogTitle className="text-3xl leading-[1.02] font-semibold tracking-[-0.03em] text-foreground">
            <span className="inline-flex items-center gap-2">
              <LogIn className="size-6 text-muted-foreground" />
              <span>{modalTitle ?? messages.codeCopy.authRequiredTitle}</span>
            </span>
          </DialogTitle>
          <DialogDescription className="max-w-2xl text-base leading-7 text-muted-foreground">
            {modalDescription ?? messages.codeCopy.authRequiredDescription}
          </DialogDescription>
        </DialogHeader>
        <form action={googleSignInAction} className="mt-1">
          <input type="hidden" name="next" value={nextPath} />
          <AppActionButton
            type="submit"
            uiSize="lg"
            icon={<GoogleIcon />}
            className="w-full justify-center"
          >
            {messages.signInPage.continueWithGoogle}
          </AppActionButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GoogleSignInModalButton({
  nextPath,
  triggerLabel,
  triggerIcon,
  triggerClassName,
  modalTitle,
  modalDescription,
  tone = "outline",
  uiSize = "sm",
}: GoogleSignInModalButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppActionButton
        type="button"
        tone={tone}
        uiSize={uiSize}
        icon={triggerIcon}
        className={cn(triggerClassName)}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </AppActionButton>
      <GoogleSignInDialog
        open={open}
        onOpenChange={setOpen}
        nextPath={nextPath}
        modalTitle={modalTitle}
        modalDescription={modalDescription}
      />
    </>
  );
}
