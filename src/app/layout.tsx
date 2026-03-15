import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Space_Grotesk } from "next/font/google";

import "./globals.css";

import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getI18n } from "@/i18n/server";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { getBaseUrl } from "@/lib/env";
import { createPageMetadata } from "@/lib/seo";
import { getViewer } from "@/lib/viewer";

const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();
  const baseMetadata = createPageMetadata({
    locale,
    path: "/",
    title: APP_NAME,
    description: messages.app.description ?? APP_DESCRIPTION,
    keywords: [
      "SwiftUI components",
      "SwiftUI UI library",
      "iOS component gallery",
      "SwiftUI code examples",
      "CopyMyUI",
    ],
    imagePath: "/seed-screenshots/aurora-tab-orbit-full.jpg",
  });

  return {
    ...baseMetadata,
    metadataBase: new URL(getBaseUrl()),
    applicationName: APP_NAME,
    category: "software",
    creator: "CopyMyUI",
    publisher: "CopyMyUI",
    authors: [{ name: "CopyMyUI" }],
    referrer: "origin-when-cross-origin",
    title: {
      default: APP_NAME,
      template: `%s • ${APP_NAME}`,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, messages } = await getI18n();
  const viewer = await getViewer();

  return (
    <html lang={locale} className="light">
      <body
        className={`${sans.variable} ${mono.variable} ${display.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <Providers locale={locale} messages={messages}>
          <div className="min-h-screen">
            <SiteHeader viewer={viewer} locale={locale} messages={messages} />
            {children}
            <SiteFooter messages={messages} />
          </div>
        </Providers>
      </body>
    </html>
  );
}
