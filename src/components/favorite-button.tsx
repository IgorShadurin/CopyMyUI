"use client";

import { startTransition, useState } from "react";

import { Bookmark } from "lucide-react";
import { toast } from "sonner";

import {
  favoriteUpdatedEventName,
  type FavoriteUpdatedDetail,
} from "@/components/favorite-events";
import { useI18n } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  componentId,
  initialIsFavorite,
  initialFavoritesCount,
  compact = false,
  showCount,
  appearance = "pill",
}: {
  componentId: string;
  initialIsFavorite: boolean;
  initialFavoritesCount: number;
  compact?: boolean;
  showCount?: boolean;
  appearance?: "pill" | "minimal";
}) {
  const { messages } = useI18n();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [favoritesCount, setFavoritesCount] = useState(initialFavoritesCount);
  const [isPending, setIsPending] = useState(false);
  const shouldShowCount = showCount ?? !compact;

  function dispatchFavoriteUpdated(detail: FavoriteUpdatedDetail) {
    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(new CustomEvent<FavoriteUpdatedDetail>(favoriteUpdatedEventName, { detail }));
  }

  return (
    <Button
      data-testid="favorite-button"
      type="button"
      variant={appearance === "minimal" ? "ghost" : compact ? "outline" : "secondary"}
      size={appearance === "minimal" ? "xs" : compact ? "icon-sm" : "sm"}
      className={cn(
        appearance === "minimal"
          ? "h-auto rounded px-1 py-0.5 text-[11px] text-muted-foreground/70 hover:bg-transparent"
          : compact
            ? "rounded-full bg-white/85 shadow-sm backdrop-blur"
            : "rounded-full",
        isFavorite
          ? appearance === "minimal"
            ? "text-amber-600 hover:text-amber-700"
            : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : ""
      )}
      aria-label={isFavorite ? messages.favorite.removeAria : messages.favorite.addAria}
      onClick={() => {
        startTransition(async () => {
          if (isPending) {
            return;
          }

          const previousIsFavorite = isFavorite;
          const previousFavoritesCount = favoritesCount;
          const nextIsFavorite = !previousIsFavorite;
          const nextFavoritesCount = Math.max(
            0,
            previousFavoritesCount + (nextIsFavorite ? 1 : -1)
          );

          setIsFavorite(nextIsFavorite);
          setFavoritesCount(nextFavoritesCount);
          dispatchFavoriteUpdated({
            componentId,
            isFavorite: nextIsFavorite,
            favoritesCount: nextFavoritesCount,
          });

          setIsPending(true);

          try {
            const response = await fetch(`/api/components/${componentId}/favorite`, {
              method: "POST",
            });
            const payload = (await response.json()) as
              | { error: string }
              | { favoritesCount: number; isFavorite: boolean };

            if (!response.ok || "error" in payload) {
              toast.error("error" in payload ? payload.error : messages.favorite.updateFailed);
              setIsFavorite(previousIsFavorite);
              setFavoritesCount(previousFavoritesCount);
              dispatchFavoriteUpdated({
                componentId,
                isFavorite: previousIsFavorite,
                favoritesCount: previousFavoritesCount,
              });
              return;
            }

            setIsFavorite(payload.isFavorite);
            setFavoritesCount(payload.favoritesCount);
            dispatchFavoriteUpdated({
              componentId,
              isFavorite: payload.isFavorite,
              favoritesCount: payload.favoritesCount,
            });
          } catch {
            toast.error(messages.favorite.updateFailed);
            setIsFavorite(previousIsFavorite);
            setFavoritesCount(previousFavoritesCount);
            dispatchFavoriteUpdated({
              componentId,
              isFavorite: previousIsFavorite,
              favoritesCount: previousFavoritesCount,
            });
          } finally {
            setIsPending(false);
          }
        });
      }}
      disabled={isPending}
    >
      <Bookmark
        className={cn(
          appearance === "minimal" ? "size-3.5" : "size-4",
          "transition-all duration-200 group-hover/button:scale-110",
          isFavorite
            ? "fill-amber-500 text-amber-500"
            : "text-muted-foreground group-hover/button:text-amber-500"
        )}
      />
      {shouldShowCount ? <span>{favoritesCount}</span> : null}
    </Button>
  );
}
