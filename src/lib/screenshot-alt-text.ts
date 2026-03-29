type MediaWithAltText = {
  mediaType?: "IMAGE" | "VIDEO" | null;
  mimeType?: string | null;
  altText?: string;
};

function isVideoMedia(item: MediaWithAltText) {
  return (
    item.mediaType === "VIDEO" ||
    Boolean(item.mimeType?.toLowerCase().startsWith("video/"))
  );
}

export function withStandardAltText<T extends MediaWithAltText>(items: T[]) {
  let previewCount = 0;
  let videoCount = 0;

  return items.map((item) => {
    const normalizedAltText = item.altText?.trim();
    const hasCustomAltText = Boolean(normalizedAltText && normalizedAltText.length >= 2);

    if (isVideoMedia(item)) {
      videoCount += 1;
      return {
        ...item,
        altText: hasCustomAltText ? normalizedAltText : `Video ${videoCount}`,
      };
    }

    previewCount += 1;
    return {
      ...item,
      altText: hasCustomAltText ? normalizedAltText : `Preview ${previewCount}`,
    };
  });
}
