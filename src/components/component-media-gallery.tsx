"use client";

import { useState } from "react";
import { ImageIcon, Video } from "lucide-react";

import { ComponentMediaPreview, isVideoMediaItem } from "@/components/component-media-preview";
import { cn } from "@/lib/utils";

type MediaItem = {
  url: string;
  altText: string;
  previewUrl?: string | null;
  mediaType?: "IMAGE" | "VIDEO" | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
};

function isVideoMedia(item: MediaItem) {
  return isVideoMediaItem(item);
}

function preferredInitialIndex(items: MediaItem[]) {
  const firstVideoIndex = items.findIndex((item) => isVideoMedia(item));
  return firstVideoIndex >= 0 ? firstVideoIndex : 0;
}

export function ComponentMediaGallery({ items }: { items: MediaItem[] }) {
  const initialIndex = preferredInitialIndex(items);
  const [activeIndex, setActiveIndex] = useState(() => initialIndex);

  const hasItems = items.length > 0;
  const clampedActiveIndex = hasItems ? Math.min(activeIndex, items.length - 1) : 0;
  const activeItem = hasItems ? (items[clampedActiveIndex] ?? items[0]) : null;

  if (!activeItem) {
    return null;
  }

  return (
    <div className="relative">
      <ComponentMediaPreview item={activeItem} className="max-w-[20rem] sm:max-w-[22rem]" />

      {items.length > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <div className="pointer-events-auto inline-flex items-center gap-4 rounded-full border border-black/10 bg-white/90 px-4 py-2 backdrop-blur">
            {items.map((item, index) => {
              const active = index === clampedActiveIndex;
              return (
                <button
                  key={`${item.url}-${index}`}
                  type="button"
                  aria-label={item.altText}
                  aria-current={active}
                  onClick={() => setActiveIndex(index)}
                  className="rounded-full p-2 transition hover:scale-110"
                >
                  {isVideoMedia(item) ? (
                    <Video
                      className={cn(
                        "size-6",
                        active ? "text-foreground" : "text-foreground/45"
                      )}
                    />
                  ) : (
                    <ImageIcon
                      className={cn(
                        "size-6",
                        active ? "text-foreground" : "text-foreground/45"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
