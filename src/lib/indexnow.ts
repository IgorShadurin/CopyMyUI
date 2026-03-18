import sitemap from "@/app/sitemap";
import { defaultLocale, locales, type AppLocale } from "@/i18n/config";
import { getLocaleBaseDomain, isLocalDebugHost } from "@/i18n/routing";
import { getBaseUrl } from "@/lib/env";

export const INDEXNOW_ENDPOINT = process.env.INDEXNOW_ENDPOINT ?? "https://api.indexnow.org/indexnow";
export const MAX_URLS_PER_REQUEST = 10_000;

type IndexNowSubmissionMode = "all" | "selected" | "locales";

export interface IndexNowBatchResponse {
  batchIndex: number;
  host: string;
  status: number;
  submittedCount: number;
  body: string;
}

export interface IndexNowSubmissionResult {
  mode: IndexNowSubmissionMode;
  submittedCount: number;
  hostCount: number;
  batchCount: number;
  responses: IndexNowBatchResponse[];
}

const localeSet = new Set<AppLocale>(locales);

function getIndexNowKey() {
  const key = process.env.INDEXNOW_KEY?.trim();

  if (!key) {
    throw new Error("INDEXNOW_KEY is not configured.");
  }

  return key;
}

function normalizeUrl(input: string) {
  const baseUrl = getBaseUrl();
  const parsedBaseUrl = new URL(baseUrl);
  const url = new URL(input, baseUrl);

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`Unsupported URL protocol for IndexNow submission: ${url.protocol}`);
  }

  const baseDomain = getLocaleBaseDomain(parsedBaseUrl.host);
  const hostname = url.hostname.toLowerCase();

  if (isLocalDebugHost(parsedBaseUrl.host) || !baseDomain) {
    if (hostname !== parsedBaseUrl.hostname.toLowerCase()) {
      throw new Error(`IndexNow only accepts ${parsedBaseUrl.hostname} URLs. Received: ${url.toString()}`);
    }
  } else if (!(hostname === baseDomain || hostname.endsWith(`.${baseDomain}`))) {
    throw new Error(`IndexNow only accepts ${baseDomain} URLs. Received: ${url.toString()}`);
  }

  url.hash = "";
  return url.toString();
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function parseLocaleFromUrl(urlValue: string): AppLocale {
  const url = new URL(urlValue, getBaseUrl());
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

function buildKeyLocationForHost(host: string, key: string) {
  const configuredLocation = process.env.INDEXNOW_KEY_LOCATION?.trim();
  const baseUrl = new URL(getBaseUrl());

  if (!configuredLocation) {
    return `${baseUrl.protocol}//${host}/${key}.txt`;
  }

  try {
    const url = new URL(configuredLocation);
    url.host = host;
    return url.toString();
  } catch {
    const path = configuredLocation.startsWith("/")
      ? configuredLocation
      : `/${configuredLocation}`;
    return `${baseUrl.protocol}//${host}${path}`;
  }
}

export function normalizeIndexNowUrls(inputs: string[]) {
  return Array.from(new Set(inputs.map((input) => normalizeUrl(input))));
}

export async function getAllIndexNowUrls() {
  const entries = await sitemap();
  return normalizeIndexNowUrls(entries.map((entry) => String(entry.url)));
}

export function filterIndexNowUrlsByLocales(urls: string[], requestedLocales: AppLocale[]) {
  const localeFilter = new Set<AppLocale>(requestedLocales);

  if (localeFilter.size === 0) {
    return normalizeIndexNowUrls(urls);
  }

  return normalizeIndexNowUrls(urls).filter((url) => localeFilter.has(parseLocaleFromUrl(url)));
}

export async function submitIndexNowUrls(inputs: string[], mode: IndexNowSubmissionMode) {
  const key = getIndexNowKey();
  const urls = normalizeIndexNowUrls(inputs);

  if (urls.length === 0) {
    return {
      mode,
      submittedCount: 0,
      hostCount: 0,
      batchCount: 0,
      responses: [] as IndexNowBatchResponse[],
    };
  }

  const byHost = new Map<string, string[]>();

  for (const urlValue of urls) {
    const host = new URL(urlValue).host;
    const existing = byHost.get(host);

    if (existing) {
      existing.push(urlValue);
      continue;
    }

    byHost.set(host, [urlValue]);
  }

  const responses: IndexNowBatchResponse[] = [];

  for (const [host, hostUrls] of byHost.entries()) {
    const batches = chunk(hostUrls, MAX_URLS_PER_REQUEST);

    for (let index = 0; index < batches.length; index += 1) {
      const urlList = batches[index];

      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          host,
          key,
          keyLocation: buildKeyLocationForHost(host, key),
          urlList,
        }),
        cache: "no-store",
      });

      const body = await response.text();

      if (!response.ok) {
        throw new Error(
          `IndexNow submission failed with ${response.status} for host ${host}: ${body || "empty response"}`
        );
      }

      responses.push({
        batchIndex: index + 1,
        host,
        status: response.status,
        submittedCount: urlList.length,
        body,
      });
    }
  }

  return {
    mode,
    submittedCount: urls.length,
    hostCount: byHost.size,
    batchCount: responses.length,
    responses,
  };
}
