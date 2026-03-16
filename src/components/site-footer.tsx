import { Github } from "lucide-react";

import { XIcon } from "@/components/icons/x-icon";
import type { Messages } from "@/i18n/messages";
import { FOOTER_GITHUB_URL, FOOTER_X_URL } from "@/lib/constants";

export function SiteFooter({
  messages,
}: {
  messages: Messages;
}) {
  return (
    <footer className="border-t border-black/6 bg-white/65">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-foreground">{messages.app.name}</p>
          <p className="mt-1">{messages.footer.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={FOOTER_GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/88 px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-white"
            aria-label="GitHub"
          >
            <Github className="size-4" />
            <span>GitHub</span>
          </a>
          <a
            href={FOOTER_X_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/88 px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-white"
            aria-label={messages.footer.xLabel}
          >
            <XIcon className="size-4" />
            {messages.footer.xLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}
