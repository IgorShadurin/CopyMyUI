import Link from "next/link";
import type { Metadata } from "next";

import { withLocalePath } from "@/i18n/routing";
import { getI18n } from "@/i18n/server";
import { buttonVariants } from "@/components/ui/button-variants";
import { createPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();

  return createPageMetadata({
    locale,
    path: "/",
    title: messages.notFound.title,
    description: messages.notFound.description,
    noIndex: true,
  });
}

export default async function NotFound() {
  const { locale, messages } = await getI18n();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-18rem)] w-full max-w-4xl items-center px-6 py-12">
      <section className="w-full rounded-[2.8rem] border border-black/6 bg-white/88 p-8 text-center shadow-[0_40px_100px_-50px_rgba(22,18,12,0.6)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {messages.notFound.eyebrow}
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-foreground">
          {messages.notFound.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          {messages.notFound.description}
        </p>
        <Link
          href={withLocalePath(locale, "/")}
          className={cn(buttonVariants({ size: "lg" }), "mt-8 rounded-full px-6")}
        >
          {messages.notFound.action}
        </Link>
      </section>
    </main>
  );
}
