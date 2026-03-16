"use client";

import { useRef, useState } from "react";

import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { ComponentMediaPreview } from "@/components/component-media-preview";
import { useI18n } from "@/i18n/client";
import { formatMessage } from "@/i18n/format";
import { Button } from "@/components/ui/button";
import { MAX_SCREENSHOTS } from "@/lib/constants";
import { withStandardAltText } from "@/lib/screenshot-alt-text";

export type ScreenshotDraft = {
  mediaType: "IMAGE" | "VIDEO";
  mimeType?: string | null;
  url: string;
  storagePath: string;
  previewUrl?: string | null;
  previewStoragePath?: string | null;
  width?: number | null;
  height?: number | null;
  altText: string;
};

export function ScreenshotUploader({
  name,
  initialScreenshots,
  onScreenshotsChange,
}: {
  name: string;
  initialScreenshots: ScreenshotDraft[];
  onScreenshotsChange?: (screenshots: ScreenshotDraft[]) => void;
}) {
  const { messages } = useI18n();
  const [screenshots, setScreenshots] = useState(() =>
    withStandardAltText(initialScreenshots)
  );
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(screenshots)} />
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-dashed border-black/12 bg-amber-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-white p-2 shadow-sm">
            <ImagePlus className="size-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{messages.upload.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatMessage(messages.upload.description, { max: MAX_SCREENSHOTS })}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full sm:w-auto"
          disabled={isUploading || screenshots.length >= MAX_SCREENSHOTS}
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="size-4" />
          {isUploading ? messages.upload.uploading : messages.upload.upload}
        </Button>
      </div>

      <input
        data-testid="screenshot-input"
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
        multiple
        className="hidden"
        onChange={async (event) => {
          const files = Array.from(event.target.files ?? []);

          if (files.length === 0) {
            return;
          }

          if (files.length + screenshots.length > MAX_SCREENSHOTS) {
            toast.error(formatMessage(messages.upload.tooMany, { max: MAX_SCREENSHOTS }));
            event.target.value = "";
            return;
          }

          const formData = new FormData();
          files.forEach((file) => formData.append("files", file));

          try {
            setIsUploading(true);
            const response = await fetch("/api/uploads/screenshots", {
              method: "POST",
              body: formData,
            });

            const payload = (await response.json()) as
              | { error: string }
              | { files: ScreenshotDraft[] };

            if (!response.ok || "error" in payload) {
              toast.error("error" in payload ? payload.error : messages.upload.uploadFailed);
              return;
            }

            setScreenshots((current) => {
              const next = withStandardAltText([...current, ...payload.files]);
              onScreenshotsChange?.(next);
              return next;
            });
          } catch {
            toast.error(messages.upload.uploadFailed);
          } finally {
            setIsUploading(false);
            event.target.value = "";
          }
        }}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {screenshots.map((screenshot, index) => (
          <div
            key={`${screenshot.storagePath}-${index}`}
            className="overflow-hidden rounded-[1.5rem] border border-black/8 bg-white shadow-[0_24px_60px_-40px_rgba(28,21,12,0.45)]"
          >
            <div className="bg-[#0f0f10] p-3">
              <ComponentMediaPreview
                item={screenshot}
                className="max-w-[13rem] sm:max-w-[14rem]"
                imageSource="preview"
              />
            </div>
            <div className="space-y-3 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {screenshot.altText}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full text-rose-600"
                onClick={() => {
                  const shouldRemove = window.confirm(messages.upload.removeScreenshotConfirm);

                  if (!shouldRemove) {
                    return;
                  }

                  setScreenshots((current) => {
                    const next = withStandardAltText(
                      current.filter((_, currentIndex) => currentIndex !== index)
                    );
                    onScreenshotsChange?.(next);
                    return next;
                  });
                }}
              >
                <Trash2 className="size-4" />
                {messages.upload.removeScreenshot}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
