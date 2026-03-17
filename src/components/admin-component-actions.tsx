"use client";

import { ShieldX, Trash2 } from "lucide-react";

import {
  declineAdminComponentAction,
  deleteAdminComponentAction,
} from "@/lib/actions/admin-actions";
import { requestConfirmation } from "@/lib/request-confirmation";
import { AppActionButton } from "@/components/ui/app-action-button";

export function AdminComponentActions({
  componentId,
  declineLabel,
  deleteLabel,
  declineConfirmMessage,
  deleteConfirmMessage,
}: {
  componentId: string;
  declineLabel: string;
  deleteLabel: string;
  declineConfirmMessage: string;
  deleteConfirmMessage: string;
}) {
  return (
    <>
      <form
        action={declineAdminComponentAction}
        onSubmit={(event) => {
          if (!requestConfirmation(declineConfirmMessage)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="componentId" value={componentId} />
        <AppActionButton
          type="submit"
          uiSize="sm"
          tone="outline"
          icon={<ShieldX className="size-4" />}
        >
          {declineLabel}
        </AppActionButton>
      </form>

      <form
        action={deleteAdminComponentAction}
        onSubmit={(event) => {
          if (!requestConfirmation(deleteConfirmMessage)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="componentId" value={componentId} />
        <AppActionButton
          type="submit"
          uiSize="sm"
          tone="destructive"
          icon={<Trash2 className="size-4" />}
        >
          {deleteLabel}
        </AppActionButton>
      </form>
    </>
  );
}
