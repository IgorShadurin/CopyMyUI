import { NextRequest, NextResponse } from "next/server";

import type { AppLocale } from "@/i18n/config";
import { isLocale } from "@/i18n/routing";
import {
  filterIndexNowUrlsByLocales,
  getAllIndexNowUrls,
  submitIndexNowUrls,
} from "@/lib/indexnow";

const INDEXNOW_SUBMIT_SECRET = process.env.INDEXNOW_SUBMIT_SECRET;

type IndexNowRequestBody = {
  submitAll?: boolean;
  locale?: string;
  locales?: string[];
  lang?: string;
  langs?: string[] | string;
  url?: string;
  path?: string;
  urls?: string[];
  paths?: string[];
  urlList?: string[];
};

function getProvidedSecret(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return request.headers.get("x-indexnow-secret")?.trim() ?? null;
}

function collectRequestedUrls(body: IndexNowRequestBody) {
  return [
    ...(typeof body.url === "string" ? [body.url] : []),
    ...(typeof body.path === "string" ? [body.path] : []),
    ...(Array.isArray(body.urls) ? body.urls : []),
    ...(Array.isArray(body.paths) ? body.paths : []),
    ...(Array.isArray(body.urlList) ? body.urlList : []),
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function splitLocaleTokens(input: string | string[] | undefined) {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.flatMap((value) => value.split(",")).map((value) => value.trim());
  }

  return input.split(",").map((value) => value.trim());
}

function collectRequestedLocales(body: IndexNowRequestBody): AppLocale[] {
  const tokens = [
    ...splitLocaleTokens(body.locale),
    ...splitLocaleTokens(body.locales),
    ...splitLocaleTokens(body.lang),
    ...splitLocaleTokens(body.langs),
  ].filter(Boolean);

  if (tokens.length === 0) {
    return [];
  }

  const invalid = tokens.find((token) => !isLocale(token));
  if (invalid) {
    throw new Error(`Unsupported locale: ${invalid}`);
  }

  return Array.from(new Set(tokens)) as AppLocale[];
}

export async function POST(request: NextRequest) {
  try {
    if (!INDEXNOW_SUBMIT_SECRET) {
      return NextResponse.json(
        { error: "INDEXNOW_SUBMIT_SECRET is not configured" },
        { status: 500 }
      );
    }

    const providedSecret = getProvidedSecret(request);
    if (!providedSecret || providedSecret !== INDEXNOW_SUBMIT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: IndexNowRequestBody = {};

    try {
      body = (await request.json()) as IndexNowRequestBody;
    } catch {
      // Empty body means "submit all".
    }

    const requestedLocales = collectRequestedLocales(body);
    const requestedUrls = collectRequestedUrls(body);

    let mode: "all" | "selected" | "locales" = "all";
    let urls: string[] = [];

    if (requestedUrls.length > 0) {
      mode = "selected";
      urls =
        requestedLocales.length > 0
          ? filterIndexNowUrlsByLocales(requestedUrls, requestedLocales)
          : requestedUrls;
    } else {
      const allUrls = await getAllIndexNowUrls();

      if (requestedLocales.length > 0) {
        mode = "locales";
        urls = filterIndexNowUrlsByLocales(allUrls, requestedLocales);
      } else {
        mode = "all";
        urls = allUrls;
      }
    }

    if (body.submitAll === true) {
      mode = "all";
      urls = await getAllIndexNowUrls();
    }

    const result = await submitIndexNowUrls(urls, mode);

    return NextResponse.json({
      success: true,
      requestedLocales,
      requestedUrlCount: requestedUrls.length,
      ...result,
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unsupported locale:")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "IndexNow submission failed", details: String(error) },
      { status: 500 }
    );
  }
}
