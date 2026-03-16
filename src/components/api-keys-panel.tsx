"use client";

import { useMemo, useState, useTransition } from "react";

import { AlertCircle, KeyRound, Plus, Save, Trash2 } from "lucide-react";

import { useI18n } from "@/i18n/client";
import {
  createApiKeyAction,
  deleteApiKeyAction,
  updateApiKeyAction,
} from "@/lib/actions/api-key-actions";
import { AppActionButton } from "@/components/ui/app-action-button";
import { Alert } from "@/components/ui/alert";

type ApiKeyItem = {
  id: string;
  name: string;
  keyPrefix: string;
  canPurchase: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ApiKeysPanel({
  initialApiKeys,
}: {
  initialApiKeys: ApiKeyItem[];
}) {
  const { messages } = useI18n();
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [createdKeyName, setCreatedKeyName] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const orderedApiKeys = useMemo(
    () =>
      [...apiKeys].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      ),
    [apiKeys]
  );

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createApiKeyAction(
        {
          error: null,
          createdKey: null,
          createdKeyName: null,
          createdApiKey: null,
        },
        formData
      );

      if (result.error || !result.createdApiKey || !result.createdKey) {
        setError(result.error ?? messages.apiKeys.genericError);
        setNotice(null);
        return;
      }

      setApiKeys((current) => [result.createdApiKey!, ...current]);
      setCreatedKey(result.createdKey);
      setCreatedKeyName(result.createdKeyName);
      setError(null);
      setNotice(null);
    });
  }

  async function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const result = await updateApiKeyAction(formData);

      if (result.error || !result.apiKey) {
        setError(result.error ?? messages.apiKeys.genericError);
        setNotice(null);
        return;
      }

      setApiKeys((current) =>
        current.map((apiKey) => (apiKey.id === result.apiKey.id ? result.apiKey : apiKey))
      );
      setError(null);
      setNotice(messages.apiKeys.updatedNotice);
      setCreatedKey(null);
      setCreatedKeyName(null);
    });
  }

  async function handleDelete(formData: FormData) {
    startTransition(async () => {
      const result = await deleteApiKeyAction(formData);

      if (result.error || !result.deletedId) {
        setError(result.error ?? messages.apiKeys.genericError);
        setNotice(null);
        return;
      }

      setApiKeys((current) =>
        current.filter((apiKey) => apiKey.id !== result.deletedId)
      );
      setError(null);
      setNotice(messages.apiKeys.deletedNotice);
      setCreatedKey(null);
      setCreatedKeyName(null);
    });
  }

  return (
    <section className="rounded-[1.6rem] border border-black/6 bg-white/92 p-4 shadow-[0_18px_50px_-42px_rgba(22,18,12,0.38)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="inline-flex items-center gap-2.5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
            <KeyRound className="size-6 text-muted-foreground sm:size-7" />
            {messages.apiKeys.title}
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:pr-4">
            {messages.apiKeys.description}
          </p>
        </div>
        <span className="rounded-full border border-black/8 bg-[rgba(252,251,247,0.96)] px-3 py-1 text-xs font-semibold text-muted-foreground">
          {orderedApiKeys.length}
        </span>
      </div>

      <form
        action={handleCreate}
        data-testid="api-key-create-form"
        className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
      >
        <div>
          <label
            htmlFor="api-key-name"
            className="block text-sm font-medium text-foreground"
          >
            {messages.apiKeys.nameLabel}
          </label>
          <input
            id="api-key-name"
            type="text"
            name="name"
            placeholder={messages.apiKeys.namePlaceholder}
            className="mt-1.5 h-10 w-full rounded-[0.9rem] border border-black/10 bg-white px-3.5 text-sm outline-none"
          />
        </div>
        <div className="lg:pb-0.5">
          <AppActionButton
            type="submit"
            uiSize="lg"
            icon={<Plus className="size-4" />}
          >
            {messages.apiKeys.create}
          </AppActionButton>
        </div>
      </form>

      {error ? (
        <Alert className="mt-4 rounded-[1.2rem] border-rose-200 bg-rose-50 text-rose-700">
          <AlertCircle className="size-4" />
          <div>{error}</div>
        </Alert>
      ) : null}
      {notice ? (
        <Alert className="mt-4 rounded-[1.2rem] border-emerald-200 bg-emerald-50 text-emerald-700">
          <AlertCircle className="size-4" />
          <div>{notice}</div>
        </Alert>
      ) : null}

      {createdKey ? (
        <div className="mt-4 rounded-[1.2rem] border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-sm font-semibold text-emerald-800">
            {messages.apiKeys.createdNotice.replace(
              "{name}",
              createdKeyName ?? messages.apiKeys.fallbackName
            )}
          </p>
          <p className="mt-2 text-sm leading-7 text-emerald-900/80">
            {messages.apiKeys.createdHint}
          </p>
          <code
            data-testid="created-api-key"
            className="mt-3 block overflow-x-auto rounded-[1rem] border border-emerald-200 bg-white px-4 py-3 text-sm text-foreground"
          >
            {createdKey}
          </code>
        </div>
      ) : null}

      <div className="mt-5 border-t border-black/6 pt-4">
        <div className="grid gap-2.5">
          {orderedApiKeys.map((apiKey) => (
            <form
              key={apiKey.id}
              action={handleUpdate}
              data-testid={`api-key-card-${apiKey.id}`}
              className="grid gap-3 rounded-[1.2rem] border border-black/8 bg-[rgba(252,251,247,0.96)] p-3.5"
            >
              <input type="hidden" name="apiKeyId" value={apiKey.id} />
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div>
                  <label
                    htmlFor={`api-key-name-${apiKey.id}`}
                    className="block text-sm font-medium text-foreground"
                  >
                    {messages.apiKeys.nameLabel}
                  </label>
                  <input
                    id={`api-key-name-${apiKey.id}`}
                    type="text"
                    name="name"
                    defaultValue={apiKey.name}
                    className="mt-1.5 h-10 w-full rounded-[0.9rem] border border-black/10 bg-white px-3.5 text-sm outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <div className="w-full rounded-[0.9rem] border border-black/10 bg-white px-3 py-2 text-xs sm:min-w-64">
                    <p className="font-medium text-foreground">{apiKey.keyPrefix}...</p>
                    <p className="mt-1 text-muted-foreground">
                      {apiKey.lastUsedAt
                        ? `${messages.apiKeys.lastUsedLabel} ${formatDate(apiKey.lastUsedAt)}`
                        : messages.apiKeys.neverUsed}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/8 pt-3">
                <p className="text-xs text-muted-foreground">
                  {messages.apiKeys.createdLabel} {formatDate(apiKey.createdAt)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <AppActionButton
                    type="submit"
                    disabled={pending}
                    uiSize="md"
                    tone="outline"
                    icon={<Save className="size-4" />}
                  >
                    {messages.apiKeys.save}
                  </AppActionButton>
                  <AppActionButton
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      const formData = new FormData();
                      formData.set("apiKeyId", apiKey.id);
                      void handleDelete(formData);
                    }}
                    uiSize="md"
                    tone="destructive"
                    icon={<Trash2 className="size-4" />}
                  >
                    {messages.apiKeys.delete}
                  </AppActionButton>
                </div>
              </div>
            </form>
          ))}

          {orderedApiKeys.length === 0 ? (
            <div className="rounded-[1.2rem] border border-dashed border-black/12 bg-[rgba(252,251,247,0.7)] px-4 py-4 text-sm text-muted-foreground">
              {messages.apiKeys.empty}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
