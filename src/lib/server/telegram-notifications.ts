import { cookies, headers } from "next/headers";

import { defaultLocale } from "@/i18n/config";
import {
  getLocaleBaseDomain,
  getLocaleFromHostname,
  getLocaleHostForLocale,
} from "@/i18n/routing";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID?.trim() ?? "";
const TELEGRAM_REGISTRATION_NOTIFICATIONS_ENABLED =
  process.env.TELEGRAM_REGISTRATION_NOTIFICATIONS_ENABLED !== "false";

const SITE_DOMAIN = "copymyui.com";

function normalizeHeaderHost(value: string | null) {
  const firstValue = value?.split(",")[0]?.trim().toLowerCase() ?? "";
  return firstValue;
}

function normalizeCookieCallbackUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

async function getCallbackUrlFromAuthCookie() {
  try {
    const cookieStore = await cookies();
    const callbackCookie = cookieStore
      .getAll()
      .find((entry) => entry.name.endsWith("authjs.callback-url"));

    return normalizeCookieCallbackUrl(callbackCookie?.value ?? null);
  } catch {
    return null;
  }
}

async function getRequestHostFromHeaders() {
  try {
    const headerStore = await headers();
    return (
      normalizeHeaderHost(headerStore.get("x-forwarded-host")) ||
      normalizeHeaderHost(headerStore.get("host"))
    );
  } catch {
    return "";
  }
}

function resolveDomainInfo(options: { callbackUrl: URL | null; requestHost: string }) {
  const callbackHost = options.callbackUrl?.host.toLowerCase() ?? "";
  const requestHost = options.requestHost;
  const registeredDomain = callbackHost || requestHost || "unknown";

  const locale =
    getLocaleFromHostname(registeredDomain) ??
    getLocaleFromHostname(requestHost) ??
    defaultLocale;
  const languageDomain =
    getLocaleHostForLocale(locale, registeredDomain) ??
    getLocaleHostForLocale(locale, requestHost) ??
    registeredDomain;
  const baseDomain = getLocaleBaseDomain(registeredDomain) ?? "unknown";

  return {
    registeredDomain,
    languageDomain,
    locale,
    baseDomain,
    callbackUrl: options.callbackUrl?.toString() ?? "unknown",
  };
}

function formatRegistrationMessage(input: {
  userId: string;
  email: string;
  name: string;
  registeredDomain: string;
  languageDomain: string;
  locale: string;
  baseDomain: string;
  callbackUrl: string;
}) {
  return [
    `[${SITE_DOMAIN}] 👤 New User Registration`,
    "",
    `🆔 User ID: ${input.userId}`,
    `📧 Email: ${input.email}`,
    `🙍 Name: ${input.name}`,
    `🌐 Site: ${SITE_DOMAIN}`,
    `🏠 Registered Domain: ${input.registeredDomain}`,
    `🈯 Lang Domain: ${input.languageDomain}`,
    `🗣 Locale: ${input.locale}`,
    `🌍 Base Domain: ${input.baseDomain}`,
    `🔗 Callback URL: ${input.callbackUrl}`,
    `🕒 Timestamp: ${new Date().toISOString()}`,
  ].join("\n");
}

export async function sendTelegramNewUserRegistrationNotification(input: {
  userId: string;
  email: string | null | undefined;
  name: string | null | undefined;
}) {
  if (!TELEGRAM_REGISTRATION_NOTIFICATIONS_ENABLED) {
    return;
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return;
  }

  const callbackUrl = await getCallbackUrlFromAuthCookie();
  const requestHost = await getRequestHostFromHeaders();
  const domainInfo = resolveDomainInfo({ callbackUrl, requestHost });
  const message = formatRegistrationMessage({
    userId: input.userId,
    email: input.email ?? "unknown",
    name: input.name ?? "unknown",
    ...domainInfo,
  });

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[telegram-registration] Failed to send notification", {
        status: response.status,
        errorBody,
      });
    }
  } catch (error) {
    console.error("[telegram-registration] Error while sending notification", error);
  }
}
