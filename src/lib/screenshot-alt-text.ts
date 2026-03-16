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
    if (isVideoMedia(item)) {
      videoCount += 1;
      return {
        ...item,
        altText: `Video ${videoCount}`,
      };
    }

    previewCount += 1;
    return {
      ...item,
      altText: `Preview ${previewCount}`,
    };
  });
}
