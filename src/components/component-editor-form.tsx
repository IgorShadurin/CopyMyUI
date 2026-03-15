"use client";

import { ComponentAccessType } from "@prisma/client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AlertCircle } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { SubmitButton } from "@/components/submit-button";
import {
  ScreenshotUploader,
  type ScreenshotDraft,
} from "@/components/screenshot-uploader";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  initialFormState,
  type FormState,
} from "@/lib/actions/form-state";

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
};

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
  const [accessType, setAccessType] = useState(defaults.accessType);
  const [primaryCategoryId, setPrimaryCategoryId] = useState(
    defaults.primaryCategoryId || categories[0]?.id || ""
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    defaults.categoryIds.length > 0
      ? defaults.categoryIds
      : defaults.primaryCategoryId
        ? [defaults.primaryCategoryId]
        : categories[0]
          ? [categories[0].id]
          : []
  );
  const [state, formAction] = useActionState(action, initialFormState);

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [router, state.redirectTo]);

  function handlePrimaryCategoryChange(nextPrimaryCategoryId: string) {
    setPrimaryCategoryId(nextPrimaryCategoryId);
    setSelectedCategoryIds((current) => {
      const withoutPrimary = current.filter((categoryId) => categoryId !== nextPrimaryCategoryId);
      return [nextPrimaryCategoryId, ...withoutPrimary].slice(0, 3);
    });
  }

  function handleCategoryToggle(categoryId: string, checked: boolean) {
    if (categoryId === primaryCategoryId && !checked) {
      return;
    }

    setSelectedCategoryIds((current) => {
      if (checked) {
        if (current.includes(categoryId) || current.length >= 3) {
          return current;
        }

        return [...current, categoryId];
      }

      return current.filter((id) => id !== categoryId);
    });
  }

  return (
    <form action={formAction} className="space-y-8">
      {state.error ? (
        <Alert className="rounded-[1.5rem] border-rose-200 bg-rose-50 text-rose-700">
          <AlertCircle className="size-4" />
          <div>{state.error}</div>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:gap-8">
        <Card className="rounded-[1.8rem] border border-black/6 bg-white/90 shadow-[0_35px_90px_-45px_rgba(21,16,10,0.5)] sm:rounded-[2rem]">
          <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
            <CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
              {messages.editor.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {messages.editor.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="grid gap-6 md:grid-cols-[1fr_220px]">
              <div className="space-y-3">
                <Label htmlFor="title">{messages.editor.componentTitle}</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={defaults.title}
                  placeholder={messages.editor.componentTitlePlaceholder}
                  className="h-12 rounded-2xl"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="primaryCategoryId">{messages.editor.primaryCategory}</Label>
                {categoryLocked ? (
                  <input type="hidden" name="primaryCategoryId" value={primaryCategoryId} />
                ) : null}
                <select
                  id="primaryCategoryId"
                  name="primaryCategoryId"
                  value={primaryCategoryId}
                  disabled={categoryLocked}
                  onChange={(event) => handlePrimaryCategoryChange(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-black/10 bg-background px-4 text-sm outline-none"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>{messages.editor.relatedCategories}</Label>
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
                          className="rounded-full border border-black/10 bg-[rgba(252,251,247,0.96)] px-3 py-2 text-sm font-medium text-foreground"
                        >
                          {category.name}
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
                          <p className="font-medium text-foreground">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.id === primaryCategoryId
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
            </div>

            <div className="space-y-3">
              <Label htmlFor="summary">{messages.editor.summary}</Label>
              <Textarea
                id="summary"
                name="summary"
                defaultValue={defaults.summary}
                className="min-h-28 rounded-[1.5rem]"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="description">{messages.editor.descriptionLabel}</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={defaults.description}
                className="min-h-40 rounded-[1.5rem]"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="changelog">{messages.editor.changelog}</Label>
              <Textarea
                id="changelog"
                name="changelog"
                defaultValue={defaults.changelog}
                className="min-h-24 rounded-[1.5rem]"
              />
            </div>

            <div className="rounded-[1.5rem] border border-black/8 bg-[rgba(252,251,247,0.96)] p-4">
              <p className="text-sm font-semibold text-foreground">
                {messages.editor.monetizationTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {messages.editor.monetizationDescription}
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-[1.2rem] border border-black/10 bg-white p-4">
                  <input
                    type="radio"
                    name="accessType"
                    value={ComponentAccessType.FREE}
                    checked={accessType === ComponentAccessType.FREE}
                    onChange={() => setAccessType(ComponentAccessType.FREE)}
                  />
                  <div>
                    <p className="font-medium text-foreground">{messages.editor.freeOption}</p>
                    <p className="text-sm text-muted-foreground">
                      {messages.editor.freeOptionDescription}
                    </p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-[1.2rem] border border-black/10 bg-white p-4">
                  <input
                    type="radio"
                    name="accessType"
                    value={ComponentAccessType.PREMIUM}
                    checked={accessType === ComponentAccessType.PREMIUM}
                    onChange={() => setAccessType(ComponentAccessType.PREMIUM)}
                  />
                  <div>
                    <p className="font-medium text-foreground">{messages.editor.premiumOption}</p>
                    <p className="text-sm text-muted-foreground">
                      {messages.editor.premiumOptionDescription}
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-4 space-y-3">
                <Label htmlFor="sellerTargetPriceUsd">{messages.editor.sellerTargetPrice}</Label>
                <Input
                  id="sellerTargetPriceUsd"
                  name="sellerTargetPriceUsd"
                  type="number"
                  min="1"
                  step="0.01"
                  inputMode="decimal"
                  disabled={accessType !== ComponentAccessType.PREMIUM}
                  defaultValue={defaults.sellerTargetPriceUsd}
                  placeholder="100"
                  className="h-12 rounded-2xl"
                />
                <p className="text-sm text-muted-foreground">
                  {messages.editor.sellerTargetPriceHint}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.8rem] border border-black/6 bg-white/90 shadow-[0_35px_90px_-45px_rgba(21,16,10,0.5)] sm:rounded-[2rem]">
          <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
            <CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
              {messages.editor.screenshotsTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {messages.editor.screenshotsDescription}
            </p>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
            <ScreenshotUploader
              name="screenshots"
              initialScreenshots={defaults.screenshots}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[1.8rem] border border-black/6 bg-[#121010] text-white shadow-[0_35px_90px_-45px_rgba(21,16,10,0.65)] sm:rounded-[2rem]">
        <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
          <CardTitle className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {messages.editor.sourceTitle}
          </CardTitle>
          <p className="text-sm text-white/65">
            {messages.editor.sourceDescription}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
          <Textarea
            id="swiftCode"
            name="swiftCode"
            defaultValue={defaults.swiftCode}
            className="min-h-[24rem] rounded-[1.8rem] border border-white/10 bg-white/5 font-mono text-[12px] leading-6 text-white sm:min-h-[34rem] sm:text-[13px]"
          />
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton
              intent="draft"
              pendingLabel={messages.editor.saveDraftPending}
              variant="outline"
            >
              {messages.editor.saveDraft}
            </SubmitButton>
            <SubmitButton
              intent="submit"
              pendingLabel={messages.editor.submitPending}
              variant="default"
            >
              {messages.editor.submitForReview}
            </SubmitButton>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
