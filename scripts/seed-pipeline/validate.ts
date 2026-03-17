import { access, readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";
import slugify from "slugify";

import { PIPELINE_COMPONENTS_DIR } from "./config";
import type { GeneratedComponentManifest } from "./types";

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isProbablyBlankImage(filePath: string) {
  const stats = await sharp(filePath).stats();
  const deviation = Math.max(...stats.channels.map((channel) => channel.stdev));
  return deviation < 6;
}

export async function validateManifest(jobId: string) {
  const manifestPath = path.join(PIPELINE_COMPONENTS_DIR, `${jobId}.json`);
  const manifest = JSON.parse(
    await readFile(manifestPath, "utf8")
  ) as GeneratedComponentManifest;
  const errors: string[] = [];

  if (manifest.title.trim().length < 3 || manifest.title.trim().length > 80) {
    errors.push("Title length is outside CopyMyUI limits.");
  }

  if (manifest.summary.trim().length < 20 || manifest.summary.trim().length > 160) {
    errors.push("Summary length is outside CopyMyUI limits.");
  }

  if (manifest.description.trim().length < 40 || manifest.description.trim().length > 1400) {
    errors.push("Description length is outside CopyMyUI limits.");
  }

  if (!(await fileExists(path.resolve(manifest.codeFilePath)))) {
    errors.push("Generated Swift code file is missing.");
  }

  const slug = slugify(manifest.title, { lower: true, strict: true });
  if (!slug) {
    errors.push("Generated title does not produce a valid slug.");
  }

  if (!manifest.states.length) {
    errors.push("No screenshot states were generated.");
  }

  for (const state of manifest.states) {
    if (!(await fileExists(path.resolve(state.rawScreenshotPath)))) {
      errors.push(`Missing raw screenshot for state ${state.name}.`);
      continue;
    }

    if (!(await fileExists(path.resolve(state.framedScreenshotPath ?? "")))) {
      errors.push(`Missing framed screenshot for state ${state.name}.`);
    }

    if (!(await fileExists(path.resolve(state.previewPath ?? "")))) {
      errors.push(`Missing preview screenshot for state ${state.name}.`);
    }

    if (await isProbablyBlankImage(path.resolve(state.rawScreenshotPath))) {
      errors.push(`Raw screenshot looks visually blank for state ${state.name}.`);
    }
  }

  return {
    manifest,
    errors,
    isValid: errors.length === 0,
  };
}
