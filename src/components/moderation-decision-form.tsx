"use client";

import { useState, type FormEvent } from "react";

import { AlertCircle, Check, X } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { Alert } from "@/components/ui/alert";
import { AppActionButton } from "@/components/ui/app-action-button";
import { Textarea } from "@/components/ui/textarea";

export function ModerationDecisionForm({
  approveAction,
  declineAction,
  categories,
  defaultPrimaryCategoryId,
  defaultCategoryIds,
}: {
  approveAction: (formData: FormData) => Promise<void>;
  declineAction: (formData: FormData) => Promise<void>;
  categories: Array<{ id: string; name: string }>;
  defaultPrimaryCategoryId: string;
  defaultCategoryIds: string[];
}) {
  const { messages } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [primaryCategoryId, setPrimaryCategoryId] = useState(defaultPrimaryCategoryId);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(
    defaultCategoryIds.length > 0 ? defaultCategoryIds : [defaultPrimaryCategoryId]
  );

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const nativeEvent = event.nativeEvent as SubmitEvent;
    const submitter = nativeEvent.submitter;
    const decision =
      submitter instanceof HTMLButtonElement ? submitter.value : null;

    if (decision !== "declined") {
      if (
        selectedCategoryIds.length < 1 ||
        selectedCategoryIds.length > 3 ||
        !selectedCategoryIds.includes(primaryCategoryId)
      ) {
        event.preventDefault();
        setError(messages.moderationForm.categorySelectionRequired);
        return;
      }

      setError(null);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const note = String(formData.get("note") ?? "").trim();

    if (note) {
      setError(null);
      return;
    }

    event.preventDefault();
    setError(messages.moderationForm.noteRequired);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <Alert className="rounded-[1.4rem] border-rose-200 bg-rose-50 text-rose-700">
          <AlertCircle className="size-4" />
          <div>{error}</div>
        </Alert>
      ) : null}

      <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {messages.moderationForm.noteLabel}
      </label>
      <div className="space-y-3">
        <label
          htmlFor={`moderation-primary-category-${defaultPrimaryCategoryId}`}
          className="block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground"
        >
          {messages.moderationForm.primaryCategory}
        </label>
        <select
          id={`moderation-primary-category-${defaultPrimaryCategoryId}`}
          name="primaryCategoryId"
          value={primaryCategoryId}
          onChange={(event) => handlePrimaryCategoryChange(event.target.value)}
          className="h-11 w-full rounded-[1.2rem] border border-black/10 bg-white px-4 text-sm outline-none"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {messages.moderationForm.relatedCategories}
        </p>
        <input
          type="hidden"
          name="categoryIds"
          value={JSON.stringify(selectedCategoryIds)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => {
            const checked = selectedCategoryIds.includes(category.id);
            const disableUnchecked = !checked && selectedCategoryIds.length >= 3;

            return (
              <label
                key={category.id}
                className="flex items-start gap-3 rounded-[1.2rem] border border-black/8 bg-white px-4 py-3"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disableUnchecked}
                  onChange={(event) =>
                    handleCategoryToggle(category.id, event.target.checked)
                  }
                />
                <span className="text-sm font-medium text-foreground">
                  {category.name}
                </span>
              </label>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground">
          {messages.moderationForm.categoryHint}
        </p>
      </div>
      <Textarea
        name="note"
        placeholder={messages.moderationForm.notePlaceholder}
        className="min-h-36 rounded-[1.4rem]"
      />
      <div className="flex flex-wrap gap-3">
        <AppActionButton
          type="submit"
          value="approved"
          formAction={approveAction}
          uiSize="sm"
          icon={<Check className="size-4" />}
        >
          {messages.moderationForm.approve}
        </AppActionButton>
        <AppActionButton
          type="submit"
          value="declined"
          formAction={declineAction}
          uiSize="sm"
          tone="destructive"
          icon={<X className="size-4" />}
        >
          {messages.moderationForm.decline}
        </AppActionButton>
      </div>
    </form>
  );
}
