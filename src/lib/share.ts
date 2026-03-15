import { getBaseUrl } from "@/lib/env";
import { formatMessage } from "@/i18n/format";

export function absoluteUrl(path: string) {
  return new URL(path, getBaseUrl()).toString();
}

export function buildShareLinks(
  title: string,
  pathOrUrl: string,
  shareTextTemplate = "{title} on CopyMyUI"
) {
  const resolvedUrl = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : absoluteUrl(pathOrUrl);
  const url = encodeURIComponent(resolvedUrl);
  const text = encodeURIComponent(formatMessage(shareTextTemplate, { title }));

  return {
    x: `https://x.com/intent/tweet?text=${text}&url=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    reddit: `https://www.reddit.com/submit?url=${url}&title=${text}`,
  };
}
