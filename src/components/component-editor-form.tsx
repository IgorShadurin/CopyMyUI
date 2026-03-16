"use client";

import { ComponentAccessType } from "@prisma/client";
import { useActionState, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  Code2,
  Component,
  Image as ImageIcon,
  Save,
  SendHorizontal,
} from "lucide-react";

import { useI18n } from "@/i18n/client";
import { SubmitButton } from "@/components/submit-button";
import {
  ScreenshotUploader,
  type ScreenshotDraft,
} from "@/components/screenshot-uploader";
import { SourceThemeToggle } from "@/components/source-theme-toggle";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  initialFormState,
  type FormState,
} from "@/lib/actions/form-state";
import { CategoryIcon } from "@/lib/category-icons";
import { MAX_SCREENSHOTS, MIN_SCREENSHOTS } from "@/lib/constants";
import {
  getInitialSourceTheme,
  storeSourceTheme,
  type SourceTheme,
} from "@/lib/source-theme";
import { cn } from "@/lib/utils";

type EditorDefaults = {
  title: string;
  primaryCategoryId: string;
  categoryIds: string[];
  summary: string;
  description: string;
  changelog: string;
  accessType: ComponentAccessType;
  sellerTargetPriceUsd: string;
  swiftCode: string;
  screenshots: ScreenshotDraft[];
};

type CategoryOption = {
  id: string;
  name: string;
  slug?: string | null;
};

type EditorField =
  | "title"
  | "categoryIds"
  | "summary"
  | "description"
  | "changelog"
  | "swiftCode"
  | "screenshots";

const SWIFT_SOURCE_PLACEHOLDER = `import SwiftUI

// Placeholder only. Replace everything below with your real component.
struct YourComponentName: View {
    var body: some View {
        // TODO: Build your SwiftUI layout here.
        Text("Placeholder")
    }
}`;

export function ComponentEditorForm({
  action,
  categories,
  defaults,
  categoryLocked = false,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  categories: CategoryOption[];
  defaults: EditorDefaults;
  categoryLocked?: boolean;
}) {
  const { messages } = useI18n();
  const router = useRouter();
  const initialSelectedCategoryIds = Array.from(
    new Set(
      [defaults.primaryCategoryId, ...defaults.categoryIds]
        .filter((categoryId): categoryId is string => Boolean(categoryId))
    )
  ).slice(0, 3);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialSelectedCategoryIds
  );
  const [sourceEditorTheme, setSourceEditorTheme] =
    useState<SourceTheme>(getInitialSourceTheme);
  const [titleValue, setTitleValue] = useState(defaults.title);
  const [summaryValue, setSummaryValue] = useState(defaults.summary);
  const [descriptionValue, setDescriptionValue] = useState(defaults.description);
  const [changelogValue, setChangelogValue] = useState(defaults.changelog);
  const [swiftCodeValue, setSwiftCodeValue] = useState(defaults.swiftCode);
  const [screenshotCount, setScreenshotCount] = useState(defaults.screenshots.length);
  const [state, formAction] = useActionState(action, initialFormState);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<EditorField, string>>>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<EditorField, boolean>>>({});
  const primaryCategoryId = selectedCategoryIds[0] ?? "";

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [router, state.redirectTo]);

  useEffect(() => {
    storeSourceTheme(sourceEditorTheme);
  }, [sourceEditorTheme]);

  function updateFieldError(field: EditorField, message: string | null) {
    setFieldErrors((current) => {
      if (!message) {
        if (!(field in current)) {
          return current;
        }

        const next = { ...current };
        delete next[field];
        return next;
      }

      if (current[field] === message) {
        return current;
      }

      return { ...current, [field]: message };
    });
  }

  function markFieldTouched(field: EditorField) {
    setTouchedFields((current) =>
      current[field] ? current : { ...current, [field]: true }
    );
  }

  function validateTitle(value: string) {
    const trimmedLength = value.trim().length;
    return trimmedLength >= 3 && trimmedLength <= 80
      ? null
      : messages.errors.validation.title;
  }

  function validateCategorySelection(count: number) {
    return count >= 1 && count <= 3
      ? null
      : messages.errors.validation.categoryList;
  }

  function validateSummary(value: string) {
    const trimmedLength = value.trim().length;
    return trimmedLength >= 20 && trimmedLength <= 160
      ? null
      : messages.errors.validation.summary;
  }

  function validateDescription(value: string) {
    const trimmedLength = value.trim().length;
    return trimmedLength >= 40 && trimmedLength <= 1400
      ? null
      : messages.errors.validation.description;
  }

  function validateChangelog(value: string) {
    const trimmedLength = value.trim().length;
    return trimmedLength <= 400
      ? null
      : messages.errors.validation.changelog;
  }

  function validateSwiftCode(value: string) {
    const trimmedLength = value.trim().length;
    return trimmedLength >= 80 && trimmedLength <= 20000
      ? null
      : messages.errors.validation.swiftCode;
  }

  function parseScreenshotCount(rawValue: FormDataEntryValue | null) {
    if (typeof rawValue !== "string" || rawValue.length === 0) {
      return 0;
    }

    try {
      const parsed = JSON.parse(rawValue);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }

  function validateScreenshots(rawValue: FormDataEntryValue | null) {
    const count = parseScreenshotCount(rawValue);
    return count >= MIN_SCREENSHOTS && count <= MAX_SCREENSHOTS
      ? null
      : messages.errors.validation.screenshots;
  }

  const isFormValid =
    !validateTitle(titleValue) &&
    !validateCategorySelection(selectedCategoryIds.length) &&
    !validateSummary(summaryValue) &&
    !validateDescription(descriptionValue) &&
    !validateChangelog(changelogValue) &&
    !validateSwiftCode(swiftCodeValue) &&
    screenshotCount >= MIN_SCREENSHOTS &&
    screenshotCount <= MAX_SCREENSHOTS;

  function handleCategoryToggle(categoryId: string, checked: boolean) {
    markFieldTouched("categoryIds");
    setSelectedCategoryIds((current) => {
      if (checked) {
        if (current.includes(categoryId) || current.length >= 3) {
          updateFieldError("categoryIds", validateCategorySelection(current.length));
          return current;
        }

        const next = [...current, categoryId];
        updateFieldError("categoryIds", validateCategorySelection(next.length));

        return next;
      }

      const next = current.filter((id) => id !== categoryId);
      updateFieldError("categoryIds", validateCategorySelection(next.length));

      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const nextErrors: Partial<Record<EditorField, string>> = {};

    const titleError = validateTitle(String(formData.get("title") ?? ""));
    const categoryError = validateCategorySelection(selectedCategoryIds.length);
    const summaryError = validateSummary(String(formData.get("summary") ?? ""));
    const descriptionError = validateDescription(String(formData.get("description") ?? ""));
    const changelogError = validateChangelog(String(formData.get("changelog") ?? ""));
    const swiftCodeError = validateSwiftCode(String(formData.get("swiftCode") ?? ""));
    const screenshotsError = validateScreenshots(formData.get("screenshots"));

    if (titleError) {
      nextErrors.title = titleError;
    }

    if (categoryError) {
      nextErrors.categoryIds = categoryError;
    }

    if (summaryError) {
      nextErrors.summary = summaryError;
    }

    if (descriptionError) {
      nextErrors.description = descriptionError;
    }

    if (changelogError) {
      nextErrors.changelog = changelogError;
    }

    if (swiftCodeError) {
      nextErrors.swiftCode = swiftCodeError;
    }

    if (screenshotsError) {
      nextErrors.screenshots = screenshotsError;
    }

    setTouchedFields({
      title: true,
      categoryIds: true,
      summary: true,
      description: true,
      changelog: true,
      swiftCode: true,
      screenshots: true,
    });
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-8">
      <div>
        <Card className="rounded-[1.8rem] border border-black/6 bg-white/90 shadow-[0_35px_90px_-45px_rgba(21,16,10,0.5)] sm:rounded-[2rem]">
          <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
            <CardTitle className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
              <Component className="size-5 text-muted-foreground" />
              {messages.editor.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {messages.editor.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="space-y-3">
              <Label htmlFor="title">{messages.editor.componentTitle}</Label>
              <Input
                id="title"
                name="title"
                defaultValue={defaults.title}
                placeholder={messages.editor.componentTitlePlaceholder}
                minLength={3}
                maxLength={80}
                required
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={fieldErrors.title ? "editor-title-error" : undefined}
                onBlur={(event) => {
                  markFieldTouched("title");
                  updateFieldError("title", validateTitle(event.currentTarget.value));
                }}
                onChange={(event) => {
                  setTitleValue(event.currentTarget.value);
                  if (touchedFields.title) {
                    updateFieldError("title", validateTitle(event.currentTarget.value));
                  }
                }}
                className={cn(
                  "h-12 rounded-2xl",
                  fieldErrors.title ? "border-rose-300 focus-visible:ring-rose-200" : undefined
                )}
              />
              {fieldErrors.title ? (
                <p id="editor-title-error" className="text-sm text-rose-600">
                  {fieldErrors.title}
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <Label>{messages.editor.relatedCategories}</Label>
              <input type="hidden" name="primaryCategoryId" value={primaryCategoryId} />
              <input
                type="hidden"
                name="categoryIds"
                value={JSON.stringify(selectedCategoryIds)}
              />
              {categoryLocked ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedCategoryIds.map((categoryId) => {
                      const category = categories.find((item) => item.id === categoryId);

                      if (!category) {
                        return null;
                      }

                      return (
                        <span
                          key={category.id}
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[rgba(252,251,247,0.96)] px-3 py-2 text-sm font-medium text-foreground"
                        >
                          <CategoryIcon slug={category.slug} className="size-3.5 text-muted-foreground" />
                          {category.name}
                          {category.id === primaryCategoryId ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                              {messages.editor.primaryCategorySelected}
                            </span>
                          ) : null}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {messages.editor.categoryLockedHint}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {categories.map((category) => {
                    const checked = selectedCategoryIds.includes(category.id);
                    const disableUnchecked = !checked && selectedCategoryIds.length >= 3;

                    return (
                      <label
                        key={category.id}
                        className="flex items-start gap-3 rounded-[1.2rem] border border-black/10 bg-[rgba(252,251,247,0.96)] p-4"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disableUnchecked}
                          onChange={(event) =>
                            handleCategoryToggle(category.id, event.target.checked)
                          }
                        />
                        <div>
                          <div className="inline-flex items-center gap-2">
                            <CategoryIcon slug={category.slug} className="size-4 text-muted-foreground" />
                            <p className="font-medium text-foreground">{category.name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {checked && category.id === primaryCategoryId
                              ? messages.editor.primaryCategorySelected
                              : messages.editor.relatedCategoryOption}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {messages.editor.categoryHint}
              </p>
              {fieldErrors.categoryIds ? (
                <p id="editor-category-error" className="text-sm text-rose-600">
                  {fieldErrors.categoryIds}
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <Label htmlFor="summary">{messages.editor.summary}</Label>
              <Textarea
                id="summary"
                name="summary"
                defaultValue={defaults.summary}
                minLength={20}
                maxLength={160}
                required
                aria-invalid={Boolean(fieldErrors.summary)}
                aria-describedby={fieldErrors.summary ? "editor-summary-error" : undefined}
                onBlur={(event) => {
                  markFieldTouched("summary");
                  updateFieldError("summary", validateSummary(event.currentTarget.value));
                }}
                onChange={(event) => {
                  setSummaryValue(event.currentTarget.value);
                  if (touchedFields.summary) {
                    updateFieldError("summary", validateSummary(event.currentTarget.value));
                  }
                }}
                className={cn(
                  "min-h-28 rounded-[1.5rem]",
                  fieldErrors.summary ? "border-rose-300 focus-visible:ring-rose-200" : undefined
                )}
              />
              <p className="text-sm text-muted-foreground">
                {messages.editor.summaryHint}
              </p>
              {fieldErrors.summary ? (
                <p id="editor-summary-error" className="text-sm text-rose-600">
                  {fieldErrors.summary}
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <Label htmlFor="description">{messages.editor.descriptionLabel}</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={defaults.description}
                minLength={40}
                maxLength={1400}
                required
                aria-invalid={Boolean(fieldErrors.description)}
                aria-describedby={fieldErrors.description ? "editor-description-error" : undefined}
                onBlur={(event) => {
                  markFieldTouched("description");
                  updateFieldError("description", validateDescription(event.currentTarget.value));
                }}
                onChange={(event) => {
                  setDescriptionValue(event.currentTarget.value);
                  if (touchedFields.description) {
                    updateFieldError("description", validateDescription(event.currentTarget.value));
                  }
                }}
                className={cn(
                  "min-h-40 rounded-[1.5rem]",
                  fieldErrors.description
                    ? "border-rose-300 focus-visible:ring-rose-200"
                    : undefined
                )}
              />
              {fieldErrors.description ? (
                <p id="editor-description-error" className="text-sm text-rose-600">
                  {fieldErrors.description}
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <Label htmlFor="changelog">{messages.editor.changelog}</Label>
              <Textarea
                id="changelog"
                name="changelog"
                defaultValue={defaults.changelog}
                maxLength={400}
                aria-invalid={Boolean(fieldErrors.changelog)}
                aria-describedby={fieldErrors.changelog ? "editor-changelog-error" : undefined}
                onBlur={(event) => {
                  markFieldTouched("changelog");
                  updateFieldError("changelog", validateChangelog(event.currentTarget.value));
                }}
                onChange={(event) => {
                  setChangelogValue(event.currentTarget.value);
                  if (touchedFields.changelog) {
                    updateFieldError("changelog", validateChangelog(event.currentTarget.value));
                  }
                }}
                className={cn(
                  "min-h-24 rounded-[1.5rem]",
                  fieldErrors.changelog
                    ? "border-rose-300 focus-visible:ring-rose-200"
                    : undefined
                )}
              />
              {fieldErrors.changelog ? (
                <p id="editor-changelog-error" className="text-sm text-rose-600">
                  {fieldErrors.changelog}
                </p>
              ) : null}
            </div>
            <input type="hidden" name="accessType" value={defaults.accessType} />
            <input
              type="hidden"
              name="sellerTargetPriceUsd"
              value={defaults.sellerTargetPriceUsd}
            />
            <div className="mt-8 border-t border-black/8 pt-6">
              <CardTitle className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
              <ImageIcon className="size-5 text-muted-foreground" />
              {messages.editor.screenshotsTitle}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {messages.editor.screenshotsDescription}
              </p>
              <div className="mt-4 max-h-[32rem] overflow-y-auto pr-1 sm:max-h-[34rem]">
                <ScreenshotUploader
                  name="screenshots"
                  initialScreenshots={defaults.screenshots}
                  onScreenshotsChange={(screenshots) => setScreenshotCount(screenshots.length)}
                />
              </div>
              {fieldErrors.screenshots ? (
                <p id="editor-screenshots-error" className="mt-3 text-sm text-rose-600">
                  {fieldErrors.screenshots}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card
        className={cn(
          "rounded-[1.8rem] border shadow-[0_35px_90px_-45px_rgba(21,16,10,0.65)] sm:rounded-[2rem]",
          sourceEditorTheme === "dark"
            ? "border-black/6 bg-[#121010] text-white"
            : "border-black/6 bg-white text-foreground"
        )}
      >
        <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle
                className={cn(
                  "inline-flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl",
                  sourceEditorTheme === "dark" ? "text-white" : "text-foreground"
                )}
              >
                <Code2
                  className={cn(
                    "size-5",
                    sourceEditorTheme === "dark" ? "text-white/70" : "text-muted-foreground"
                  )}
                />
                {messages.editor.sourceTitle}
              </CardTitle>
              <p
                className={cn(
                  "mt-1 text-sm",
                  sourceEditorTheme === "dark" ? "text-white/65" : "text-muted-foreground"
                )}
              >
                {messages.editor.sourceDescription}
              </p>
            </div>

            <SourceThemeToggle
              value={sourceEditorTheme}
              onChange={setSourceEditorTheme}
              surface={sourceEditorTheme}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
          <Textarea
            id="swiftCode"
            name="swiftCode"
            defaultValue={defaults.swiftCode}
            placeholder={SWIFT_SOURCE_PLACEHOLDER}
            minLength={80}
            maxLength={20000}
            required
            aria-invalid={Boolean(fieldErrors.swiftCode)}
            aria-describedby={fieldErrors.swiftCode ? "editor-swift-code-error" : undefined}
            onBlur={(event) => {
              markFieldTouched("swiftCode");
              updateFieldError("swiftCode", validateSwiftCode(event.currentTarget.value));
            }}
            onChange={(event) => {
              setSwiftCodeValue(event.currentTarget.value);
              if (touchedFields.swiftCode) {
                updateFieldError("swiftCode", validateSwiftCode(event.currentTarget.value));
              }
            }}
            className={cn(
              "min-h-[24rem] rounded-[1.8rem] font-mono text-[12px] leading-6 sm:min-h-[34rem] sm:text-[13px]",
              sourceEditorTheme === "dark"
                ? "border border-white/10 bg-white/5 text-white"
                : "border border-black/10 bg-white text-foreground",
              fieldErrors.swiftCode ? "border-rose-300 focus-visible:ring-rose-200" : undefined
            )}
          />
          {fieldErrors.swiftCode ? (
            <p id="editor-swift-code-error" className="text-sm text-rose-500">
              {fieldErrors.swiftCode}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton
              intent="draft"
              pendingLabel={messages.editor.saveDraftPending}
              icon={<Save className="size-4" />}
              variant="outline"
              disabled={!isFormValid}
            >
              {messages.editor.saveDraft}
            </SubmitButton>
            <SubmitButton
              intent="submit"
              pendingLabel={messages.editor.submitPending}
              icon={<SendHorizontal className="size-4" />}
              variant="default"
              disabled={!isFormValid}
            >
              {messages.editor.submitForReview}
            </SubmitButton>
          </div>
          {state.error ? (
            <Alert className="rounded-[1.5rem] border-rose-300 bg-rose-50 px-4 py-3.5 text-base text-rose-700 sm:py-4">
              <AlertCircle className="size-4" />
              <div>{state.error}</div>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </form>
  );
}
