import type { MetadataRoute } from "next";

import { locales } from "@/i18n/config";
import { isDomainLocaleRoutingEnabled } from "@/i18n/routing";
import { getBaseUrl } from "@/lib/env";

function privatePaths() {
  const basePaths = [
    "/api/",
    "/auth/",
    "/admin",
    "/dashboard",
    "/moderation",
    "/favorites",
    "/purchases",
  ];

  if (isDomainLocaleRoutingEnabled()) {
    return basePaths;
  }

  const localizedPaths = locales.flatMap((locale) => basePaths.map((path) => `/${locale}${path}`));

  return [...basePaths, ...localizedPaths];
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths(),
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
