import "dotenv/config";

import { execFile } from "node:child_process";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  ComponentAccessType,
  ComponentStatus,
  ModerationDecision,
  PrismaClient,
  UserRole,
} from "@prisma/client";
import slugify from "slugify";
import sharp from "sharp";

import { rebuildApprovedComponentSearchIndex } from "../src/lib/server/search-service";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  }),
});
const execFileAsync = promisify(execFile);

const categories = [
  {
    name: "Navigation",
    description: "Tab bars, side rails, pagers, and compact navigational shells.",
    accent: "from-orange-300 via-pink-200 to-amber-100",
  },
  {
    name: "Dashboards",
    description: "Metrics, cards, management views, and analytical layouts.",
    accent: "from-sky-300 via-cyan-200 to-blue-100",
  },
  {
    name: "Commerce",
    description: "Pricing flows, product cards, carts, and purchase surfaces.",
    accent: "from-lime-300 via-emerald-200 to-green-100",
  },
  {
    name: "Paywall",
    description: "Subscription gates, upgrade prompts, and monetization surfaces.",
    accent: "from-teal-300 via-cyan-200 to-sky-100",
  },
  {
    name: "Social",
    description: "Profile modules, social timelines, and engagement widgets.",
    accent: "from-fuchsia-300 via-rose-200 to-pink-100",
  },
  {
    name: "Forms",
    description: "Multi-step forms, auth screens, and polished field groups.",
    accent: "from-violet-300 via-indigo-200 to-slate-100",
  },
  {
    name: "Media",
    description: "Galleries, players, carousels, and motion-heavy canvases.",
    accent: "from-yellow-300 via-orange-200 to-neutral-100",
  },
  {
    name: "Gaming",
    description: "HUDs, inventories, quest flows, and gameplay overlays.",
    accent: "from-indigo-300 via-violet-200 to-sky-100",
  },
] as const;

type CategoryName = (typeof categories)[number]["name"];

type SeedPattern =
  | "tabBarOrbit"
  | "sidebarFlow"
  | "segmentedRail"
  | "commandSheet"
  | "metricsDeck"
  | "opsBoard"
  | "revenuePulse"
  | "kpiHorizon"
  | "checkoutStack"
  | "pricingLens"
  | "productSpotlight"
  | "upsellDrawer"
  | "profileGrid"
  | "creatorThread"
  | "storyShelf"
  | "communityBanner"
  | "onboardingFlow"
  | "formWizard"
  | "credentialPanel"
  | "feedbackSteps"
  | "audioShelf"
  | "galleryStage"
  | "episodeQueue"
  | "videoSpotlight";

type SeedComponent = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  changelog: string;
  categoryName: CategoryName;
  featured: boolean;
  seed: number;
  pattern: SeedPattern;
  swiftCodeOverride?: string;
  screenshotsOverride?: Array<{
    mediaType: "IMAGE" | "VIDEO";
    mimeType: string | null;
    url: string;
    storagePath: string;
    previewUrl?: string | null;
    previewStoragePath?: string | null;
    width?: number | null;
    height?: number | null;
    altText: string;
  }>;
  accessTypeOverride?: ComponentAccessType;
  sellerTargetPriceCentsOverride?: number | null;
  ownerIdOverride?: string;
};

type PortManifestItem = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  changelog: string;
  categoryName: CategoryName;
  featured: boolean;
  seed: number;
  pattern: SeedPattern;
  folderName: string;
  screenshots: {
    lightPath: string;
    darkPath: string;
  };
  swiftFile: string;
};

const sampleComponents: SeedComponent[] = [
  {
    slug: "aurora-tab-orbit",
    title: "Aurora Tab Orbit",
    summary: "A soft glass tab bar with floating active-state motion and capsule icons.",
    description:
      "Aurora Tab Orbit packages a SwiftUI tab bar with a polished frosted background, fluid selection movement, and a compact label system that works well for media or productivity apps.",
    changelog: "Initial release with glass blur and matched geometry active state.",
    categoryName: "Navigation",
    featured: true,
    seed: 1,
    pattern: "tabBarOrbit",
  },
  {
    slug: "harbor-metrics-deck",
    title: "Harbor Metrics Deck",
    summary: "A modular dashboard header with KPI strips, trend pills, and callout cards.",
    description:
      "Harbor Metrics Deck is designed for admin surfaces that need opinionated visual hierarchy, dense information, and a bright presentation inspired by editorial landing pages.",
    changelog: "Added secondary metric rail and responsive card stacking.",
    categoryName: "Dashboards",
    featured: true,
    seed: 2,
    pattern: "metricsDeck",
  },
  {
    slug: "linen-checkout-stack",
    title: "Linen Checkout Stack",
    summary: "A clean commerce checkout shell with step tracking and embedded order recap.",
    description:
      "Linen Checkout Stack blends structured summary cards, shipping selectors, and payment entry into a single SwiftUI composition aimed at bright storefront flows.",
    changelog: "Refined spacing and added alternate promo-code drawer.",
    categoryName: "Commerce",
    featured: false,
    seed: 3,
    pattern: "checkoutStack",
  },
  {
    slug: "pulse-profile-grid",
    title: "Pulse Profile Grid",
    summary: "A social profile surface with stats, pinned cards, and lively follow CTAs.",
    description:
      "Pulse Profile Grid brings together profile identity, post previews, and contextual action buttons in a single lightweight SwiftUI module.",
    changelog: "Added pinned-story badges and denser grid breakpoints.",
    categoryName: "Social",
    featured: false,
    seed: 4,
    pattern: "profileGrid",
  },
  {
    slug: "coda-onboarding-flow",
    title: "Coda Onboarding Flow",
    summary: "A multi-step onboarding experience with progress, illustrations, and trust copy.",
    description:
      "Coda Onboarding Flow is meant for product activation and auth-lite experiences, with spacious cards, progress feedback, and calm motion-driven affordances.",
    changelog: "First approved release.",
    categoryName: "Forms",
    featured: false,
    seed: 5,
    pattern: "onboardingFlow",
  },
  {
    slug: "ripple-audio-shelf",
    title: "Ripple Audio Shelf",
    summary: "An album shelf layout with floating controls, queue previews, and waveform accents.",
    description:
      "Ripple Audio Shelf is a brighter media component built for playlist surfaces, podcast pages, or gallery hybrids where previews matter.",
    changelog: "Introduced compact player mode and queue hover state.",
    categoryName: "Media",
    featured: false,
    seed: 6,
    pattern: "audioShelf",
  },
  {
    slug: "audio-trimmer",
    title: "Audio Trimmer",
    summary:
      "A waveform trimmer with draggable start/end handles and a precise playback cursor.",
    description:
      "Audio Trimmer is a focused SwiftUI editing surface for clipping voice notes and podcast moments with direct-manipulation controls and clear selection feedback.",
    changelog: "Seeded from production audio editor code with real media preview assets.",
    categoryName: "Media",
    featured: false,
    seed: 25,
    pattern: "audioShelf",
  },
  {
    slug: "revenue-card",
    title: "Revenue Trend Card",
    summary: "A compact revenue card with 30-day trend chart and growth indicator.",
    description:
      "Revenue Trend Card is a reusable dashboard component for analytics surfaces. It highlights headline revenue, 30-day movement, and a smooth trend chart in a compact card tuned for both light and dark contexts.",
    changelog: "Seeded from the research capture set with framed light and dark screenshots.",
    categoryName: "Dashboards",
    featured: false,
    seed: 29,
    pattern: "metricsDeck",
  },
  {
    slug: "atlas-sidebar-flow",
    title: "Atlas Sidebar Flow",
    summary: "A compact sidebar shell with floating sections, active chips, and roomy content framing.",
    description:
      "Atlas Sidebar Flow is built for iPad-sized workspaces where quick navigation and a bright content preview need to coexist without feeling heavy.",
    changelog: "Added compact quick-action footer and clearer selected-state treatment.",
    categoryName: "Navigation",
    featured: false,
    seed: 7,
    pattern: "sidebarFlow",
  },
  {
    slug: "halo-segmented-rail",
    title: "Halo Segmented Rail",
    summary: "A segmented top rail for filters and routes with spring motion and soft highlight pills.",
    description:
      "Halo Segmented Rail is a versatile route switcher for catalogue pages, dashboards, or social surfaces that need a clean editorial header.",
    changelog: "Updated card spacing and added brighter hover-style selection emphasis.",
    categoryName: "Navigation",
    featured: false,
    seed: 8,
    pattern: "segmentedRail",
  },
  {
    slug: "drift-command-sheet",
    title: "Drift Command Sheet",
    summary: "A command-style route switcher with recent destinations, status dots, and keyboard-first affordances.",
    description:
      "Drift Command Sheet adapts a command palette pattern into SwiftUI, pairing search, recent routes, and quick links inside a calm floating panel.",
    changelog: "Added recent-route grouping and improved destination badge hierarchy.",
    categoryName: "Navigation",
    featured: false,
    seed: 9,
    pattern: "commandSheet",
  },
  {
    slug: "beacon-ops-board",
    title: "Beacon Ops Board",
    summary: "A bright operations board with incident cards, SLA chips, and live team readiness markers.",
    description:
      "Beacon Ops Board focuses on operational visibility, pairing status modules with readable urgency treatment for support or reliability teams.",
    changelog: "Added response-owner cards and clearer escalation chips.",
    categoryName: "Dashboards",
    featured: false,
    seed: 10,
    pattern: "opsBoard",
  },
  {
    slug: "northstar-revenue-pulse",
    title: "Northstar Revenue Pulse",
    summary: "A revenue snapshot strip with channel cards, pacing badges, and weekly forecast callouts.",
    description:
      "Northstar Revenue Pulse gives growth teams a bright hero summary with quick comparisons across channels and a simple forecast lane.",
    changelog: "Tuned metric density and added pacing badge variants.",
    categoryName: "Dashboards",
    featured: false,
    seed: 11,
    pattern: "revenuePulse",
  },
  {
    slug: "delta-kpi-horizon",
    title: "Delta KPI Horizon",
    summary: "A wide KPI hero with stacked deltas, comparison rails, and editorial chart framing.",
    description:
      "Delta KPI Horizon is meant for top-of-dashboard summaries where one key number should lead without flattening the supporting trend context.",
    changelog: "Introduced stacked benchmark bars and softer trend-card gradients.",
    categoryName: "Dashboards",
    featured: false,
    seed: 12,
    pattern: "kpiHorizon",
  },
  {
    slug: "meridian-pricing-lens",
    title: "Meridian Pricing Lens",
    summary: "A pricing comparison layout with annual savings, plan toggles, and standout CTA emphasis.",
    description:
      "Meridian Pricing Lens is a bright multi-plan pricing module designed for SaaS surfaces that need quick scanning and a clear featured tier.",
    changelog: "Added annual toggle treatment and stronger featured-plan framing.",
    categoryName: "Commerce",
    featured: true,
    seed: 13,
    pattern: "pricingLens",
  },
  {
    slug: "orchard-product-spotlight",
    title: "Orchard Product Spotlight",
    summary: "A product feature panel with gallery thumbnails, detail chips, and sticky purchase actions.",
    description:
      "Orchard Product Spotlight combines large media, compact option selectors, and concise product facts in a bright commerce showcase.",
    changelog: "Refined thumbnail rhythm and added product detail chips.",
    categoryName: "Commerce",
    featured: false,
    seed: 14,
    pattern: "productSpotlight",
  },
  {
    slug: "parcel-upsell-drawer",
    title: "Parcel Upsell Drawer",
    summary: "A post-cart upsell drawer with bundle options, delivery promises, and compact quantity controls.",
    description:
      "Parcel Upsell Drawer is tuned for checkout-adjacent moments where a lightweight bundle offer should feel additive instead of disruptive.",
    changelog: "Added delivery reassurance copy and clearer bundle comparison cards.",
    categoryName: "Commerce",
    featured: false,
    seed: 15,
    pattern: "upsellDrawer",
  },
  {
    slug: "echo-creator-thread",
    title: "Echo Creator Thread",
    summary: "A creator feed card with post rhythm, mini analytics, and expressive reaction clusters.",
    description:
      "Echo Creator Thread blends content and engagement metadata into a single bright card flow that works for creator profiles or team updates.",
    changelog: "Added mini analytics rail and compact reaction grouping.",
    categoryName: "Social",
    featured: false,
    seed: 16,
    pattern: "creatorThread",
  },
  {
    slug: "mosaic-story-shelf",
    title: "Mosaic Story Shelf",
    summary: "A layered story shelf with circular covers, unread glows, and stacked caption cards.",
    description:
      "Mosaic Story Shelf is designed for photo-heavy products that need a polished bridge between ephemeral stories and curated highlight cards.",
    changelog: "Added unread ring gradients and denser caption spacing.",
    categoryName: "Social",
    featured: false,
    seed: 17,
    pattern: "storyShelf",
  },
  {
    slug: "orbit-community-banner",
    title: "Orbit Community Banner",
    summary: "A community header with member presence, event pills, and inviting join actions.",
    description:
      "Orbit Community Banner is a bright community landing header that balances belonging signals, upcoming events, and onboarding actions.",
    changelog: "Introduced event pills and member-presence avatars.",
    categoryName: "Social",
    featured: false,
    seed: 18,
    pattern: "communityBanner",
  },
  {
    slug: "prism-form-wizard",
    title: "Prism Form Wizard",
    summary: "A multi-step data wizard with progress anchors, context tips, and spacious field cards.",
    description:
      "Prism Form Wizard packages a lightweight onboarding or application flow with clear progress, step context, and bright card-based fields.",
    changelog: "Added step anchors and a cleaner summary sidebar.",
    categoryName: "Forms",
    featured: false,
    seed: 19,
    pattern: "formWizard",
  },
  {
    slug: "canvas-credential-panel",
    title: "Canvas Credential Panel",
    summary: "A login and passkey panel with trust badges, recovery paths, and calm field hierarchy.",
    description:
      "Canvas Credential Panel is built for auth surfaces that need immediate clarity, minimal friction, and gentle trust reinforcement.",
    changelog: "Added passkey emphasis and improved recovery-link rhythm.",
    categoryName: "Forms",
    featured: false,
    seed: 20,
    pattern: "credentialPanel",
  },
  {
    slug: "ember-feedback-steps",
    title: "Ember Feedback Steps",
    summary: "A guided feedback composer with category chips, response controls, and contextual prompts.",
    description:
      "Ember Feedback Steps helps products collect thoughtful qualitative feedback by structuring intent, sentiment, and details into a guided flow.",
    changelog: "Added chip states and clearer follow-up prompt grouping.",
    categoryName: "Forms",
    featured: false,
    seed: 21,
    pattern: "feedbackSteps",
  },
  {
    slug: "nova-gallery-stage",
    title: "Nova Gallery Stage",
    summary: "A gallery stage with featured media, thumbnail rails, and polished caption overlays.",
    description:
      "Nova Gallery Stage is a bright media browser that keeps the hero asset front-and-center while still surfacing quick context and selection.",
    changelog: "Improved thumbnail rhythm and softened caption overlay gradients.",
    categoryName: "Media",
    featured: true,
    seed: 22,
    pattern: "galleryStage",
  },
  {
    slug: "tidal-episode-queue",
    title: "Tidal Episode Queue",
    summary: "A podcast queue layout with episode progress, download states, and listening shortcuts.",
    description:
      "Tidal Episode Queue is designed for podcast and audiobook surfaces that need to show progress, queue priority, and offline readiness at a glance.",
    changelog: "Added compact download states and stronger now-playing emphasis.",
    categoryName: "Media",
    featured: false,
    seed: 23,
    pattern: "episodeQueue",
  },
  {
    slug: "frame-video-spotlight",
    title: "Frame Video Spotlight",
    summary: "A video feature module with hero playback art, chapter markers, and compact side recommendations.",
    description:
      "Frame Video Spotlight gives streaming and education apps a polished hero module for featured content with quick chapter access and secondary picks.",
    changelog: "Introduced chapter markers and refreshed side recommendation cards.",
    categoryName: "Media",
    featured: false,
    seed: 24,
    pattern: "videoSpotlight",
  },
  {
    slug: "quest-loadout-rack",
    title: "Quest Loadout Rack",
    summary: "A loadout shelf with weapon cards, quick swap controls, and inventory stat highlights.",
    description:
      "Quest Loadout Rack is built for RPG and action interfaces where players need to compare equipment quickly and adjust kits without losing context.",
    changelog: "Added rarity accents and compact swap-action affordances.",
    categoryName: "Gaming",
    featured: false,
    seed: 26,
    pattern: "audioShelf",
  },
  {
    slug: "arena-match-queue",
    title: "Arena Match Queue",
    summary: "A match queue list with team status, role chips, and ready-check emphasis.",
    description:
      "Arena Match Queue packages pre-game lobby states into a clear vertical flow, making queue progress and readiness easy to scan on mobile.",
    changelog: "Introduced role badges and stronger ready-state contrast.",
    categoryName: "Gaming",
    featured: false,
    seed: 27,
    pattern: "episodeQueue",
  },
  {
    slug: "boss-raid-spotlight",
    title: "Boss Raid Spotlight",
    summary: "A raid spotlight module with encounter preview, phase markers, and party action prompts.",
    description:
      "Boss Raid Spotlight focuses attention on upcoming encounters while keeping phase guidance and squad shortcuts visible in a compact game-ready layout.",
    changelog: "Added phase markers and condensed squad action cards.",
    categoryName: "Gaming",
    featured: false,
    seed: 28,
    pattern: "videoSpotlight",
  },
] as const;

async function loadPortComponentsFromSeedManifests() {
  const directory = path.join(process.cwd(), "prisma", "seed-code");
  let entries: Array<{ name: string; isFile: () => boolean }> = [];

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [] as SeedComponent[];
  }

  const manifestFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith("-port-components.json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const components: SeedComponent[] = [];

  for (const fileName of manifestFiles) {
    let manifest: PortManifestItem[];
    try {
      const rawManifest = await readFile(path.join(directory, fileName), "utf8");
      manifest = JSON.parse(rawManifest) as PortManifestItem[];
    } catch {
      continue;
    }

    for (const item of manifest) {
      const lightDimensions = await getImageDimensionsFromPublicPath(item.screenshots.lightPath);
      const darkDimensions = await getImageDimensionsFromPublicPath(item.screenshots.darkPath);

      components.push({
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        description: item.description,
        changelog: item.changelog,
        categoryName: item.categoryName,
        featured: item.featured,
        seed: item.seed,
        pattern: item.pattern,
        screenshotsOverride: [
          {
            mediaType: "IMAGE",
            mimeType: "image/png",
            url: `/${item.screenshots.lightPath}`,
            storagePath: item.screenshots.lightPath,
            previewUrl: `/${item.screenshots.lightPath}`,
            previewStoragePath: item.screenshots.lightPath,
            width: lightDimensions.width,
            height: lightDimensions.height,
            altText: `${item.title} light appearance`,
          },
          {
            mediaType: "IMAGE",
            mimeType: "image/png",
            url: `/${item.screenshots.darkPath}`,
            storagePath: item.screenshots.darkPath,
            previewUrl: `/${item.screenshots.darkPath}`,
            previewStoragePath: item.screenshots.darkPath,
            width: darkDimensions.width,
            height: darkDimensions.height,
            altText: `${item.title} dark appearance`,
          },
        ],
      });
    }
  }

  return components;
}

const relatedCategoryNamesBySlug = new Map<string, CategoryName[]>([
  ["harbor-metrics-deck", ["Commerce", "Paywall"]],
  ["linen-checkout-stack", ["Forms"]],
  ["pulse-profile-grid", ["Media", "Paywall"]],
  ["coda-onboarding-flow", ["Navigation"]],
  ["nova-gallery-stage", ["Social"]],
  ["meridian-pricing-lens", ["Dashboards", "Paywall"]],
  ["atlas-sidebar-flow", ["Paywall"]],
]);

const demoUsers = [
  {
    email: "creator@copymyui.dev",
    name: "Demo Creator",
    profileSlug: "demo-creator",
    role: UserRole.USER,
    image:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=80",
  },
  {
    email: "moderator@copymyui.dev",
    name: "Demo Moderator",
    profileSlug: "demo-moderator",
    role: UserRole.MODERATOR,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    email: "admin@copymyui.dev",
    name: "Demo Admin",
    profileSlug: "demo-admin",
    role: UserRole.ADMIN,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  },
  {
    email: "fan@copymyui.dev",
    name: "Demo Collector",
    profileSlug: "demo-collector",
    role: UserRole.USER,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
] as const;

const premiumPricingBySlug = new Map<string, number>([
  ["harbor-metrics-deck", 10000],
  ["meridian-pricing-lens", 12000],
  ["coda-onboarding-flow", 8500],
  ["nova-gallery-stage", 14000],
]);

const accentHexByCategory = new Map<CategoryName, string>([
  ["Navigation", "#F97316"],
  ["Dashboards", "#0EA5E9"],
  ["Commerce", "#22C55E"],
  ["Paywall", "#14B8A6"],
  ["Social", "#EC4899"],
  ["Forms", "#8B5CF6"],
  ["Media", "#EAB308"],
  ["Gaming", "#6366F1"],
]);

const swiftAccentByCategory = new Map<CategoryName, string>([
  ["Navigation", "Color.orange"],
  ["Dashboards", "Color.blue"],
  ["Commerce", "Color.green"],
  ["Paywall", "Color.teal"],
  ["Social", "Color.pink"],
  ["Forms", "Color.purple"],
  ["Media", "Color.yellow"],
  ["Gaming", "Color.indigo"],
]);

function swiftStructName(title: string) {
  return title.replace(/[^A-Za-z0-9]/g, "") || "CopyMyUIComponent";
}

function swiftAccent(categoryName: CategoryName) {
  return swiftAccentByCategory.get(categoryName) ?? "Color.orange";
}

function navigationSnippet(component: Pick<SeedComponent, "title" | "pattern" | "categoryName">) {
  const structName = swiftStructName(component.title);
  const accent = swiftAccent(component.categoryName);

  switch (component.pattern) {
    case "tabBarOrbit":
      return `import SwiftUI

struct ${structName}: View {
    @Namespace private var namespace
    @State private var selection = "Discover"

    private let accent = ${accent}
    private let items = ["Discover", "Updates", "Saved", "Profile"]

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            Text("${component.title}")
                .font(.system(size: 32, weight: .bold, design: .rounded))

            Text("A bright floating tab bar with soft glass layers and compact destination labels.")
                .foregroundStyle(.secondary)

            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [accent.opacity(0.26), .white],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 280)
                .overlay(alignment: .topLeading) {
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Live preview")
                            .font(.headline)
                        Text("Use the selected tab to reveal contextual content while keeping the shell lightweight.")
                            .foregroundStyle(.secondary)
                        Spacer()
                    }
                    .padding(24)
                }

            HStack(spacing: 10) {
                ForEach(items, id: \\.self) { item in
                    Button {
                        withAnimation(.spring(response: 0.34, dampingFraction: 0.78)) {
                            selection = item
                        }
                    } label: {
                        VStack(spacing: 8) {
                            Image(systemName: item == "Saved" ? "heart" : "circle.grid.2x2.fill")
                                .font(.system(size: 15, weight: .semibold))
                            Text(item)
                                .font(.system(size: 12, weight: .semibold, design: .rounded))
                        }
                        .foregroundStyle(selection == item ? accent : .primary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background {
                            if selection == item {
                                Capsule()
                                    .fill(accent.opacity(0.18))
                                    .matchedGeometryEffect(id: "selection", in: namespace)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(10)
            .background(.ultraThinMaterial, in: Capsule())
        }
        .padding(24)
        .background(Color(.systemBackground))
    }
}
`;
    case "sidebarFlow":
      return `import SwiftUI

struct ${structName}: View {
    @State private var selection = "Workspace"

    private let accent = ${accent}
    private let sections = ["Workspace", "Projects", "Inbox", "Settings"]

    var body: some View {
        HStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 16) {
                Text("${component.title}")
                    .font(.system(size: 26, weight: .bold, design: .rounded))

                Text("Compact route switching for bright editor or management layouts.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                ForEach(sections, id: \\.self) { section in
                    Button {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.82)) {
                            selection = section
                        }
                    } label: {
                        HStack(spacing: 12) {
                            Circle()
                                .fill(selection == section ? accent : accent.opacity(0.2))
                                .frame(width: 10, height: 10)
                            Text(section)
                                .font(.system(size: 15, weight: .semibold, design: .rounded))
                            Spacer()
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 12)
                        .background(selection == section ? accent.opacity(0.12) : Color.clear)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    }
                    .buttonStyle(.plain)
                }

                Spacer()

                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(accent.opacity(0.14))
                    .frame(height: 120)
                    .overlay(alignment: .leading) {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Quick action")
                                .font(.headline)
                            Text("Pin a frequent route or surface a compact call-to-action.")
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                        }
                        .padding(18)
                    }
            }
            .frame(width: 240)
            .padding(20)
            .background(.white, in: RoundedRectangle(cornerRadius: 30, style: .continuous))

            VStack(alignment: .leading, spacing: 18) {
                Text(selection)
                    .font(.system(size: 30, weight: .bold, design: .rounded))
                Text("The content panel stretches while the navigation rail remains compact and readable.")
                    .foregroundStyle(.secondary)

                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [accent.opacity(0.22), .white],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .overlay(alignment: .topLeading) {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Preview canvas")
                                .font(.headline)
                            Text("Let content breathe while actions stay close to the rail.")
                                .foregroundStyle(.secondary)
                        }
                        .padding(24)
                    }
            }
            .padding(24)
            .background(Color(.systemBackground), in: RoundedRectangle(cornerRadius: 30, style: .continuous))
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "segmentedRail":
      return `import SwiftUI

struct ${structName}: View {
    @Namespace private var namespace
    @State private var selection = "Overview"

    private let accent = ${accent}
    private let segments = ["Overview", "Trending", "Saved", "Following"]

    var body: some View {
        VStack(alignment: .leading, spacing: 22) {
            Text("${component.title}")
                .font(.system(size: 30, weight: .bold, design: .rounded))

            HStack(spacing: 8) {
                ForEach(segments, id: \\.self) { segment in
                    Button {
                        withAnimation(.spring(response: 0.32, dampingFraction: 0.8)) {
                            selection = segment
                        }
                    } label: {
                        Text(segment)
                            .font(.system(size: 14, weight: .semibold, design: .rounded))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 12)
                            .background {
                                if selection == segment {
                                    Capsule()
                                        .fill(accent.opacity(0.18))
                                        .matchedGeometryEffect(id: "segment", in: namespace)
                                }
                            }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(8)
            .background(Color.white, in: Capsule())

            VStack(spacing: 14) {
                ForEach(0..<3, id: \\.self) { index in
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .fill(index == 0 ? accent.opacity(0.18) : Color.white)
                        .frame(height: index == 0 ? 180 : 96)
                        .overlay(alignment: .leading) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(index == 0 ? selection : "Related panel \\(index)")
                                    .font(.headline)
                                Text("Segmented navigation keeps dense content bright and easy to scan.")
                                    .foregroundStyle(.secondary)
                            }
                            .padding(20)
                        }
                }
            }
        }
        .padding(24)
        .background(
            LinearGradient(
                colors: [accent.opacity(0.12), Color(.systemBackground)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}
`;
    case "commandSheet":
      return `import SwiftUI

struct ${structName}: View {
    @State private var query = ""

    private let accent = ${accent}
    private let commands = [
        "Open billing settings",
        "Jump to design assets",
        "Review moderation queue",
        "Create a new component"
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("${component.title}")
                .font(.system(size: 30, weight: .bold, design: .rounded))

            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Color.white)
                .frame(height: 64)
                .overlay {
                    HStack(spacing: 12) {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(accent)
                        TextField("Search commands or destinations", text: $query)
                    }
                    .padding(.horizontal, 18)
                }

            VStack(spacing: 12) {
                ForEach(commands, id: \\.self) { command in
                    HStack(spacing: 14) {
                        Circle()
                            .fill(accent.opacity(0.18))
                            .frame(width: 36, height: 36)
                            .overlay {
                                Image(systemName: "sparkles")
                                    .foregroundStyle(accent)
                            }
                        VStack(alignment: .leading, spacing: 4) {
                            Text(command)
                                .font(.system(size: 15, weight: .semibold, design: .rounded))
                            Text("Recent destination")
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text("⌘K")
                            .font(.footnote.monospaced())
                            .foregroundStyle(.secondary)
                    }
                    .padding(16)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                }
            }
        }
        .padding(24)
        .background(accent.opacity(0.08))
    }
}
`;
    default:
      return "";
  }
}

function dashboardSnippet(component: Pick<SeedComponent, "title" | "pattern" | "categoryName">) {
  const structName = swiftStructName(component.title);
  const accent = swiftAccent(component.categoryName);

  switch (component.pattern) {
    case "metricsDeck":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}
    private let metrics = [("ARR", "$2.8M"), ("Win rate", "34%"), ("Retention", "91%")]

    var body: some View {
        VStack(alignment: .leading, spacing: 22) {
            Text("${component.title}")
                .font(.system(size: 32, weight: .bold, design: .rounded))

            HStack(spacing: 14) {
                ForEach(metrics, id: \\.0) { metric in
                    VStack(alignment: .leading, spacing: 10) {
                        Text(metric.0)
                            .font(.footnote.weight(.semibold))
                            .foregroundStyle(.secondary)
                        Text(metric.1)
                            .font(.system(size: 28, weight: .bold, design: .rounded))
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(18)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
                }
            }

            RoundedRectangle(cornerRadius: 32, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [accent.opacity(0.24), .white],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 280)
                .overlay(alignment: .topLeading) {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Primary insight")
                            .font(.headline)
                        Text("Use a large editorial hero for the leading metric, then tuck supporting trend cards underneath.")
                            .foregroundStyle(.secondary)
                    }
                    .padding(24)
                }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "opsBoard":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}
    private let incidents = ["API latency", "Checkout retry spike", "Moderation backlog"]

    var body: some View {
        HStack(spacing: 18) {
            VStack(alignment: .leading, spacing: 16) {
                Text("${component.title}")
                    .font(.system(size: 30, weight: .bold, design: .rounded))

                ForEach(incidents, id: \\.self) { incident in
                    HStack {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(incident)
                                .font(.headline)
                            Text("Needs owner confirmation in the next 15 minutes.")
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text("P1")
                            .font(.footnote.weight(.bold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(accent.opacity(0.16), in: Capsule())
                    }
                    .padding(16)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            VStack(alignment: .leading, spacing: 16) {
                Text("Team readiness")
                    .font(.headline)
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .fill(accent.opacity(0.18))
                    .frame(height: 180)
                    .overlay {
                        VStack(spacing: 10) {
                            Text("94%")
                                .font(.system(size: 42, weight: .bold, design: .rounded))
                            Text("Rotation coverage")
                                .foregroundStyle(.secondary)
                        }
                    }

                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .fill(Color.white)
                    .frame(height: 132)
                    .overlay(alignment: .leading) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Escalation lane")
                                .font(.headline)
                            Text("Keep the secondary control block calm and readable.")
                                .foregroundStyle(.secondary)
                        }
                        .padding(18)
                    }
            }
            .frame(width: 260)
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "revenuePulse":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}
    private let channels = [("Direct", "$184K"), ("Partners", "$96K"), ("Upsell", "$63K")]

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("${component.title}")
                .font(.system(size: 30, weight: .bold, design: .rounded))

            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(accent.opacity(0.18))
                .frame(height: 180)
                .overlay(alignment: .leading) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("$342K")
                            .font(.system(size: 42, weight: .bold, design: .rounded))
                        Text("Weekly pace • up 12% from last week")
                            .foregroundStyle(.secondary)
                    }
                    .padding(24)
                }

            HStack(spacing: 14) {
                ForEach(channels, id: \\.0) { channel in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(channel.0)
                            .font(.footnote.weight(.semibold))
                            .foregroundStyle(.secondary)
                        Text(channel.1)
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                        Text("Forecast on track")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(18)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
                }
            }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "kpiHorizon":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}
    private let bars: [CGFloat] = [0.24, 0.48, 0.61, 0.72, 0.54, 0.86]

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("${component.title}")
                .font(.system(size: 30, weight: .bold, design: .rounded))

            HStack(alignment: .bottom, spacing: 18) {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Conversion")
                        .font(.headline)
                    Text("18.4%")
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                    Text("Compared with last 30 days")
                        .foregroundStyle(.secondary)
                }

                Spacer()

                HStack(alignment: .bottom, spacing: 10) {
                    ForEach(Array(bars.enumerated()), id: \\.offset) { index, bar in
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(index == bars.count - 1 ? accent : accent.opacity(0.18))
                            .frame(width: 24, height: 160 * bar + 24)
                    }
                }
            }
            .padding(24)
            .background(Color.white, in: RoundedRectangle(cornerRadius: 30, style: .continuous))

            HStack(spacing: 14) {
                ForEach(["Benchmark", "Target", "Actual"], id: \\.self) { label in
                    Text(label)
                        .font(.footnote.weight(.semibold))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(accent.opacity(0.12), in: Capsule())
                }
            }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    default:
      return "";
  }
}

function commerceSnippet(component: Pick<SeedComponent, "title" | "pattern" | "categoryName">) {
  const structName = swiftStructName(component.title);
  const accent = swiftAccent(component.categoryName);

  switch (component.pattern) {
    case "checkoutStack":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}

    var body: some View {
        HStack(spacing: 18) {
            VStack(alignment: .leading, spacing: 16) {
                Text("${component.title}")
                    .font(.system(size: 30, weight: .bold, design: .rounded))

                ForEach(["Shipping details", "Payment method", "Delivery note"], id: \\.self) { section in
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .fill(Color.white)
                        .frame(height: 92)
                        .overlay(alignment: .leading) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(section)
                                    .font(.headline)
                                Text("Bright fields and compact helper text keep the flow moving.")
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(18)
                        }
                }
            }

            VStack(alignment: .leading, spacing: 14) {
                Text("Order recap")
                    .font(.headline)
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .fill(accent.opacity(0.16))
                    .frame(height: 220)
                    .overlay(alignment: .topLeading) {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("$248.00")
                                .font(.system(size: 36, weight: .bold, design: .rounded))
                            Text("Estimated total")
                                .foregroundStyle(.secondary)
                        }
                        .padding(20)
                    }
            }
            .frame(width: 260)
            .padding(18)
            .background(Color.white, in: RoundedRectangle(cornerRadius: 30, style: .continuous))
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "pricingLens":
      return `import SwiftUI

struct ${structName}: View {
    @State private var annual = true

    private let accent = ${accent}
    private let plans = ["Starter", "Scale", "Enterprise"]

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            HStack {
                Text("${component.title}")
                    .font(.system(size: 30, weight: .bold, design: .rounded))
                Spacer()
                Toggle("Annual", isOn: $annual)
                    .toggleStyle(.switch)
                    .labelsHidden()
            }

            HStack(spacing: 14) {
                ForEach(plans, id: \\.self) { plan in
                    VStack(alignment: .leading, spacing: 10) {
                        Text(plan)
                            .font(.headline)
                        Text(plan == "Scale" ? "$42" : plan == "Starter" ? "$16" : "Custom")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                        Text(annual ? "per seat / billed annually" : "per seat / billed monthly")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                        Spacer()
                        Text(plan == "Scale" ? "Recommended" : "Explore")
                            .font(.footnote.weight(.semibold))
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(plan == "Scale" ? accent.opacity(0.18) : Color.black.opacity(0.05), in: Capsule())
                    }
                    .frame(maxWidth: .infinity, minHeight: 240, alignment: .leading)
                    .padding(20)
                    .background(
                        plan == "Scale" ? accent.opacity(0.12) : Color.white,
                        in: RoundedRectangle(cornerRadius: 28, style: .continuous)
                    )
                }
            }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "productSpotlight":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}
    private let swatches = [Color.orange, Color.pink, Color.blue]

    var body: some View {
        HStack(spacing: 18) {
            RoundedRectangle(cornerRadius: 32, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [accent.opacity(0.22), .white],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 320, height: 360)
                .overlay(alignment: .bottomLeading) {
                    Text("${component.title}")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .padding(22)
                }

            VStack(alignment: .leading, spacing: 16) {
                Text("Lightweight product showcase")
                    .font(.headline)
                Text("Feature key details, variants, and a calm purchase action without overwhelming the content.")
                    .foregroundStyle(.secondary)

                HStack(spacing: 10) {
                    ForEach(swatches, id: \\.description) { swatch in
                        Circle()
                            .fill(swatch)
                            .frame(width: 28, height: 28)
                    }
                }

                VStack(spacing: 12) {
                    ForEach(["Full-grain texture", "Two-day delivery", "Easy returns"], id: \\.self) { item in
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(accent)
                            Text(item)
                            Spacer()
                        }
                        .padding(14)
                        .background(Color.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                    }
                }

                Spacer()

                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(accent)
                    .frame(height: 54)
                    .overlay {
                        Text("Add to cart")
                            .foregroundStyle(.white)
                            .font(.headline)
                    }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(18)
            .background(Color.white, in: RoundedRectangle(cornerRadius: 30, style: .continuous))
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "upsellDrawer":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}
    private let bundles = [("Travel set", "$18"), ("Care kit", "$12"), ("Gift wrap", "$6")]

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("${component.title}")
                .font(.system(size: 30, weight: .bold, design: .rounded))

            Text("Use a bright drawer to surface one or two highly relevant add-ons after cart review.")
                .foregroundStyle(.secondary)

            VStack(spacing: 12) {
                ForEach(bundles, id: \\.0) { bundle in
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(bundle.0)
                                .font(.headline)
                            Text("Ships with your main order")
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text(bundle.1)
                            .font(.headline)
                    }
                    .padding(16)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                }
            }

            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(accent.opacity(0.18))
                .frame(height: 84)
                .overlay(alignment: .leading) {
                    HStack {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Bundle all three")
                                .font(.headline)
                            Text("Save 18% when added now")
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text("Add")
                            .font(.headline)
                    }
                    .padding(18)
                }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    default:
      return "";
  }
}

function socialSnippet(component: Pick<SeedComponent, "title" | "pattern" | "categoryName">) {
  const structName = swiftStructName(component.title);
  const accent = swiftAccent(component.categoryName);

  switch (component.pattern) {
    case "profileGrid":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            HStack(spacing: 16) {
                Circle()
                    .fill(accent.opacity(0.18))
                    .frame(width: 84, height: 84)
                    .overlay {
                        Text("CM")
                            .font(.headline)
                    }

                VStack(alignment: .leading, spacing: 8) {
                    Text("${component.title}")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                    Text("12.4K followers • 214 posts")
                        .foregroundStyle(.secondary)
                }

                Spacer()

                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(accent)
                    .frame(width: 104, height: 44)
                    .overlay {
                        Text("Follow")
                            .foregroundStyle(.white)
                            .font(.headline)
                    }
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 14) {
                ForEach(0..<4, id: \\.self) { index in
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .fill(index == 0 ? accent.opacity(0.18) : Color.white)
                        .frame(height: index == 0 ? 180 : 120)
                }
            }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "creatorThread":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}
    private let posts = ["Launch notes", "Behind the scenes", "Community prompt"]

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("${component.title}")
                .font(.system(size: 30, weight: .bold, design: .rounded))

            ForEach(posts, id: \\.self) { post in
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Circle()
                            .fill(accent.opacity(0.18))
                            .frame(width: 42, height: 42)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(post)
                                .font(.headline)
                            Text("Shared 2 hours ago")
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                    }

                    Text("Pair social proof with compact analytics so creator surfaces feel alive without losing readability.")
                        .foregroundStyle(.secondary)

                    HStack(spacing: 14) {
                        Label("128", systemImage: "heart")
                        Label("42", systemImage: "arrowshape.turn.up.right")
                        Label("19", systemImage: "message")
                    }
                    .font(.footnote.weight(.semibold))
                }
                .padding(18)
                .background(Color.white, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
            }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "storyShelf":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}
    private let stories = ["Alex", "Maya", "Jon", "Rina", "Kai"]

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("${component.title}")
                .font(.system(size: 30, weight: .bold, design: .rounded))

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(stories, id: \\.self) { story in
                        VStack(spacing: 10) {
                            Circle()
                                .strokeBorder(
                                    LinearGradient(
                                        colors: [accent, accent.opacity(0.3)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    ),
                                    lineWidth: 3
                                )
                                .frame(width: 72, height: 72)
                                .overlay {
                                    Circle()
                                        .fill(accent.opacity(0.16))
                                        .padding(6)
                                }
                            Text(story)
                                .font(.footnote.weight(.semibold))
                        }
                    }
                }
            }

            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(Color.white)
                .frame(height: 220)
                .overlay(alignment: .bottomLeading) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Curated highlight")
                            .font(.headline)
                        Text("Combine ephemeral circles with a larger story card below for variety.")
                            .foregroundStyle(.secondary)
                    }
                    .padding(20)
                }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "communityBanner":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}
    private let events = ["Design critique", "Weekly ship", "Office hours"]

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            RoundedRectangle(cornerRadius: 32, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [accent.opacity(0.24), .white],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 220)
                .overlay(alignment: .topLeading) {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("${component.title}")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                        Text("Invite new members while surfacing upcoming moments that make the community feel active.")
                            .foregroundStyle(.secondary)
                    }
                    .padding(24)
                }

            HStack(spacing: 14) {
                ForEach(events, id: \\.self) { event in
                    Text(event)
                        .font(.footnote.weight(.semibold))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(Color.white, in: Capsule())
                }
            }

            HStack {
                Text("1,248 members online this week")
                    .foregroundStyle(.secondary)
                Spacer()
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(accent)
                    .frame(width: 122, height: 44)
                    .overlay {
                        Text("Join now")
                            .foregroundStyle(.white)
                            .font(.headline)
                    }
            }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    default:
      return "";
  }
}

function formsSnippet(component: Pick<SeedComponent, "title" | "pattern" | "categoryName">) {
  const structName = swiftStructName(component.title);
  const accent = swiftAccent(component.categoryName);

  switch (component.pattern) {
    case "onboardingFlow":
      return `import SwiftUI

struct ${structName}: View {
    @State private var step = 1

    private let accent = ${accent}

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("${component.title}")
                .font(.system(size: 30, weight: .bold, design: .rounded))

            HStack(spacing: 8) {
                ForEach(1..<4, id: \\.self) { index in
                    Capsule()
                        .fill(index <= step ? accent : accent.opacity(0.16))
                        .frame(height: 8)
                }
            }

            RoundedRectangle(cornerRadius: 32, style: .continuous)
                .fill(Color.white)
                .frame(height: 320)
                .overlay(alignment: .topLeading) {
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Step \\(step)")
                            .font(.headline)
                        Text("Guide users with one idea per screen, generous spacing, and a bright supportive illustration block.")
                            .foregroundStyle(.secondary)
                        Spacer()
                        Button {
                            withAnimation(.spring(response: 0.34, dampingFraction: 0.82)) {
                                step = min(step + 1, 3)
                            }
                        } label: {
                            Text("Continue")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(accent, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                                .foregroundStyle(.white)
                        }
                    }
                    .padding(24)
                }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "formWizard":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}

    var body: some View {
        HStack(spacing: 18) {
            VStack(alignment: .leading, spacing: 16) {
                Text("${component.title}")
                    .font(.system(size: 30, weight: .bold, design: .rounded))

                ForEach(["Company name", "Team size", "Primary goal"], id: \\.self) { field in
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .fill(Color.white)
                        .frame(height: 76)
                        .overlay(alignment: .leading) {
                            Text(field)
                                .padding(.horizontal, 18)
                                .foregroundStyle(.secondary)
                        }
                }
            }

            VStack(alignment: .leading, spacing: 16) {
                Text("Progress")
                    .font(.headline)

                ForEach(["Basics", "Preferences", "Review"], id: \\.self) { step in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(step)
                            .font(.footnote.weight(.semibold))
                        Capsule()
                            .fill(step == "Basics" ? accent : accent.opacity(0.14))
                            .frame(height: 8)
                    }
                }

                Spacer()

                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(accent.opacity(0.16))
                    .frame(height: 96)
                    .overlay(alignment: .leading) {
                        Text("Context tip")
                            .font(.headline)
                            .padding(.horizontal, 18)
                    }
            }
            .frame(width: 240)
            .padding(18)
            .background(Color.white, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "credentialPanel":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("${component.title}")
                .font(.system(size: 30, weight: .bold, design: .rounded))

            VStack(spacing: 12) {
                ForEach(["Email address", "Password"], id: \\.self) { field in
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .fill(Color.white)
                        .frame(height: 64)
                        .overlay(alignment: .leading) {
                            Text(field)
                                .padding(.horizontal, 18)
                                .foregroundStyle(.secondary)
                        }
                }
            }

            HStack(spacing: 12) {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(accent)
                    .frame(height: 50)
                    .overlay {
                        Text("Continue")
                            .foregroundStyle(.white)
                            .font(.headline)
                    }

                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(Color.white)
                    .frame(height: 50)
                    .overlay {
                        Label("Use passkey", systemImage: "faceid")
                            .font(.headline)
                    }
            }

            HStack(spacing: 12) {
                ForEach(["Encrypted", "SOC2", "Recovery path"], id: \\.self) { badge in
                    Text(badge)
                        .font(.footnote.weight(.semibold))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(accent.opacity(0.12), in: Capsule())
                }
            }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "feedbackSteps":
      return `import SwiftUI

struct ${structName}: View {
    @State private var selection = "UX"

    private let accent = ${accent}
    private let categories = ["UX", "Performance", "Content", "Bug"]

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("${component.title}")
                .font(.system(size: 30, weight: .bold, design: .rounded))

            HStack(spacing: 10) {
                ForEach(categories, id: \\.self) { category in
                    Text(category)
                        .font(.footnote.weight(.semibold))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(selection == category ? accent.opacity(0.18) : Color.white, in: Capsule())
                        .onTapGesture {
                            selection = category
                        }
                }
            }

            HStack(spacing: 8) {
                ForEach(0..<5, id: \\.self) { index in
                    Image(systemName: index < 4 ? "star.fill" : "star")
                        .foregroundStyle(accent)
                }
            }
            .font(.title3)

            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .fill(Color.white)
                .frame(height: 180)
                .overlay(alignment: .topLeading) {
                    Text("Tell us what felt easy, what felt unclear, and what you expected to happen next.")
                        .padding(18)
                        .foregroundStyle(.secondary)
                }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    default:
      return "";
  }
}

function mediaSnippet(component: Pick<SeedComponent, "title" | "pattern" | "categoryName">) {
  const structName = swiftStructName(component.title);
  const accent = swiftAccent(component.categoryName);

  switch (component.pattern) {
    case "audioShelf":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}
    private let tracks = ["Golden Hour", "Night Shift", "Blue Line"]

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(spacing: 18) {
                RoundedRectangle(cornerRadius: 30, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [accent.opacity(0.28), .white],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 180, height: 180)

                VStack(alignment: .leading, spacing: 10) {
                    Text("${component.title}")
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                    Text("Curate a bright album shelf with compact controls and a simple track list.")
                        .foregroundStyle(.secondary)

                    HStack(spacing: 10) {
                        ForEach(["backward.fill", "play.fill", "forward.fill"], id: \\.self) { icon in
                            Circle()
                                .fill(icon == "play.fill" ? accent : accent.opacity(0.14))
                                .frame(width: 42, height: 42)
                                .overlay {
                                    Image(systemName: icon)
                                        .foregroundStyle(icon == "play.fill" ? .white : accent)
                                }
                        }
                    }
                }
            }

            VStack(spacing: 12) {
                ForEach(tracks, id: \\.self) { track in
                    HStack {
                        Text(track)
                            .font(.headline)
                        Spacer()
                        Text("3:42")
                            .foregroundStyle(.secondary)
                    }
                    .padding(14)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                }
            }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "galleryStage":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("${component.title}")
                .font(.system(size: 30, weight: .bold, design: .rounded))

            RoundedRectangle(cornerRadius: 32, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [accent.opacity(0.18), .white],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 300)
                .overlay(alignment: .bottomLeading) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Featured capture")
                            .font(.headline)
                        Text("Keep captions light and push supporting thumbnails beneath the stage.")
                            .foregroundStyle(.secondary)
                    }
                    .padding(20)
                }

            HStack(spacing: 12) {
                ForEach(0..<4, id: \\.self) { _ in
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .fill(Color.white)
                        .frame(height: 84)
                }
            }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "episodeQueue":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}
    private let episodes = ["Designing for focus", "The async state update", "Ship week recap"]

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(accent.opacity(0.16))
                .frame(height: 170)
                .overlay(alignment: .leading) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("${component.title}")
                            .font(.system(size: 30, weight: .bold, design: .rounded))
                        Text("Now playing • 18 min left")
                            .foregroundStyle(.secondary)
                    }
                    .padding(20)
                }

            ForEach(episodes, id: \\.self) { episode in
                HStack(spacing: 14) {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(Color.white)
                        .frame(width: 56, height: 56)
                    VStack(alignment: .leading, spacing: 4) {
                        Text(episode)
                            .font(.headline)
                        Text("Downloaded • 42 min")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Circle()
                        .fill(accent.opacity(0.16))
                        .frame(width: 34, height: 34)
                        .overlay {
                            Image(systemName: "play.fill")
                                .foregroundStyle(accent)
                        }
                }
                .padding(14)
                .background(Color.white, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            }
        }
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    case "videoSpotlight":
      return `import SwiftUI

struct ${structName}: View {
    private let accent = ${accent}
    private let chapters = ["Intro", "Setup", "Walkthrough", "Takeaways"]

    var body: some View {
        HStack(spacing: 18) {
            RoundedRectangle(cornerRadius: 32, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [.black.opacity(0.76), accent.opacity(0.32)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .overlay {
                    Image(systemName: "play.circle.fill")
                        .font(.system(size: 54))
                        .foregroundStyle(.white)
                }

            VStack(alignment: .leading, spacing: 14) {
                Text("${component.title}")
                    .font(.system(size: 28, weight: .bold, design: .rounded))

                ForEach(chapters, id: \\.self) { chapter in
                    HStack {
                        Text(chapter)
                            .font(.headline)
                        Spacer()
                        Text("04:12")
                            .foregroundStyle(.secondary)
                    }
                    .padding(14)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                }
            }
            .frame(width: 260)
        }
        .frame(height: 320)
        .padding(24)
        .background(Color(.systemGroupedBackground))
    }
}
`;
    default:
      return "";
  }
}

function swiftCodeSnippet(component: Pick<SeedComponent, "title" | "pattern" | "categoryName">) {
  switch (component.categoryName) {
    case "Navigation":
      return navigationSnippet(component);
    case "Dashboards":
      return dashboardSnippet(component);
    case "Commerce":
      return commerceSnippet(component);
    case "Paywall":
      return commerceSnippet(component);
    case "Social":
      return socialSnippet(component);
    case "Forms":
      return formsSnippet(component);
    case "Media":
      return mediaSnippet(component);
    case "Gaming":
      return mediaSnippet(component);
  }
}

async function createScreenshotAsset(slug: string, title: string, accent: string) {
  const directory = path.join(process.cwd(), "public", "seed-screenshots");
  await mkdir(directory, { recursive: true });

  const fullWidth = 1080;
  const fullHeight = 2142;
  const previewWidth = 768;
  const previewHeight = 1524;
  const svgPath = path.join(directory, `${slug}.svg`);
  const fullJpegPath = path.join(directory, `${slug}-full.jpg`);
  const previewJpegPath = path.join(directory, `${slug}-preview.jpg`);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${fullWidth}" height="${fullHeight}" viewBox="0 0 ${fullWidth} ${fullHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${fullWidth}" y2="${fullHeight}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFF9ED"/>
      <stop offset="0.5" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="${accent}22"/>
    </linearGradient>
    <linearGradient id="card" x1="96" y1="160" x2="984" y2="1970" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#F8F5EF"/>
    </linearGradient>
  </defs>
  <rect width="${fullWidth}" height="${fullHeight}" rx="64" fill="url(#bg)"/>
  <circle cx="900" cy="240" r="190" fill="${accent}20"/>
  <circle cx="180" cy="1880" r="240" fill="${accent}14"/>
  <rect x="74" y="156" width="932" height="1830" rx="56" fill="url(#card)" stroke="#E5DDD1" stroke-width="2"/>
  <rect x="130" y="222" width="280" height="36" rx="18" fill="${accent}18"/>
  <text x="130" y="338" fill="#191615" font-family="Arial, sans-serif" font-size="58" font-weight="700">${title}</text>
  <text x="130" y="396" fill="#6F645A" font-family="Arial, sans-serif" font-size="26">SwiftUI component preview generated by the CopyMyUI seed.</text>
  <rect x="130" y="446" width="820" height="560" rx="38" fill="#FFF" stroke="#EFE6DB"/>
  <rect x="174" y="508" width="612" height="28" rx="14" fill="${accent}2A"/>
  <rect x="174" y="558" width="520" height="20" rx="10" fill="#EDE2D6"/>
  <rect x="174" y="596" width="446" height="20" rx="10" fill="#EDE2D6"/>
  <rect x="174" y="648" width="732" height="280" rx="30" fill="${accent}12" stroke="${accent}36"/>
  <rect x="130" y="1042" width="820" height="400" rx="36" fill="#FCFAF6" stroke="#EFE6DB"/>
  <rect x="130" y="1476" width="820" height="426" rx="36" fill="#FFF" stroke="#EFE6DB"/>
  <rect x="174" y="1102" width="208" height="20" rx="10" fill="${accent}30"/>
  <rect x="174" y="1140" width="492" height="18" rx="9" fill="#EDE2D6"/>
  <rect x="174" y="1172" width="434" height="18" rx="9" fill="#EDE2D6"/>
  <rect x="174" y="1222" width="732" height="166" rx="26" fill="${accent}10"/>
  <rect x="174" y="1548" width="256" height="24" rx="12" fill="${accent}2C"/>
  <rect x="174" y="1596" width="602" height="18" rx="9" fill="#EDE2D6"/>
  <rect x="174" y="1630" width="548" height="18" rx="9" fill="#EDE2D6"/>
  <rect x="174" y="1680" width="732" height="172" rx="28" fill="#F7F2EA"/>
</svg>`;

  await writeFile(svgPath, svg, "utf8");

  const svgBuffer = Buffer.from(svg);
  const [fullJpeg, previewJpeg] = await Promise.all([
    sharp(svgBuffer)
      .resize({
        width: fullWidth,
        height: fullHeight,
        fit: "cover",
      })
      .jpeg({
        quality: 90,
        chromaSubsampling: "4:4:4",
        mozjpeg: true,
      })
      .toBuffer(),
    sharp(svgBuffer)
      .resize({
        width: previewWidth,
        height: previewHeight,
        fit: "cover",
      })
      .jpeg({
        quality: 72,
        mozjpeg: true,
      })
      .toBuffer(),
  ]);

  await Promise.all([
    writeFile(fullJpegPath, fullJpeg),
    writeFile(previewJpegPath, previewJpeg),
  ]);

  return {
    mediaType: "IMAGE" as const,
    mimeType: "image/jpeg",
    url: `/seed-screenshots/${slug}-full.jpg`,
    storagePath: `seed-screenshots/${slug}-full.jpg`,
    previewUrl: `/seed-screenshots/${slug}-preview.jpg`,
    previewStoragePath: `seed-screenshots/${slug}-preview.jpg`,
    width: fullWidth,
    height: fullHeight,
    altText: `${title} preview`,
  };
}

async function getImageDimensionsFromPublicPath(relativeStoragePath: string) {
  const absolutePath = path.join(process.cwd(), "public", relativeStoragePath);
  const metadata = await sharp(absolutePath).metadata();

  return {
    width: metadata.width ?? null,
    height: metadata.height ?? null,
  };
}

async function getVideoDimensionsFromPublicPath(relativeStoragePath: string) {
  const absolutePath = path.join(process.cwd(), "public", relativeStoragePath);

  try {
    const { stdout } = await execFileAsync(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-of",
        "json",
        absolutePath,
      ],
      { timeout: 5000 }
    );

    const parsed = JSON.parse(stdout) as {
      streams?: Array<{ width?: number; height?: number }>;
    };
    const stream = parsed.streams?.[0];

    return {
      width: Number.isFinite(stream?.width) ? Number(stream?.width) : null,
      height: Number.isFinite(stream?.height) ? Number(stream?.height) : null,
    };
  } catch {
    return {
      width: null,
      height: null,
    };
  }
}

async function cleanupSeedScreenshotAssets() {
  const directory = path.join(process.cwd(), "public", "seed-screenshots");
  await mkdir(directory, { recursive: true });

  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.isFile()) {
        return;
      }

      const fileName = entry.name;
      const isGeneratedSvg = fileName.endsWith(".svg");
      const isGeneratedJpeg =
        fileName.endsWith("-full.jpg") || fileName.endsWith("-preview.jpg");
      const isAudioTrimmerAsset =
        fileName === "audio-trimmer-full.jpg" || fileName === "audio-trimmer-preview.jpg";

      if ((isGeneratedSvg || isGeneratedJpeg) && !isAudioTrimmerAsset) {
        await unlink(path.join(directory, fileName));
      }
    })
  );
}

async function loadSeedCodeBySlug() {
  const directory = path.join(process.cwd(), "prisma", "seed-code");
  const entries = await readdir(directory, { withFileTypes: true });
  const codeBySlug = new Map<string, string>();

  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.isFile() || !entry.name.endsWith(".swift")) {
        return;
      }

      const slug = entry.name.replace(/\.swift$/, "");
      const source = await readFile(path.join(directory, entry.name), "utf8");
      codeBySlug.set(slug, source);
    })
  );

  return codeBySlug;
}

async function main() {
  await cleanupSeedScreenshotAssets();

  await prisma.$transaction([
    prisma.platformConfig.deleteMany(),
    prisma.componentPurchase.deleteMany(),
    prisma.apiKey.deleteMany(),
    prisma.moderationLog.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.revisionScreenshot.deleteMany(),
    prisma.componentRevision.deleteMany(),
    prisma.componentCategory.deleteMany(),
    prisma.component.deleteMany(),
    prisma.categoryTranslation.deleteMany(),
    prisma.category.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const categoryByName = new Map<string, { id: string; accent: string }>();
  const seedCodeBySlug = await loadSeedCodeBySlug();
  const portComponents = await loadPortComponentsFromSeedManifests();
  const audioTrimmerImageDimensions = await getImageDimensionsFromPublicPath(
    "seed-screenshots/audio-trimmer-full.jpg"
  );
  const revenueCardLightDimensions = await getImageDimensionsFromPublicPath(
    "components/001-revenue-card/light.png"
  );
  const revenueCardDarkDimensions = await getImageDimensionsFromPublicPath(
    "components/001-revenue-card/dark.png"
  );
  const audioTrimmerVideoDimensions = await getVideoDimensionsFromPublicPath(
    "seed-videos/audio-trimmer.mp4"
  );
  const preservedSeedComponentSlugs = new Set([
    "audio-trimmer",
    "revenue-card",
    ...portComponents.map((component) => component.slug),
  ]);
  const preservedSeedComponents = [
    ...sampleComponents.filter((component) =>
      preservedSeedComponentSlugs.has(component.slug)
    ),
    ...portComponents,
  ];
  const publicSeedComponents = preservedSeedComponents;

  for (const category of categories) {
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: slugify(category.name, { lower: true, strict: true }),
        description: category.description,
        accent: category.accent,
        translations: {
          create: {
            locale: "en",
            name: category.name,
            description: category.description,
          },
        },
      },
    });

    categoryByName.set(category.name, {
      id: created.id,
      accent: accentHexByCategory.get(category.name) ?? "#F59E0B",
    });
  }

  const users = new Map<string, { id: string; role: UserRole }>();

  for (const user of demoUsers) {
    const created = await prisma.user.create({ data: user });
    users.set(user.email, { id: created.id, role: created.role });
  }

  const creatorId = users.get("creator@copymyui.dev")!.id;
  const moderatorId = users.get("moderator@copymyui.dev")!.id;
  const adminId = users.get("admin@copymyui.dev")!.id;
  const fanId = users.get("fan@copymyui.dev")!.id;
  const publishedOwnerId = creatorId;

  await prisma.platformConfig.create({
    data: {
      id: 1,
      premiumMarkupPercent: 35,
      updatedById: adminId,
    },
  });

  for (const component of publicSeedComponents) {
    const category = categoryByName.get(component.categoryName)!;
    const screenshots =
      component.screenshotsOverride ??
      (component.slug === "audio-trimmer"
        ? [
            {
              mediaType: "IMAGE" as const,
              mimeType: "image/jpeg",
              url: "/seed-screenshots/audio-trimmer-full.jpg",
              storagePath: "seed-screenshots/audio-trimmer-full.jpg",
              previewUrl: "/seed-screenshots/audio-trimmer-preview.jpg",
              previewStoragePath: "seed-screenshots/audio-trimmer-preview.jpg",
              width: audioTrimmerImageDimensions.width,
              height: audioTrimmerImageDimensions.height,
              altText: "Audio Trimmer preview",
            },
            {
              mediaType: "VIDEO" as const,
              mimeType: "video/mp4",
              url: "/seed-videos/audio-trimmer.mp4",
              storagePath: "seed-videos/audio-trimmer.mp4",
              previewUrl: "/seed-screenshots/audio-trimmer-preview.jpg",
              previewStoragePath: "seed-screenshots/audio-trimmer-preview.jpg",
              width: audioTrimmerVideoDimensions.width,
              height: audioTrimmerVideoDimensions.height,
              altText: "Audio Trimmer demo video",
            },
          ]
        : component.slug === "revenue-card"
          ? [
              {
                mediaType: "IMAGE" as const,
                mimeType: "image/png",
                url: "/components/001-revenue-card/light.png",
                storagePath: "components/001-revenue-card/light.png",
                previewUrl: "/components/001-revenue-card/light.png",
                previewStoragePath: "components/001-revenue-card/light.png",
                width: revenueCardLightDimensions.width,
                height: revenueCardLightDimensions.height,
                altText: "Revenue Trend Card light appearance",
              },
              {
                mediaType: "IMAGE" as const,
                mimeType: "image/png",
                url: "/components/001-revenue-card/dark.png",
                storagePath: "components/001-revenue-card/dark.png",
                previewUrl: "/components/001-revenue-card/dark.png",
                previewStoragePath: "components/001-revenue-card/dark.png",
                width: revenueCardDarkDimensions.width,
                height: revenueCardDarkDimensions.height,
                altText: "Revenue Trend Card dark appearance",
              },
            ]
        : [
            await createScreenshotAsset(
              component.slug,
              component.title,
              category.accent
            ),
          ]);
    const sellerTargetPriceCents =
      component.sellerTargetPriceCentsOverride ??
      premiumPricingBySlug.get(component.slug) ??
      null;
    const accessType =
      component.accessTypeOverride ??
      (sellerTargetPriceCents !== null
        ? ComponentAccessType.PREMIUM
        : ComponentAccessType.FREE);
    const ownerId = publishedOwnerId;

    const categoryIds = [
      category.id,
      ...(relatedCategoryNamesBySlug
        .get(component.slug)
        ?.map((name) => categoryByName.get(name)?.id)
        .filter((value): value is string => Boolean(value)) ?? []),
    ].slice(0, 3);

    const createdComponent = await prisma.component.create({
      data: {
        slug: component.slug,
        ownerId,
        primaryCategoryId: category.id,
        status: ComponentStatus.APPROVED,
        featured: component.featured,
        categoryLinks: {
          create: categoryIds.map((categoryId, index) => ({
            categoryId,
            sortOrder: index,
          })),
        },
      },
    });

    const approvedRevision = await prisma.componentRevision.create({
      data: {
        componentId: createdComponent.id,
        version: 1,
        title: component.title,
        summary: component.summary,
        description: component.description,
        swiftCode:
          component.swiftCodeOverride ??
          seedCodeBySlug.get(component.slug) ??
          swiftCodeSnippet(component),
        changelog: component.changelog,
        accessType,
        sellerTargetPriceCents,
        status: ComponentStatus.APPROVED,
        submittedAt: new Date(Date.now() - component.seed * 86400000),
        reviewedAt: new Date(Date.now() - component.seed * 64800000),
        reviewerId: moderatorId,
        reviewNote: "Approved for the public gallery.",
        screenshots: {
          create: screenshots.map((screenshot, index) => ({
            ...screenshot,
            sortOrder: index,
          })),
        },
      },
    });

    await prisma.moderationLog.create({
      data: {
        revisionId: approvedRevision.id,
        moderatorId,
        decision: ModerationDecision.APPROVED,
        note: "Approved for the public gallery.",
      },
    });

    await prisma.component.update({
      where: { id: createdComponent.id },
      data: {
        activeRevisionId: approvedRevision.id,
        approvedRevisionId: approvedRevision.id,
        publishedAt: approvedRevision.reviewedAt,
      },
    });

    if (component.seed <= 8 || component.featured) {
      await prisma.favorite.create({
        data: {
          componentId: createdComponent.id,
          userId: fanId,
        },
      });
    }
  }

  const publicComponents = await prisma.component.findMany();

  for (const component of publicComponents) {
    const favoritesCount = await prisma.favorite.count({
      where: { componentId: component.id },
    });

    await prisma.component.update({
      where: { id: component.id },
      data: {
        favoritesCount,
      },
    });
  }

  await rebuildApprovedComponentSearchIndex(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
