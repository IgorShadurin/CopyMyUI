"use client";

import { useEffect, useState } from "react";

import { Copy, ExternalLink, Linkedin, MessagesSquare, Share2 } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/i18n/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { absoluteUrl, buildShareLinks } from "@/lib/share";
import { cn } from "@/lib/utils";

export function ShareLinks({
  title,
  path,
}: {
  title: string;
  path: string;
}) {
  const { messages } = useI18n();
  const [isSharing, setIsSharing] = useState(false);
  const [origin, setOrigin] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const absolutePath = origin ? new URL(path, origin).toString() : absoluteUrl(path);
  const shareLinks = buildShareLinks(title, absolutePath, messages.share.shareTextTemplate);

  return (
    <div data-testid="share-links" className="flex flex-wrap items-center gap-2">
      <a
        href={shareLinks.x}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
      >
        <ExternalLink className="size-4" />
        {messages.share.shareOnX}
      </a>
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
      >
        <Linkedin className="size-4" />
        {messages.share.linkedIn}
      </a>
      <a
        href={shareLinks.reddit}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
      >
        <MessagesSquare className="size-4" />
        {messages.share.reddit}
      </a>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="rounded-full"
        onClick={async () => {
          if (navigator.share) {
            try {
              setIsSharing(true);
              await navigator.share({
                title,
                url: absolutePath,
              });
              return;
            } catch {
              // Fall back to copy.
            } finally {
              setIsSharing(false);
            }
          }

          await navigator.clipboard.writeText(absolutePath);
          toast.success(messages.share.linkCopied);
        }}
        disabled={isSharing}
      >
        <Share2 className="size-4" />
        {messages.share.share}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="rounded-full"
        onClick={async () => {
          await navigator.clipboard.writeText(absolutePath);
          toast.success(messages.share.linkCopied);
        }}
      >
        <Copy className="size-4" />
        {messages.share.copyLink}
      </Button>
    </div>
  );
}
