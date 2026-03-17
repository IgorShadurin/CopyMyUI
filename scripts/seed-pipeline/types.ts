export type JobStatus =
  | "queued"
  | "topics-ready"
  | "running"
  | "generated"
  | "validated"
  | "imported"
  | "error";

export type TopicCandidate = {
  id: string;
  titleHint: string;
  appName: string;
  rationale: string;
  targetUserValue: string;
  appStoreSearchHint: string;
  differentiator: string;
  states: string[];
};

export type TopicBatch = {
  categoryName: string;
  categorySlug: string;
  generatedAt: string;
  topics: TopicCandidate[];
};

export type ComponentScreenshotState = {
  name: string;
  appearance: "light" | "dark";
  description: string;
  rawScreenshotPath: string;
  framedScreenshotPath?: string;
  previewPath?: string;
  width?: number;
  height?: number;
};

export type ComponentGenerationResult = {
  title: string;
  summary: string;
  description: string;
  appName: string;
  appStoreSearchHint: string;
  rationale: string;
  codeFilePath: string;
  states: ComponentScreenshotState[];
  selfReview: {
    appealing: boolean;
    visibleComponent: boolean;
    notes: string;
  };
};

export type JobRecord = {
  jobId: string;
  categorySlug: string;
  topicId: string;
  titleHint: string;
  appName: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  errorMessage?: string;
  topicFilePath: string;
  promptFilePath?: string;
  resultFilePath?: string;
};

export type PipelinePlan = {
  generatedAt: string;
  preservedSeedComponentSlugs: string[];
  categories: Array<{
    name: string;
    slug: string;
    targetCount: number;
    referenceApps: string[];
  }>;
};

export type GeneratedComponentManifest = {
  jobId: string;
  topicId: string;
  categorySlug: string;
  generatedAt: string;
  title: string;
  summary: string;
  description: string;
  appName: string;
  appStoreSearchHint: string;
  rationale: string;
  codeFilePath: string;
  states: ComponentScreenshotState[];
  selfReview: ComponentGenerationResult["selfReview"];
};
