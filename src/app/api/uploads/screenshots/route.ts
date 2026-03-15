import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import sharp from "sharp";

import { formatMessage } from "@/i18n/format";
import { getI18n } from "@/i18n/server";
import { MAX_SCREENSHOTS } from "@/lib/constants";
import { requireViewer } from "@/lib/viewer";

const imageMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const videoMimeTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const maxImageSizeBytes = 5 * 1024 * 1024;
const maxVideoSizeBytes = 50 * 1024 * 1024;

function getUploadPathSegments() {
  const namespace = process.env.COPYMYUI_UPLOAD_NAMESPACE?.trim();

  return ["uploads", "components", namespace].filter(
    (segment): segment is string => Boolean(segment)
  );
}

function extensionForVideo(file: File) {
  if (file.type === "video/webm") {
    return "webm";
  }

  if (file.type === "video/quicktime") {
    return "mov";
  }

  return "mp4";
}

function mediaTypeForFile(file: File): "IMAGE" | "VIDEO" | null {
  if (imageMimeTypes.has(file.type)) {
    return "IMAGE";
  }

  if (videoMimeTypes.has(file.type)) {
    return "VIDEO";
  }

  return null;
}

export async function POST(request: Request) {
  const { messages } = await getI18n();

  try {
    await requireViewer();
  } catch {
    return NextResponse.json({ error: messages.errors.api.signInToUpload }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((value): value is File => value instanceof File);

  if (files.length === 0 || files.length > MAX_SCREENSHOTS) {
    return NextResponse.json(
      {
        error: formatMessage(messages.errors.api.uploadCount, {
          max: MAX_SCREENSHOTS,
        }),
      },
      { status: 400 }
    );
  }

  const uploadPathSegments = getUploadPathSegments();
  const uploadDirectory = path.join(process.cwd(), "public", ...uploadPathSegments);
  await mkdir(uploadDirectory, { recursive: true });

  const uploadedFiles = [];

  for (const [index, file] of files.entries()) {
    const mediaType = mediaTypeForFile(file);

    if (!mediaType) {
      return NextResponse.json(
        { error: messages.errors.api.uploadTypes },
        { status: 400 }
      );
    }

    const maxBytes = mediaType === "IMAGE" ? maxImageSizeBytes : maxVideoSizeBytes;

    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: messages.errors.api.uploadSize },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const baseName = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 10)}`;
    const altText = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

    if (mediaType === "IMAGE") {
      const image = sharp(bytes).rotate();
      const fullRelativePath = path.join(...uploadPathSegments, `${baseName}-full.jpg`);
      const previewRelativePath = path.join(...uploadPathSegments, `${baseName}-preview.jpg`);
      const fullAbsolutePath = path.join(process.cwd(), "public", fullRelativePath);
      const previewAbsolutePath = path.join(process.cwd(), "public", previewRelativePath);

      const [fullJpeg, previewJpeg] = await Promise.all([
        image
          .clone()
          .resize({
            width: 1920,
            withoutEnlargement: true,
          })
          .jpeg({
            quality: 90,
            chromaSubsampling: "4:4:4",
            mozjpeg: true,
          })
          .toBuffer(),
        image
          .clone()
          .resize({
            width: 768,
            withoutEnlargement: true,
          })
          .jpeg({
            quality: 72,
            mozjpeg: true,
          })
          .toBuffer(),
      ]);

      await Promise.all([
        writeFile(fullAbsolutePath, fullJpeg),
        writeFile(previewAbsolutePath, previewJpeg),
      ]);

      uploadedFiles.push({
        mediaType: "IMAGE" as const,
        mimeType: "image/jpeg",
        url: `/${fullRelativePath.replaceAll(path.sep, "/")}`,
        storagePath: fullRelativePath.replaceAll(path.sep, "/"),
        previewUrl: `/${previewRelativePath.replaceAll(path.sep, "/")}`,
        previewStoragePath: previewRelativePath.replaceAll(path.sep, "/"),
        altText,
      });
      continue;
    }

    const extension = extensionForVideo(file);
    const relativePath = path.join(...uploadPathSegments, `${baseName}.${extension}`);
    const absolutePath = path.join(process.cwd(), "public", relativePath);

    await writeFile(absolutePath, bytes);

    uploadedFiles.push({
      mediaType: "VIDEO" as const,
      mimeType: file.type || "video/mp4",
      url: `/${relativePath.replaceAll(path.sep, "/")}`,
      storagePath: relativePath.replaceAll(path.sep, "/"),
      previewUrl: null,
      previewStoragePath: null,
      altText,
    });
  }

  return NextResponse.json({ files: uploadedFiles });
}
