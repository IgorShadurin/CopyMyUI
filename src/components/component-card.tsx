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
  const hasPreview = Boolean(previewSource);
  const componentHref = withLocalePath(locale, `/components/${component.slug}`);
  const creatorHref = component.owner.profileSlug
    ? withLocalePath(locale, `/creators/${component.owner.profileSlug}`)
    : null;

  return (
    <div
      data-testid={`component-card-${component.slug}`}
      className="group/card w-full overflow-hidden rounded-[14px]"
    >
      <div className="w-full translate-y-[10px] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:translate-y-0 group-focus-within/card:translate-y-0">
        <Link
          href={componentHref}
          aria-label={component.title}
          className="relative block aspect-square w-full overflow-hidden rounded-[12px] border border-black/10 bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          style={{
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.07)",
          }}
        >
          {component.previewImage && hasPreview ? (
            <div className="size-full p-2">
              <Image
                src={component.previewImage}
                alt={component.title}
                width={1080}
                height={1920}
                unoptimized
                className="size-full object-contain"
              />
            </div>
          ) : (
            <div className="flex size-full items-center justify-center border border-dashed border-black/10 bg-white/70 text-sm text-muted-foreground">
              {messages.componentCard.screenshotComingSoon}
            </div>
          )}
        </Link>

        <div className="flex w-full translate-y-[18px] items-center gap-1.5 px-0.5 pt-2 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:translate-y-0 group-focus-within/card:translate-y-0">
          {creatorHref ? (
            <Link
              href={creatorHref}
              className="shrink-0 rounded-[30%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <Avatar
                size="sm"
                className="size-4 rounded-[30%] shadow-[0_0.5px_1px_rgba(0,0,0,0.25),inset_0_-3px_4px_rgba(0,0,0,0.02)] after:border-black/10"
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
            </Link>
          ) : (
            <Avatar
              size="sm"
              className="size-4 shrink-0 rounded-[30%] shadow-[0_0.5px_1px_rgba(0,0,0,0.25),inset_0_-3px_4px_rgba(0,0,0,0.02)] after:border-black/10"
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
          )}

          <Link
            href={componentHref}
            className="min-w-0 flex-1 truncate text-xs leading-[16px] font-medium text-foreground/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {component.title}
          </Link>

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
