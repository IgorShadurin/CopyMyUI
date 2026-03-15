"use client";

import { useMemo, useState, useTransition } from "react";

import { AlertCircle, KeyRound, Trash2 } from "lucide-react";

import { useI18n } from "@/i18n/client";
import {
  createApiKeyAction,
  deleteApiKeyAction,
  updateApiKeyAction,
} from "@/lib/actions/api-key-actions";
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
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-black/6 bg-white/88 p-5 shadow-[0_28px_70px_-44px_rgba(22,18,12,0.45)]">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-amber-50 p-3 text-amber-700">
            <KeyRound className="size-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {messages.apiKeys.title}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              {messages.apiKeys.description}
            </p>
          </div>
        </div>

        <form
          action={handleCreate}
          data-testid="api-key-create-form"
          className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_auto]"
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
              className="mt-2 h-11 w-full rounded-[1rem] border border-black/10 bg-white px-4 text-sm outline-none"
            />
          </div>
          <label className="flex items-center gap-3 rounded-[1rem] border border-black/10 bg-[rgba(252,251,247,0.96)] px-4 py-3 text-sm text-foreground">
            <input type="checkbox" name="canPurchase" />
            <span>{messages.apiKeys.purchaseScopeLabel}</span>
          </label>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-semibold text-background"
          >
            {messages.apiKeys.create}
          </button>
        </form>

        {error ? (
          <Alert className="mt-4 rounded-[1.4rem] border-rose-200 bg-rose-50 text-rose-700">
            <AlertCircle className="size-4" />
            <div>{error}</div>
          </Alert>
        ) : null}
        {notice ? (
          <Alert className="mt-4 rounded-[1.4rem] border-emerald-200 bg-emerald-50 text-emerald-700">
            <AlertCircle className="size-4" />
            <div>{notice}</div>
          </Alert>
        ) : null}

        {createdKey ? (
          <div className="mt-4 rounded-[1.4rem] border border-emerald-200 bg-emerald-50/80 p-4">
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
      </div>

      <div className="grid gap-4">
        {orderedApiKeys.map((apiKey) => (
          <form
            key={apiKey.id}
            action={handleUpdate}
            data-testid={`api-key-card-${apiKey.id}`}
            className="grid gap-4 rounded-[1.8rem] border border-black/6 bg-white/88 p-5 shadow-[0_28px_70px_-44px_rgba(22,18,12,0.45)]"
          >
            <input type="hidden" name="apiKeyId" value={apiKey.id} />
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
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
                  className="mt-2 h-11 w-full rounded-[1rem] border border-black/10 bg-white px-4 text-sm outline-none"
                />
              </div>
              <label className="flex items-center gap-3 rounded-[1rem] border border-black/10 bg-[rgba(252,251,247,0.96)] px-4 py-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  name="canPurchase"
                  defaultChecked={apiKey.canPurchase}
                />
                <span>{messages.apiKeys.purchaseScopeLabel}</span>
              </label>
              <div className="rounded-[1rem] border border-black/10 bg-[rgba(252,251,247,0.96)] px-4 py-3 text-sm">
                <p className="font-medium text-foreground">{apiKey.keyPrefix}...</p>
                <p className="mt-1 text-muted-foreground">
                  {apiKey.lastUsedAt
                    ? `${messages.apiKeys.lastUsedLabel} ${formatDate(apiKey.lastUsedAt)}`
                    : messages.apiKeys.neverUsed}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {messages.apiKeys.createdLabel} {formatDate(apiKey.createdAt)}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-medium text-foreground"
                >
                  {messages.apiKeys.save}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    const formData = new FormData();
                    formData.set("apiKeyId", apiKey.id);
                    void handleDelete(formData);
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700"
                >
                  <Trash2 className="size-4" />
                  {messages.apiKeys.delete}
                </button>
              </div>
            </div>
          </form>
        ))}

        {orderedApiKeys.length === 0 ? (
          <div className="rounded-[1.8rem] border border-dashed border-black/10 bg-white/70 px-5 py-8 text-sm text-muted-foreground">
            {messages.apiKeys.empty}
          </div>
        ) : null}
      </div>
    </section>
  );
}
