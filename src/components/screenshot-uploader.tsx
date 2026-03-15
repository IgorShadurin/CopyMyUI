"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/i18n/client";
import { formatMessage } from "@/i18n/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_SCREENSHOTS } from "@/lib/constants";

export type ScreenshotDraft = {
  mediaType: "IMAGE" | "VIDEO";
  mimeType?: string | null;
  url: string;
  storagePath: string;
  previewUrl?: string | null;
  previewStoragePath?: string | null;
  altText: string;
};

export function ScreenshotUploader({
  name,
  initialScreenshots,
}: {
  name: string;
  initialScreenshots: ScreenshotDraft[];
}) {
  const { messages } = useI18n();
  const [screenshots, setScreenshots] = useState(initialScreenshots);
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

            setScreenshots((current) => [...current, ...payload.files]);
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
            <div className="aspect-[4/3] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.55),_rgba(255,255,255,0.06)),linear-gradient(135deg,#fff6e5_0%,#ffffff_55%,#ecfeff_100%)] p-3">
              {screenshot.mediaType === "VIDEO" ? (
                <video
                  src={screenshot.url}
                  controls
                  preload="metadata"
                  playsInline
                  className="size-full rounded-[1rem] object-cover"
                />
              ) : (
                <Image
                  src={screenshot.previewUrl ?? screenshot.url}
                  alt={screenshot.altText}
                  width={1200}
                  height={900}
                  unoptimized
                  className="size-full rounded-[1rem] object-cover"
                />
              )}
            </div>
            <div className="space-y-3 p-4">
              <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {messages.upload.altText}
              </label>
              <Input
                value={screenshot.altText}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setScreenshots((current) =>
                    current.map((item, currentIndex) =>
                      currentIndex === index ? { ...item, altText: nextValue } : item
                    )
                  );
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full text-rose-600"
                onClick={() =>
                  setScreenshots((current) =>
                    current.filter((_, currentIndex) => currentIndex !== index)
                  )
                }
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
