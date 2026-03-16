import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { withLocalePath } from "@/i18n/routing";
import { getI18n } from "@/i18n/server";
import { GoogleIcon } from "@/components/icons/google-icon";
import { AppActionButton } from "@/components/ui/app-action-button";
import { googleSignInAction } from "@/lib/actions/auth-actions";
import { isGoogleAuthConfigured } from "@/lib/env";
import { createPageMetadata } from "@/lib/seo";
import { getViewer } from "@/lib/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();

  return createPageMetadata({
    locale,
    path: "/auth/signin",
    title: messages.signInPage.title,
    description: messages.signInPage.description,
    noIndex: true,
  });
}

export default async function SignInPage() {
  const { locale, messages } = await getI18n();
  const viewer = await getViewer();

  if (viewer) {
    redirect(withLocalePath(locale, "/dashboard"));
  }

  const googleConfigured = isGoogleAuthConfigured();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-18rem)] w-full max-w-4xl items-center px-4 py-8 sm:px-6 sm:py-12">
      <section className="grid w-full gap-6 rounded-[2.2rem] border border-black/6 bg-white/88 p-5 shadow-[0_40px_100px_-50px_rgba(22,18,12,0.6)] backdrop-blur sm:rounded-[2.8rem] sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div className="rounded-[2rem] bg-[linear-gradient(145deg,rgba(255,247,237,0.95),rgba(255,255,255,0.96))] p-5 sm:rounded-[2.2rem] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            {messages.signInPage.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
            {messages.signInPage.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {messages.signInPage.description}
          </p>
          <ul className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground">
            <li>{messages.signInPage.bulletPrivateDrafts}</li>
            <li>{messages.signInPage.bulletScreenshots}</li>
            <li>{messages.signInPage.bulletVoting}</li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-black/6 bg-[rgba(252,251,247,0.95)] p-5 sm:rounded-[2.2rem] sm:p-8">
          <p className="text-sm leading-7 text-muted-foreground">
            {googleConfigured
              ? messages.signInPage.authConfigured
              : messages.signInPage.authNotConfigured}
          </p>

          <form action={googleSignInAction} className="mt-6">
            <AppActionButton type="submit" uiSize="lg" icon={<GoogleIcon />} className="h-12 w-full">
              {messages.signInPage.continueWithGoogle}
            </AppActionButton>
          </form>
        </div>
      </section>
    </main>
  );
}
