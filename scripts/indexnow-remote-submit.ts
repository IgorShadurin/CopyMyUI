import "dotenv/config";

import { defaultLocale, locales, type AppLocale } from "../src/i18n/config";
import { isLocalDebugHost } from "../src/i18n/routing";

const MAX_URLS_PER_REQUEST = 10_000;

function parseArgs(argv: string[]) {
  const args = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const [key, inlineValue] = token.slice(2).split("=", 2);

    if (inlineValue !== undefined) {
      args.set(key, inlineValue);
      continue;
    }

    const nextToken = argv[index + 1];

    if (nextToken && !nextToken.startsWith("--")) {
      args.set(key, nextToken);
      index += 1;
      continue;
    }

    args.set(key, "true");
  }

  return args;
}

function parseListArg(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function printHelp() {
  console.log(`
Remote IndexNow submitter for CopyMyUI.

Usage:
  npm run indexnow:remote -- [--all] [--lang=<code>] [--langs=<c1,c2>] [--dry-run]

Options:
  --all                 Submit all locales (default when no locale flags are provided).
  --lang=<code>         Submit only one locale, for example --lang=ru
  --langs=<c1,c2>       Submit a comma-separated locale list, for example --langs=ru,de,fr
  --endpoint=<url>      Remote API endpoint. Default: INDEXNOW_REMOTE_API_URL or https://copymyui.com/api/indexnow
  --secret=<value>      Overrides INDEXNOW_SUBMIT_SECRET for this run.
  --one-by-one          Force per-URL submission.
  --dry-run             Print plan without sending anything.
  --help                Show this message.

Examples:
  npm run indexnow:remote -- --all
  npm run indexnow:remote -- --lang=ru
  npm run indexnow:remote -- --langs=ru,de,fr
`);
}

const localeSet = new Set<AppLocale>(locales);

function inferLocaleFromUrl(urlValue: string): AppLocale {
  const url = new URL(urlValue);
  const pathnameLocale = url.pathname.split("/")[1]?.toLowerCase();

  if (pathnameLocale && localeSet.has(pathnameLocale as AppLocale)) {
    return pathnameLocale as AppLocale;
  }

  const hostLocale = url.hostname.split(".")[0]?.toLowerCase();
  if (hostLocale && localeSet.has(hostLocale as AppLocale)) {
    return hostLocale as AppLocale;
  }

  return defaultLocale;
}

function normalizeLocaleSelection(args: Map<string, string>) {
  const requested = [
    ...parseListArg(args.get("lang")),
    ...parseListArg(args.get("locale")),
    ...parseListArg(args.get("langs")),
    ...parseListArg(args.get("locales")),
  ];

  if (requested.length === 0 || args.get("all") === "true") {
    return [] as AppLocale[];
  }

  const invalid = requested.find((locale) => !localeSet.has(locale as AppLocale));
  if (invalid) {
    throw new Error(`Unsupported locale: ${invalid}`);
  }

  return Array.from(new Set(requested)) as AppLocale[];
}

async function fetchSitemapUrls(origin: string) {
  const sitemapUrl = new URL("/sitemap.xml", origin).toString();
  const response = await fetch(sitemapUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Unable to fetch sitemap: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const matches = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g));
  const urls = matches
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(urls));
}

async function submitPayload(
  endpoint: string,
  secret: string,
  payload: Record<string, unknown>
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Remote IndexNow route failed with ${response.status}: ${body || "empty response"}`);
  }

  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return { ok: true, raw: body };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.get("help") === "true") {
    printHelp();
    return;
  }

  const endpoint =
    args.get("endpoint")?.trim() ||
    process.env.INDEXNOW_REMOTE_API_URL?.trim() ||
    "https://copymyui.com/api/indexnow";

  const endpointUrl = new URL(endpoint);
  if (isLocalDebugHost(endpointUrl.host)) {
    throw new Error(
      `Remote-only script: endpoint host must be public, got ${endpointUrl.host}. Use deployed /api/indexnow.`
    );
  }

  const secret = args.get("secret")?.trim() || process.env.INDEXNOW_SUBMIT_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing INDEXNOW_SUBMIT_SECRET. Set it in .env or pass --secret.");
  }

  const requestedLocales = normalizeLocaleSelection(args);
  const dryRun = args.get("dry-run") === "true";
  const forceOneByOne = args.get("one-by-one") === "true";

  const sitemapUrls = await fetchSitemapUrls(endpointUrl.origin);

  if (sitemapUrls.length === 0) {
    console.log("No sitemap URLs found. Nothing to submit.");
    return;
  }

  const filteredUrls =
    requestedLocales.length === 0
      ? sitemapUrls
      : sitemapUrls.filter((url) => requestedLocales.includes(inferLocaleFromUrl(url)));

  if (filteredUrls.length === 0) {
    console.log("No URLs matched the selected locale filter.");
    return;
  }

  const groupedByLocale = new Map<AppLocale, string[]>();

  for (const url of filteredUrls) {
    const locale = inferLocaleFromUrl(url);
    const group = groupedByLocale.get(locale);

    if (group) {
      group.push(url);
      continue;
    }

    groupedByLocale.set(locale, [url]);
  }

  const localeSummary = Array.from(groupedByLocale.entries())
    .map(([locale, urls]) => `${locale}:${urls.length}`)
    .join(", ");

  console.log(`Endpoint: ${endpoint}`);
  console.log(
    requestedLocales.length === 0
      ? "Locale mode: all locales"
      : `Locale mode: ${requestedLocales.join(", ")}`
  );
  console.log(`Matched URLs: ${filteredUrls.length}`);
  console.log(`Locale breakdown: ${localeSummary}`);

  const canSubmitOneShot = filteredUrls.length <= MAX_URLS_PER_REQUEST && !forceOneByOne;

  if (canSubmitOneShot) {
    console.log("Submission strategy: single remote request with urlList.");

    if (dryRun) {
      return;
    }

    const result = await submitPayload(endpoint, secret, {
      urlList: filteredUrls,
      locales: requestedLocales.length > 0 ? requestedLocales : undefined,
    });

    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(
    `Submission strategy: locale-by-locale, one URL per request (total ${filteredUrls.length} requests).`
  );

  if (dryRun) {
    return;
  }

  let submitted = 0;
  const localesToProcess =
    requestedLocales.length > 0 ? requestedLocales : Array.from(groupedByLocale.keys()).sort();

  for (const locale of localesToProcess) {
    const urls = groupedByLocale.get(locale) ?? [];

    console.log(`Submitting locale ${locale}: ${urls.length} URL(s)`);

    for (const url of urls) {
      await submitPayload(endpoint, secret, { url, locale });
      submitted += 1;

      if (submitted % 50 === 0 || submitted === filteredUrls.length) {
        console.log(`Progress: ${submitted}/${filteredUrls.length}`);
      }
    }
  }

  console.log(`Done. Submitted ${submitted} URL(s).`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error.";
  console.error(message);
  process.exitCode = 1;
});
