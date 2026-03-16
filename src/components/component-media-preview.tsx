"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

export type ComponentMediaPreviewItem = {
  url: string;
  altText: string;
  previewUrl?: string | null;
  mediaType?: "IMAGE" | "VIDEO" | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
};

export function isVideoMediaItem(item: ComponentMediaPreviewItem) {
  return item.mediaType === "VIDEO" || Boolean(item.mimeType?.startsWith("video/"));
}

export function ComponentMediaPreview({
  item,
  className,
  mediaClassName,
  imageSource = "auto",
  videoControls = false,
}: {
  item: ComponentMediaPreviewItem;
  className?: string;
  mediaClassName?: string;
  imageSource?: "auto" | "preview";
  videoControls?: boolean;
}) {
  const isVideo = isVideoMediaItem(item);
  const imageUrl = imageSource === "preview" ? (item.previewUrl ?? item.url) : item.url;

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[22rem] overflow-hidden rounded-[1.2rem] bg-black sm:rounded-[1.4rem]",
        "aspect-[9/16]",
        className
      )}
    >
      {isVideo ? (
        <video
          key={item.url}
          src={item.url}
          poster={item.previewUrl ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          controls={videoControls}
          className={cn("size-full object-contain", mediaClassName)}
        />
      ) : (
        <Image
          src={imageUrl}
          alt={item.altText}
          width={item.width ?? 1080}
          height={item.height ?? 1920}
          unoptimized
          className={cn("size-full object-contain", mediaClassName)}
        />
      )}
    </div>
  );
}
