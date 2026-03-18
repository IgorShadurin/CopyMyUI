import "dotenv/config";

import { fullyTranslatedLocales, locales, type AppLocale } from "../src/i18n/config";
import { isLocalDebugHost } from "../src/i18n/routing";

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
  --one-by-one          Force locale-by-locale remote requests.
  --dry-run             Print plan without sending anything.
  --help                Show this message.

Examples:
  npm run indexnow:remote -- --all
  npm run indexnow:remote -- --lang=ru
  npm run indexnow:remote -- --langs=ru,de,fr
`);
}

const localeSet = new Set<AppLocale>(locales);

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

function getNumberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
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

  console.log(`Endpoint: ${endpoint}`);
  console.log(
    requestedLocales.length === 0
      ? "Locale mode: all locales"
      : `Locale mode: ${requestedLocales.join(", ")}`
  );

  if (!forceOneByOne) {
    const payload =
      requestedLocales.length === 0
        ? { submitAll: true }
        : { locales: requestedLocales };

    console.log("Submission strategy: single remote request (server-side URL discovery).");
    console.log(`Payload: ${JSON.stringify(payload)}`);

    if (dryRun) {
      return;
    }

    const result = await submitPayload(endpoint, secret, payload);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const localesToProcess =
    requestedLocales.length > 0 ? requestedLocales : fullyTranslatedLocales;

  console.log(
    `Submission strategy: locale-by-locale remote requests (${localesToProcess.length} locale request(s)).`
  );
  console.log(`Locales: ${localesToProcess.join(", ")}`);

  if (dryRun) {
    return;
  }

  let submitted = 0;

  for (const locale of localesToProcess) {
    const result = await submitPayload(endpoint, secret, { locale });
    const localeSubmitted = getNumberValue(result.submittedCount);
    submitted += localeSubmitted;
    console.log(`Locale ${locale}: submitted ${localeSubmitted} URL(s).`);
  }

  console.log(`Done. Submitted ${submitted} URL(s).`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error.";
  console.error(message);
  process.exitCode = 1;
});
