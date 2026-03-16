import { cache } from "react";

import { ComponentStatus } from "@prisma/client";
import { cookies, headers } from "next/headers";
import type { ZodIssue } from "zod";

import {
  defaultLocale,
  localeCookieName,
  localeHeaderName,
  type AppLocale,
} from "@/i18n/config";
import { getMessagesForLocale, type Messages } from "@/i18n/messages";
import { isLocale, resolveLocaleFromAcceptLanguage } from "@/i18n/routing";

export const getRequestLocale = cache(async (): Promise<AppLocale> => {
  const headerStore = await headers();
  const headerLocale = headerStore.get(localeHeaderName);

  if (isLocale(headerLocale)) {
    return headerLocale;
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;

  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  return resolveLocaleFromAcceptLanguage(headerStore.get("accept-language")) ?? defaultLocale;
});

export const getI18n = cache(async () => {
  const locale = await getRequestLocale();
  return {
    locale,
    messages: getMessagesForLocale(locale),
  };
});

export function translateStatus(status: ComponentStatus, messages: Messages) {
  switch (status) {
    case ComponentStatus.DRAFT:
      return messages.status.draft;
    case ComponentStatus.PENDING_REVIEW:
      return messages.status.pendingReview;
    case ComponentStatus.APPROVED:
      return messages.status.approved;
    case ComponentStatus.DECLINED:
      return messages.status.declined;
  }
}

export function translateCategory<
  TCategory extends {
    slug?: string | null;
    name: string;
    description: string;
    translations?: Array<{ locale: string; name: string; description: string }>;
  },
>(category: TCategory, messages: Messages, locale?: AppLocale) {
  const databaseLocaleTranslation = category.translations?.find(
    (translation) => translation.locale === locale
  );
  const databaseEnglishTranslation = category.translations?.find(
    (translation) => translation.locale === "en"
  );
  const translated = category.slug
    ? messages.categories[category.slug as keyof Messages["categories"]]
    : null;

  return {
    name:
      databaseLocaleTranslation?.name ??
      translated?.name ??
      databaseEnglishTranslation?.name ??
      category.name,
    description:
      databaseLocaleTranslation?.description ??
      translated?.description ??
      databaseEnglishTranslation?.description ??
      category.description,
  };
}

export function translateServerError(message: string, messages: Messages) {
  switch (message) {
    case "SwiftUI code is required. Include `import SwiftUI`, a `View` struct, and a `body` implementation.":
      return messages.errors.service.swiftSourceRequired;
    case "You do not have permission to change this component.":
      return messages.errors.service.noPermission;
    case "Only draft revisions can be edited.":
      return messages.errors.service.editDraftOnly;
    case "This component does not have an editable revision.":
      return messages.errors.service.noEditableRevision;
    case "Wait for moderation before starting another update.":
      return messages.errors.service.waitForModeration;
    case "Only draft revisions can be submitted.":
      return messages.errors.service.submitDraftOnly;
    case "No active revision exists for this component.":
      return messages.errors.service.noActiveRevision;
    case "Only pending revisions can be reviewed.":
      return messages.errors.service.reviewPendingOnly;
    case "Declining a component requires a moderator note.":
      return messages.errors.service.moderationNoteRequired;
    case "Only approved components can be favorited.":
      return messages.errors.service.favoriteApprovedOnly;
    case "Only approved premium components can be purchased.":
      return messages.errors.service.purchaseApprovedPremiumOnly;
    case "You already have access to your own component.":
      return messages.errors.service.ownComponentAccess;
    case "Markup percent must be a whole number between 0 and 200.":
      return messages.errors.service.markupPercentRange;
    case "Select between 1 and 3 categories.":
      return messages.errors.service.categoryCountRange;
    case "Primary category must be one of the selected categories.":
      return messages.errors.service.primaryCategorySelection;
    case "Choose valid categories.":
      return messages.errors.service.validCategories;
    case "API key not found.":
      return messages.errors.service.apiKeyNotFound;
    default:
      return message;
  }
}

export function translateZodIssue(issue: ZodIssue, messages: Messages) {
  const field = issue.path[0];

  switch (field) {
    case "title":
      return messages.errors.validation.title;
    case "primaryCategoryId":
      return messages.errors.validation.category;
    case "categoryIds":
      return messages.errors.validation.categoryList;
    case "name":
      return messages.errors.validation.name;
    case "slug":
      return messages.errors.validation.slug;
    case "accent":
      return messages.errors.validation.accent;
    case "summary":
      return messages.errors.validation.summary;
    case "description":
      return messages.errors.validation.description;
    case "changelog":
      return messages.errors.validation.changelog;
    case "sellerTargetPriceCents":
      return messages.errors.validation.sellerTargetPriceCents;
    case "swiftCode":
      return messages.errors.validation.swiftCode;
    case "screenshots":
      return messages.errors.validation.screenshots;
    default:
      return messages.errors.formIncomplete;
  }
}
