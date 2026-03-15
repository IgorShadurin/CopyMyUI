export const favoriteUpdatedEventName = "copymyui:favorite-updated";

export type FavoriteUpdatedDetail = {
  componentId: string;
  isFavorite: boolean;
  favoritesCount: number;
};
