import { spawn } from "node:child_process";
import { openSync } from "node:fs";
import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  PIPELINE_CATEGORIES,
  PIPELINE_COMPONENT_RESULT_SCHEMA_PATH,
  PIPELINE_IMAGES_ROOT,
  PIPELINE_LOGS_DIR,
  PIPELINE_PLAN_PATH,
  PIPELINE_PROMPTS_DIR,
  PIPELINE_RESULTS_DIR,
  PIPELINE_TOPICS_DIR,
  PIPELINE_TOPIC_BATCH_SCHEMA_PATH,
  PIPELINE_WORK_DIR,
  XCODE_COMPONENT_FILE,
  XCODE_COMPONENT_TEMPLATE_FILE,
  XCODE_PROJECT_ROOT,
} from "./seed-pipeline/config";
import {
  ensurePipelineDirs,
  loadJobRegistry,
  makeJobId,
  makeTopicId,
  readJsonFile,
  saveJobRegistry,
  savePipelinePlan,
  writeJsonFile,
} from "./seed-pipeline/helpers";
import {
  buildComponentExecutionPrompt,
  buildTopicGenerationPrompt,
} from "./seed-pipeline/prompt-template";
import { processComponentScreenshots } from "./seed-pipeline/screenshot-processing";
import { validateManifest } from "./seed-pipeline/validate";
import type { ComponentGenerationResult, JobRecord, TopicBatch } from "./seed-pipeline/types";

function getArgValue(name: string) {
  const prefix = `--${name}=`;
  const direct = process.argv.find((arg) => arg.startsWith(prefix));
  if (direct) {
    return direct.slice(prefix.length);
  }

  const index = process.argv.findIndex((arg) => arg === `--${name}`);
  if (index >= 0) {
    return process.argv[index + 1] ?? null;
  }

  return null;
}

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function getCommand() {
  return process.argv[2] ?? "help";
}

async function runCodexExec(args: {
  cwd: string;
  promptFilePath: string;
  outputSchemaPath: string;
  outputPath: string;
  enableSearch?: boolean;
}) {
  const command = [
    "source ~/.zshrc >/dev/null 2>&1 &&",
    "codex-proxy",
    ...(args.enableSearch ? ["--search"] : []),
    "exec",
    "--skip-git-repo-check",
    "--output-schema",
    JSON.stringify(args.outputSchemaPath),
    "--output-last-message",
    JSON.stringify(args.outputPath),
    "-",
    "<",
    JSON.stringify(args.promptFilePath),
  ].join(" ");

  await new Promise<void>((resolve, reject) => {
    const child = spawn("zsh", ["-lc", command], {
      cwd: args.cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";

    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `codex-proxy exited with code ${code}`));
    });
  });
}

async function initPlan() {
  await ensurePipelineDirs();

  await savePipelinePlan({
    generatedAt: new Date().toISOString(),
    preservedSeedComponentSlugs: ["audio-trimmer"],
    categories: PIPELINE_CATEGORIES,
  });

  console.log(`Initialized pipeline plan at ${PIPELINE_PLAN_PATH}`);
}

async function ensureScratchComponentFile() {
  try {
    await access(XCODE_COMPONENT_FILE);
    return;
  } catch {
    const template = await readFile(XCODE_COMPONENT_TEMPLATE_FILE, "utf8");
    await writeFile(XCODE_COMPONENT_FILE, template, "utf8");
  }
}

async function generateTopics() {
  await ensurePipelineDirs();

  const categoryArg = getArgValue("category");
  const count = Number(getArgValue("count") ?? "100");
  const categories = categoryArg
    ? PIPELINE_CATEGORIES.filter((category) => category.slug === categoryArg)
    : PIPELINE_CATEGORIES;

  if (categories.length === 0) {
    throw new Error(`Unknown category: ${categoryArg}`);
  }

  const registry = await loadJobRegistry();

  for (const category of categories) {
    const prompt = buildTopicGenerationPrompt(category, count);
    const outputPath = path.join(PIPELINE_TOPICS_DIR, `${category.slug}.json`);
    const promptPath = path.join(PIPELINE_PROMPTS_DIR, `${category.slug}-topics.md`);

    await writeFile(promptPath, `${prompt}\n`, "utf8");

    await runCodexExec({
      cwd: process.cwd(),
      promptFilePath: promptPath,
      outputSchemaPath: PIPELINE_TOPIC_BATCH_SCHEMA_PATH,
      outputPath,
      enableSearch: true,
    });

    const topicBatch = await readJsonFile<TopicBatch | null>(outputPath, null);
    if (!topicBatch) {
      throw new Error(`Topic batch was not written for ${category.slug}. Prompt: ${promptPath}`);
    }

    for (const topic of topicBatch.topics) {
      const topicId = topic.id || makeTopicId(topic.titleHint);
      const jobId = makeJobId(category.slug, topicId);
      const existingIndex = registry.findIndex((job) => job.jobId === jobId);
      const record: JobRecord = {
        jobId,
        categorySlug: category.slug,
        topicId,
        titleHint: topic.titleHint,
        appName: topic.appName,
        status: "topics-ready",
        createdAt:
          existingIndex >= 0 ? registry[existingIndex]!.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attempts: existingIndex >= 0 ? registry[existingIndex]!.attempts : 0,
        topicFilePath: outputPath,
      };

      if (existingIndex >= 0) {
        registry.splice(existingIndex, 1, record);
      } else {
        registry.push(record);
      }
    }
  }

  await saveJobRegistry(registry);
  console.log(`Generated topic batches for ${categories.length} categories.`);
}

async function runJob() {
  await ensurePipelineDirs();

  const jobId = getArgValue("job");
  if (!jobId) {
    throw new Error("Missing required --job=<job-id>");
  }

  const registry = await loadJobRegistry();
  const job = registry.find((record) => record.jobId === jobId);
  if (!job) {
    throw new Error(`Unknown job: ${jobId}`);
  }

  const category = PIPELINE_CATEGORIES.find((item) => item.slug === job.categorySlug);
  if (!category) {
    throw new Error(`Unknown job category: ${job.categorySlug}`);
  }

  const topicBatch = await readJsonFile<TopicBatch | null>(job.topicFilePath, null);
  const topic = topicBatch?.topics.find((item) => item.id === job.topicId);
  if (!topic) {
    throw new Error(`Missing topic ${job.topicId} in ${job.topicFilePath}`);
  }

  const jobWorkDir = path.join(PIPELINE_WORK_DIR, job.jobId);
  const rawImagesDir = path.join(PIPELINE_IMAGES_ROOT, job.jobId, "raw");
  const codeOutputPath = path.join(jobWorkDir, "component.swift");
  const resultJsonPath = path.join(PIPELINE_RESULTS_DIR, `${job.jobId}.json`);
  const promptFilePath = path.join(PIPELINE_PROMPTS_DIR, `${job.jobId}.md`);
  const scratchBackupPath = path.join(jobWorkDir, "scratch-backup.swift");
  await Promise.all([
    mkdir(jobWorkDir, { recursive: true }),
    mkdir(rawImagesDir, { recursive: true }),
  ]);
  await ensureScratchComponentFile();
  await copyFile(XCODE_COMPONENT_FILE, scratchBackupPath);
  const prompt = buildComponentExecutionPrompt({
    category,
    job,
    topic,
    jobWorkDir,
    rawImagesDir,
    codeOutputPath,
    resultJsonPath,
  });

  await writeFile(promptFilePath, `${prompt}\n`, "utf8");

  const updatedJob: JobRecord = {
    ...job,
    status: "running",
    attempts: job.attempts + 1,
    updatedAt: new Date().toISOString(),
    promptFilePath,
    resultFilePath: resultJsonPath,
    errorMessage: undefined,
  };
  await saveJobRegistry(
    registry.map((record) => (record.jobId === job.jobId ? updatedJob : record))
  );

  try {
    await runCodexExec({
      cwd: XCODE_PROJECT_ROOT,
      promptFilePath,
      outputSchemaPath: PIPELINE_COMPONENT_RESULT_SCHEMA_PATH,
      outputPath: resultJsonPath,
      enableSearch: false,
    });

    const result = await readJsonFile<ComponentGenerationResult | null>(
      resultJsonPath,
      null
    );
    if (!result) {
      throw new Error(`Missing result JSON for job ${job.jobId}`);
    }

    await finalizeGeneratedJob({
      registry,
      updatedJob,
      result,
    });
  } catch (error) {
    await copyFile(scratchBackupPath, XCODE_COMPONENT_FILE);
    await saveJobRegistry(
      registry.map((record) =>
        record.jobId === job.jobId
          ? {
              ...updatedJob,
              status: "error",
              updatedAt: new Date().toISOString(),
              errorMessage: error instanceof Error ? error.message : String(error),
            }
          : record
      )
    );
    throw error;
  }
}

async function finalizeGeneratedJob(args: {
  registry: JobRecord[];
  updatedJob: JobRecord;
  result: ComponentGenerationResult;
}) {
  const { registry, updatedJob, result } = args;

  await processComponentScreenshots({
    jobId: updatedJob.jobId,
    topicId: updatedJob.topicId,
    categorySlug: updatedJob.categorySlug,
    result,
  });

  await saveJobRegistry(
    registry.map((record) =>
      record.jobId === updatedJob.jobId
        ? {
            ...updatedJob,
            status: "generated",
            updatedAt: new Date().toISOString(),
          }
        : record
    )
  );
}

async function startJob() {
  await ensurePipelineDirs();
  await mkdir(PIPELINE_LOGS_DIR, { recursive: true });

  const jobId = getArgValue("job");
  if (!jobId) {
    throw new Error("Missing required --job=<job-id>");
  }

  const registry = await loadJobRegistry();
  const job = registry.find((record) => record.jobId === jobId);
  if (!job) {
    throw new Error(`Unknown job: ${jobId}`);
  }

  const logFilePath = path.join(PIPELINE_LOGS_DIR, `${jobId}.log`);
  const logFd = openSync(logFilePath, "a");
  const child = spawn(
    "zsh",
    ["-lc", `cd ${JSON.stringify(process.cwd())} && npm run seed:pipeline -- run-job --job=${JSON.stringify(jobId)}`],
    {
      cwd: process.cwd(),
      detached: true,
      stdio: ["ignore", logFd, logFd],
    }
  );

  child.unref();

  console.log(
    JSON.stringify(
      {
        jobId,
        pid: child.pid,
        logFilePath,
      },
      null,
      2
    )
  );
}

async function finalizeJob() {
  await ensurePipelineDirs();

  const jobId = getArgValue("job");
  if (!jobId) {
    throw new Error("Missing required --job=<job-id>");
  }

  const registry = await loadJobRegistry();
  const job = registry.find((record) => record.jobId === jobId);
  if (!job) {
    throw new Error(`Unknown job: ${jobId}`);
  }

  const resultFilePath =
    getArgValue("result") ??
    job.resultFilePath ??
    path.join(PIPELINE_RESULTS_DIR, `${jobId}.json`);
  const result = await readJsonFile<ComponentGenerationResult | null>(resultFilePath, null);
  if (!result) {
    throw new Error(`Missing result JSON for job ${jobId}: ${resultFilePath}`);
  }

  const updatedJob: JobRecord = {
    ...job,
    resultFilePath,
    updatedAt: new Date().toISOString(),
    errorMessage: undefined,
  };

  await finalizeGeneratedJob({
    registry,
    updatedJob,
    result,
  });
}

async function resetJob() {
  await ensurePipelineDirs();

  const jobId = getArgValue("job");
  if (!jobId) {
    throw new Error("Missing required --job=<job-id>");
  }

  const registry = await loadJobRegistry();
  const job = registry.find((record) => record.jobId === jobId);
  if (!job) {
    throw new Error(`Unknown job: ${jobId}`);
  }

  await saveJobRegistry(
    registry.map((record) =>
      record.jobId === jobId
        ? {
            ...record,
            status: "topics-ready",
            updatedAt: new Date().toISOString(),
            errorMessage: undefined,
          }
        : record
    )
  );
}

async function showStatus() {
  await ensurePipelineDirs();

  const registry = await loadJobRegistry();
  const counts = registry.reduce<Record<string, number>>((accumulator, record) => {
    accumulator[record.status] = (accumulator[record.status] ?? 0) + 1;
    return accumulator;
  }, {});

  console.log(JSON.stringify({ totalJobs: registry.length, byStatus: counts }, null, 2));
}

async function validateJobs() {
  await ensurePipelineDirs();

  const singleJobId = getArgValue("job");
  const registry = await loadJobRegistry();
  const targetJobs = singleJobId
    ? registry.filter((record) => record.jobId === singleJobId)
    : registry.filter((record) => record.status === "generated" || record.status === "validated");

  if (singleJobId && targetJobs.length === 0) {
    throw new Error(`Unknown job: ${singleJobId}`);
  }

  const slugOwners = new Map<string, string>();
  const nextRegistry = [...registry];

  for (const record of targetJobs) {
    const result = await validateManifest(record.jobId);
    const slug = result.manifest.title
      ? result.manifest.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      : "";

    if (slug) {
      const existingOwner = slugOwners.get(slug);
      if (existingOwner && existingOwner !== record.jobId) {
        result.errors.push(`Duplicate title slug collision with ${existingOwner}.`);
      } else {
        slugOwners.set(slug, record.jobId);
      }
    }

    const index = nextRegistry.findIndex((item) => item.jobId === record.jobId);
    nextRegistry[index] = {
      ...record,
      status: result.isValid && result.errors.length === 0 ? "validated" : "error",
      updatedAt: new Date().toISOString(),
      errorMessage:
        result.errors.length > 0 ? result.errors.join(" ") : undefined,
    };
  }

  await saveJobRegistry(nextRegistry);

  console.log(
    JSON.stringify(
      nextRegistry
        .filter((record) => targetJobs.some((item) => item.jobId === record.jobId))
        .map((record) => ({
          jobId: record.jobId,
          status: record.status,
          errorMessage: record.errorMessage ?? null,
        })),
      null,
      2
    )
  );
}

async function main() {
  const command = getCommand();

  switch (command) {
    case "init":
      await initPlan();
      return;
    case "generate-topics":
      await generateTopics();
      return;
    case "run-job":
      await runJob();
      return;
    case "start-job":
      await startJob();
      return;
    case "finalize-job":
      await finalizeJob();
      return;
    case "reset-job":
      await resetJob();
      return;
    case "status":
      await showStatus();
      return;
    case "validate":
      await validateJobs();
      return;
    case "help":
    default:
      console.log(
        [
          "Usage:",
          "  npm run seed:pipeline -- init",
          "  npm run seed:pipeline -- generate-topics [--category=<slug>] [--count=100]",
          "  npm run seed:pipeline -- start-job --job=<job-id>",
          "  npm run seed:pipeline -- run-job --job=<job-id>",
          "  npm run seed:pipeline -- finalize-job --job=<job-id> [--result=<path>]",
          "  npm run seed:pipeline -- reset-job --job=<job-id>",
          "  npm run seed:pipeline -- status",
          "  npm run seed:pipeline -- validate [--job=<job-id>]",
        ].join("\n")
      );
  }
}

void main();
