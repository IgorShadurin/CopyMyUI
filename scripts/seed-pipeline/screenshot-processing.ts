import { execFile } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import sharp from "sharp";

import { IOS_SCREENSHOT_FRAME_SCRIPT, PIPELINE_COMPONENTS_DIR, PIPELINE_IMAGES_ROOT } from "./config";
import { writeJsonFile } from "./helpers";
import type { ComponentGenerationResult, GeneratedComponentManifest } from "./types";

const execFileAsync = promisify(execFile);

async function ensureFileExists(filePath: string) {
  await access(filePath);
}

export async function processComponentScreenshots(args: {
  jobId: string;
  topicId: string;
  categorySlug: string;
  result: ComponentGenerationResult;
}) {
  const { jobId, topicId, categorySlug, result } = args;
  const componentRoot = path.join(PIPELINE_IMAGES_ROOT, jobId);
  const framedDir = path.join(componentRoot, "framed");
  const previewDir = path.join(componentRoot, "preview");

  await Promise.all([
    mkdir(framedDir, { recursive: true }),
    mkdir(previewDir, { recursive: true }),
  ]);

  const processedStates = await Promise.all(
    result.states.map(async (state, index) => {
      const rawScreenshotPath = path.resolve(state.rawScreenshotPath);
      await ensureFileExists(rawScreenshotPath);

      const baseName = `${String(index + 1).padStart(2, "0")}-${state.name}-${state.appearance}`
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-");
      const framedScreenshotPath = path.join(framedDir, `${baseName}.png`);
      const previewPath = path.join(previewDir, `${baseName}.png`);

      await execFileAsync(IOS_SCREENSHOT_FRAME_SCRIPT, [rawScreenshotPath, framedScreenshotPath], {
        maxBuffer: 1024 * 1024 * 10,
      });
      await execFileAsync(
        "magick",
        [framedScreenshotPath, "-filter", "Lanczos", "-resize", "220x", "-strip", previewPath],
        {
          maxBuffer: 1024 * 1024 * 10,
        }
      );

      const metadata = await sharp(rawScreenshotPath).metadata();

      return {
        ...state,
        rawScreenshotPath,
        framedScreenshotPath,
        previewPath,
        width: metadata.width ?? undefined,
        height: metadata.height ?? undefined,
      };
    })
  );

  const manifest: GeneratedComponentManifest = {
    jobId,
    topicId,
    categorySlug,
    generatedAt: new Date().toISOString(),
    title: result.title,
    summary: result.summary,
    description: result.description,
    appName: result.appName,
    appStoreSearchHint: result.appStoreSearchHint,
    rationale: result.rationale,
    codeFilePath: path.resolve(result.codeFilePath),
    states: processedStates,
    selfReview: result.selfReview,
  };

  const manifestPath = path.join(PIPELINE_COMPONENTS_DIR, `${jobId}.json`);
  await writeJsonFile(manifestPath, manifest);

  return {
    manifest,
    manifestPath,
  };
}
