import path from "node:path";

export type PipelineCategory = {
  name: string;
  slug: string;
  targetCount: number;
  referenceApps: string[];
};

export const PIPELINE_ROOT = path.join(process.cwd(), "prisma", "generated-seed");
export const PIPELINE_COMPONENTS_DIR = path.join(PIPELINE_ROOT, "components");
export const PIPELINE_LOGS_DIR = path.join(PIPELINE_ROOT, "logs");
export const PIPELINE_PROMPTS_DIR = path.join(PIPELINE_ROOT, "prompts");
export const PIPELINE_RESULTS_DIR = path.join(PIPELINE_ROOT, "results");
export const PIPELINE_TOPICS_DIR = path.join(PIPELINE_ROOT, "topics");
export const PIPELINE_WORK_DIR = path.join(PIPELINE_ROOT, "work");
export const PIPELINE_IMAGES_ROOT = path.join(process.cwd(), "public", "generated-seed");
export const PIPELINE_REGISTRY_PATH = path.join(PIPELINE_ROOT, "jobs.json");
export const PIPELINE_PLAN_PATH = path.join(PIPELINE_ROOT, "plan.json");

export const PIPELINE_COMPONENT_RESULT_SCHEMA_PATH = path.join(
  process.cwd(),
  "scripts",
  "seed-pipeline",
  "schemas",
  "component-result.schema.json"
);
export const PIPELINE_TOPIC_BATCH_SCHEMA_PATH = path.join(
  process.cwd(),
  "scripts",
  "seed-pipeline",
  "schemas",
  "topic-batch.schema.json"
);

export const XCODE_PROJECT_ROOT = "/Users/test/XCodeProjects/CopyMyUI";
export const XCODE_COMPONENT_FILE =
  "/Users/test/XCodeProjects/CopyMyUI/AudioToAudio/App/ContentView.swift";
export const XCODE_COMPONENT_TEMPLATE_FILE = path.join(
  process.cwd(),
  "scripts",
  "seed-pipeline",
  "templates",
  "scratch-content-view.swift"
);
export const IOS_SCREENSHOT_FRAME_SCRIPT =
  "/Users/test/XCodeProjects/APPLE_HELPERS/iphone17-frame.sh";

export const PRESERVED_SEED_COMPONENT_SLUGS = ["audio-trimmer"] as const;

export const PIPELINE_CATEGORIES: PipelineCategory[] = [
  {
    name: "Navigation",
    slug: "navigation",
    targetCount: 100,
    referenceApps: [
      "Airbnb",
      "Uber",
      "Spotify",
      "YouTube",
      "Instagram",
      "Slack",
      "Notion",
      "Duolingo",
    ],
  },
  {
    name: "Dashboards",
    slug: "dashboards",
    targetCount: 100,
    referenceApps: [
      "Robinhood",
      "Coinbase",
      "Shopify",
      "Stripe Dashboard",
      "Google Analytics",
      "Fitness",
      "Health",
      "TradingView",
    ],
  },
  {
    name: "Commerce",
    slug: "commerce",
    targetCount: 100,
    referenceApps: [
      "Amazon",
      "Etsy",
      "Shop",
      "Nike",
      "ASOS",
      "Zara",
      "Temu",
      "DoorDash",
    ],
  },
  {
    name: "Paywall",
    slug: "paywall",
    targetCount: 100,
    referenceApps: [
      "Duolingo",
      "Headspace",
      "Calm",
      "Strava",
      "Canva",
      "MyFitnessPal",
      "Photomath",
      "Sleep Cycle",
    ],
  },
  {
    name: "Social",
    slug: "social",
    targetCount: 100,
    referenceApps: [
      "Instagram",
      "TikTok",
      "Reddit",
      "LinkedIn",
      "Discord",
      "X",
      "Threads",
      "BeReal",
    ],
  },
  {
    name: "Forms",
    slug: "forms",
    targetCount: 100,
    referenceApps: [
      "Revolut",
      "Airbnb",
      "Uber",
      "Notion",
      "Stripe",
      "Klarna",
      "Duolingo",
      "Headspace",
    ],
  },
  {
    name: "Media",
    slug: "media",
    targetCount: 100,
    referenceApps: [
      "Spotify",
      "Netflix",
      "YouTube",
      "Apple Music",
      "Audible",
      "Pocket Casts",
      "Letterboxd",
      "Pinterest",
    ],
  },
  {
    name: "Gaming",
    slug: "gaming",
    targetCount: 100,
    referenceApps: [
      "Steam Mobile",
      "Xbox",
      "PlayStation App",
      "Discord",
      "Clash Royale",
      "Brawl Stars",
      "PUBG Mobile",
      "Fortnite",
    ],
  },
];

export function getCategoryBySlug(slug: string) {
  return PIPELINE_CATEGORIES.find((category) => category.slug === slug) ?? null;
}
