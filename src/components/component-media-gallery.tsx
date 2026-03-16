"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type MediaItem = {
  url: string;
  altText: string;
  previewUrl?: string | null;
  mediaType?: "IMAGE" | "VIDEO" | null;
  mimeType?: string | null;
};

function isVideoMedia(item: MediaItem) {
  return item.mediaType === "VIDEO" || Boolean(item.mimeType?.startsWith("video/"));
}

function preferredInitialIndex(items: MediaItem[]) {
  const firstVideoIndex = items.findIndex((item) => isVideoMedia(item));
  return firstVideoIndex >= 0 ? firstVideoIndex : 0;
}

export function ComponentMediaGallery({ items }: { items: MediaItem[] }) {
  const [activeIndex, setActiveIndex] = useState(() => preferredInitialIndex(items));

  useEffect(() => {
    setActiveIndex(preferredInitialIndex(items));
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const activeItem = items[activeIndex] ?? items[0];
  const activeIsVideo = isVideoMedia(activeItem);

  return (
    <div className="relative">
      {activeIsVideo ? (
        <video
          key={activeItem.url}
          src={activeItem.url}
          poster={activeItem.previewUrl ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full rounded-[1.2rem] object-cover sm:rounded-[1.4rem]"
        />
      ) : (
        <Image
          src={activeItem.url}
          alt={activeItem.altText}
          width={1800}
          height={1200}
          unoptimized
          className="w-full rounded-[1.2rem] object-cover sm:rounded-[1.4rem]"
        />
      )}

      {items.length > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-2 py-1 backdrop-blur">
            {items.map((item, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={`${item.url}-${index}`}
                  type="button"
                  aria-label={item.altText}
                  aria-current={active}
                  onClick={() => setActiveIndex(index)}
                  className="rounded-full p-1 transition hover:scale-110"
                >
                  <span
                    className={
                      active
                        ? "block size-2.5 rounded-full bg-foreground"
                        : "block size-2 rounded-full bg-foreground/35"
                    }
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

