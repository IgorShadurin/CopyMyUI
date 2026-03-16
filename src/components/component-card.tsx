import Image from "next/image";
import Link from "next/link";

import { getI18n } from "@/i18n/server";
import { withLocalePath } from "@/i18n/routing";
import { FavoriteButton } from "@/components/favorite-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ComponentCard as ComponentCardModel } from "@/lib/server/component-service";

function initials(name: string | null | undefined) {
  return (name ?? "CM")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isVideoMedia(screenshot: {
  mediaType?: "IMAGE" | "VIDEO" | null;
  mimeType?: string | null;
}) {
  return screenshot.mediaType === "VIDEO" || Boolean(screenshot.mimeType?.startsWith("video/"));
}

export async function ComponentCard({
  component,
  showFavorite = true,
}: {
  component: ComponentCardModel;
  showFavorite?: boolean;
}) {
  const { locale, messages } = await getI18n();
  const previewSource = component.screenshots.find((screenshot) => !isVideoMedia(screenshot));
  const previewWidth = previewSource?.width ?? 0;
  const previewHeight = previewSource?.height ?? 0;
  const previewAspectRatio = previewWidth > 0 && previewHeight > 0 ? previewWidth / previewHeight : null;
  const isLandscapePreview = previewWidth > previewHeight;
  const isPortraitPreview = previewHeight > previewWidth;
  const forcePortraitCrop = component.slug === "audio-trimmer";
  const shouldApplyPortraitCrop = isPortraitPreview || forcePortraitCrop;
  const portraitScaleX =
    shouldApplyPortraitCrop && previewAspectRatio
      ? Math.min(1.42, Math.max(1.24, 0.72 / previewAspectRatio))
      : shouldApplyPortraitCrop
        ? 1.42
        : 1;

  return (
    <div
      data-testid={`component-card-${component.slug}`}
      className="group/card w-full overflow-hidden rounded-[14px]"
    >
      <div className="w-full translate-y-[18px] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:translate-y-0 group-focus-within/card:translate-y-0">
        <Link
          href={withLocalePath(locale, `/components/${component.slug}`)}
          aria-label={component.title}
          className="relative block aspect-[3/4] w-full overflow-hidden rounded-[12px] border border-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          style={{
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.07)",
          }}
        >
          {component.previewImage ? (
            <Image
              src={component.previewImage}
              alt={component.title}
              width={1080}
              height={1920}
              unoptimized
              className="size-full object-cover"
              style={{
                objectPosition: isLandscapePreview ? "left top" : "center",
                transform: shouldApplyPortraitCrop ? `scaleX(${portraitScaleX})` : "none",
                transformOrigin: "center center",
              }}
            />
          ) : (
            <div className="flex size-full items-center justify-center border border-dashed border-black/10 bg-white/70 text-sm text-muted-foreground">
              {messages.componentCard.screenshotComingSoon}
            </div>
          )}
        </Link>

        <div className="flex w-full translate-y-[30px] items-center gap-2 px-1 pt-3 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:translate-y-0 group-focus-within/card:translate-y-0">
          <Avatar
            size="sm"
            className="size-[18px] shrink-0 rounded-[30%] shadow-[0_0.5px_1px_rgba(0,0,0,0.25),inset_0_-3px_4px_rgba(0,0,0,0.02)] after:border-black/10"
          >
            <AvatarImage
              src={component.owner.image ?? undefined}
              alt={component.owner.name ?? messages.common.creator}
              className="rounded-[30%]"
            />
            <AvatarFallback className="rounded-[30%] text-[10px]">
              {initials(component.owner.name)}
            </AvatarFallback>
          </Avatar>

          <p className="min-w-0 truncate text-[13px] leading-[18px] font-medium text-foreground/80">
            {component.title}
          </p>

          {showFavorite ? (
            <div className="ml-auto shrink-0">
              <FavoriteButton
                componentId={component.id}
                initialIsFavorite={component.isFavorite}
                initialFavoritesCount={component.favoritesCount}
                compact
                showCount
                appearance="minimal"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
