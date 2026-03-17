"use client";

import { useEffect, useState, type FormEvent } from "react";

import { CheckSquare } from "lucide-react";

import { bulkAdminComponentsAction } from "@/lib/actions/admin-actions";
import { requestConfirmation } from "@/lib/request-confirmation";
import { AppActionButton } from "@/components/ui/app-action-button";

type AdminBulkActionType = "decline" | "delete";

export function AdminBulkActionsForm({
  formId,
  actionLabel,
  actionPlaceholder,
  declineLabel,
  deleteLabel,
  applyLabel,
  selectedCountLabel,
  selectionRequiredMessage,
  actionRequiredMessage,
  confirmDeclineMessage,
  confirmDeleteMessage,
}: {
  formId: string;
  actionLabel: string;
  actionPlaceholder: string;
  declineLabel: string;
  deleteLabel: string;
  applyLabel: string;
  selectedCountLabel: string;
  selectionRequiredMessage: string;
  actionRequiredMessage: string;
  confirmDeclineMessage: string;
  confirmDeleteMessage: string;
}) {
  const [selectedCount, setSelectedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const selector = `input[form="${formId}"][name="componentIds"]:checked`;

    const updateSelectedCount = () => {
      setSelectedCount(document.querySelectorAll(selector).length);
    };

    updateSelectedCount();
    document.addEventListener("change", updateSelectedCount);

    return () => {
      document.removeEventListener("change", updateSelectedCount);
    };
  }, [formId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const componentIds = formData
      .getAll("componentIds")
      .map((value) => String(value).trim())
      .filter(Boolean);

    if (componentIds.length === 0) {
      event.preventDefault();
      setError(selectionRequiredMessage);
      return;
    }

    const bulkAction = String(formData.get("bulkAction") ?? "") as AdminBulkActionType | "";

    if (!bulkAction) {
      event.preventDefault();
      setError(actionRequiredMessage);
      return;
    }

    const confirmMessage =
      bulkAction === "decline" ? confirmDeclineMessage : confirmDeleteMessage;

    if (!requestConfirmation(confirmMessage)) {
      event.preventDefault();
      return;
    }

    setError(null);
  }

  return (
    <form
      id={formId}
      action={bulkAdminComponentsAction}
      onSubmit={handleSubmit}
      className="rounded-lg border border-black/8 bg-[rgba(252,251,247,0.78)] p-3"
    >
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[14rem] flex-1">
          <label
            htmlFor={`${formId}-action`}
            className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            {actionLabel}
          </label>
          <select
            id={`${formId}-action`}
            name="bulkAction"
            className="h-9 w-full rounded-full border border-black/12 bg-white px-3 text-sm outline-none"
            defaultValue=""
          >
            <option value="">{actionPlaceholder}</option>
            <option value="decline">{declineLabel}</option>
            <option value="delete">{deleteLabel}</option>
          </select>
        </div>
        <AppActionButton
          type="submit"
          uiSize="sm"
          icon={<CheckSquare className="size-4" />}
          disabled={selectedCount === 0}
        >
          {applyLabel}
        </AppActionButton>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {selectedCountLabel} {selectedCount}
      </p>
      {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : null}
    </form>
  );
}
