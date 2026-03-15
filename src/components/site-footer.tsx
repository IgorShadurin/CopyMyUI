import type { Messages } from "@/i18n/messages";
import { FOOTER_X_URL } from "@/lib/constants";

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
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={FOOTER_X_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground transition-opacity hover:opacity-70"
          >
            {messages.footer.xLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}
