import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import slugify from "slugify";

import {
  PIPELINE_COMPONENTS_DIR,
  PIPELINE_IMAGES_ROOT,
  PIPELINE_PLAN_PATH,
  PIPELINE_PROMPTS_DIR,
  PIPELINE_REGISTRY_PATH,
  PIPELINE_RESULTS_DIR,
  PIPELINE_ROOT,
  PIPELINE_TOPICS_DIR,
  PIPELINE_WORK_DIR,
} from "./config";
import type { JobRecord, PipelinePlan } from "./types";

export async function ensurePipelineDirs() {
  await Promise.all([
    mkdir(PIPELINE_ROOT, { recursive: true }),
    mkdir(PIPELINE_COMPONENTS_DIR, { recursive: true }),
    mkdir(PIPELINE_IMAGES_ROOT, { recursive: true }),
    mkdir(PIPELINE_PROMPTS_DIR, { recursive: true }),
    mkdir(PIPELINE_RESULTS_DIR, { recursive: true }),
    mkdir(PIPELINE_TOPICS_DIR, { recursive: true }),
    mkdir(PIPELINE_WORK_DIR, { recursive: true }),
  ]);
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const contents = await readFile(filePath, "utf8");
    return JSON.parse(contents) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function loadJobRegistry() {
  return readJsonFile<JobRecord[]>(PIPELINE_REGISTRY_PATH, []);
}

export async function saveJobRegistry(records: JobRecord[]) {
  await writeJsonFile(PIPELINE_REGISTRY_PATH, records);
}

export async function savePipelinePlan(plan: PipelinePlan) {
  await writeJsonFile(PIPELINE_PLAN_PATH, plan);
}

export function makeTopicId(titleHint: string) {
  return slugify(titleHint, { lower: true, strict: true }) || "component-topic";
}

export function makeJobId(categorySlug: string, topicId: string) {
  return `${categorySlug}__${topicId}`;
}
