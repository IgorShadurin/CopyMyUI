import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type CategoryName =
  | "Navigation"
  | "Dashboards"
  | "Commerce"
  | "Paywall"
  | "Social"
  | "Forms"
  | "Media"
  | "Gaming";

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

type Placement = "center" | "hud" | "banner";
type Surface = "material" | "gradient";

type SourceItem = {
  key: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  sourceUrl: string;
  sourcePreviewUrl: string;
  sourceSnippet: string;
  categoryName: CategoryName;
  pattern: SeedPattern;
  placement: Placement;
  surface: Surface;
  icon: string;
  iconColorHex: string;
  accentHexA: string;
  accentHexB: string;
  messageTitle: string;
  messageBody: string;
  contextLine: string;
  trailingLabel?: string;
};

type PortItem = {
  id: string;
  numericId: number;
  key: string;
  slug: string;
  sourceTitle: string;
  sourceUrl: string;
  sourcePreviewUrl: string;
  categoryName: CategoryName;
  pattern: SeedPattern;
  seed: number;
  folderName: string;
  seedTitle: string;
  summary: string;
  description: string;
  changelog: string;
  featured: boolean;
};

const ROOT = process.cwd();
const SITE = "alerttoast-variety-b2";
const COPYCAT_ROOT = path.join(ROOT, "public", "uploads", `copycat-${SITE}`);
const RESEARCH_ROOT = path.join(ROOT, "public", "uploads", "research");
const SEED_CODE_ROOT = path.join(ROOT, "prisma", "seed-code");

const ALERTTOAST_REPO = "https://github.com/elai950/AlertToast";
const ALERTTOAST_README = `${ALERTTOAST_REPO}/blob/master/README.md`;
const PREVIEW = "https://raw.githubusercontent.com/elai950/AlertToast/master/Assets/ToastExample.gif";

const sourceItems: SourceItem[] = [
  {
    key: "gaming-boss-defeated",
    slug: "toast-gaming-boss-defeated",
    title: "Gaming Boss Defeated Toast",
    summary: "Center celebration toast for boss clear milestones and reward payout.",
    description:
      "A high-impact achievement toast in copycat-alerttoast style for RPG progression moments.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "Center toast adapted for boss victory event feedback.",
    categoryName: "Gaming",
    pattern: "opsBoard",
    placement: "center",
    surface: "gradient",
    icon: "flame.fill",
    iconColorHex: "FFFFFF",
    accentHexA: "7C3AED",
    accentHexB: "DB2777",
    messageTitle: "Boss defeated",
    messageBody: "Obsidian Warden has been eliminated.",
    contextLine: "Final encounter",
    trailingLabel: "Mythic",
  },
  {
    key: "gaming-loot-synced",
    slug: "toast-gaming-loot-synced",
    title: "Gaming Loot Synced Toast",
    summary: "HUD sync indicator for inventory and cloud profile consistency.",
    description:
      "A compact top toast for inventory synchronization using copycat-alerttoast visual structure.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "HUD toast adapted for cloud loot sync status.",
    categoryName: "Gaming",
    pattern: "audioShelf",
    placement: "hud",
    surface: "material",
    icon: "archivebox.fill",
    iconColorHex: "22C55E",
    accentHexA: "22C55E",
    accentHexB: "16A34A",
    messageTitle: "Inventory synced",
    messageBody: "312 items restored to this device.",
    contextLine: "Cloud profile",
    trailingLabel: "OK",
  },
  {
    key: "gaming-raid-invite",
    slug: "toast-gaming-raid-invite",
    title: "Gaming Raid Invite Toast",
    summary: "Bottom invite banner for co-op raid room joins and quick responses.",
    description:
      "A banner-style raid invite notification following copycat-alerttoast spacing and typography.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "Banner toast adapted for incoming raid invitations.",
    categoryName: "Gaming",
    pattern: "storyShelf",
    placement: "banner",
    surface: "gradient",
    icon: "shield.lefthalf.filled",
    iconColorHex: "FFFFFF",
    accentHexA: "2563EB",
    accentHexB: "1D4ED8",
    messageTitle: "Raid invite",
    messageBody: "Squad Orion is waiting in Ember Citadel.",
    contextLine: "Party activity",
    trailingLabel: "Join",
  },
  {
    key: "gaming-stamina-refilled",
    slug: "toast-gaming-stamina-refilled",
    title: "Gaming Stamina Refilled Toast",
    summary: "HUD refill notice to bring users back to active play loops.",
    description:
      "A quick stamina-restored toast in copycat-alerttoast style for idle-energy systems.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "HUD toast adapted for stamina refill completion.",
    categoryName: "Gaming",
    pattern: "opsBoard",
    placement: "hud",
    surface: "gradient",
    icon: "bolt.heart.fill",
    iconColorHex: "FFFFFF",
    accentHexA: "F97316",
    accentHexB: "EA580C",
    messageTitle: "Stamina full",
    messageBody: "You are ready for 6 new battles.",
    contextLine: "Energy system",
    trailingLabel: "Play",
  },
  {
    key: "gaming-season-reward",
    slug: "toast-gaming-season-reward",
    title: "Gaming Season Reward Toast",
    summary: "Center reward summary toast for season rollover and claim events.",
    description:
      "A claim-state reward toast designed in copycat-alerttoast visual language for seasonal loops.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "Center toast adapted for seasonal reward claims.",
    categoryName: "Gaming",
    pattern: "storyShelf",
    placement: "center",
    surface: "material",
    icon: "medal.fill",
    iconColorHex: "F59E0B",
    accentHexA: "F59E0B",
    accentHexB: "F97316",
    messageTitle: "Season reward claimed",
    messageBody: "Legend crest and 1,200 shards added.",
    contextLine: "Season rollover",
    trailingLabel: "Claimed",
  },
  {
    key: "paywall-downgrade-warning",
    slug: "toast-paywall-downgrade-warning",
    title: "Paywall Downgrade Warning Toast",
    summary: "Bottom warning banner before pro feature downgrade takes effect.",
    description:
      "A paywall lifecycle warning in copycat-alerttoast style with clear urgency and CTA token.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "Banner toast adapted for impending downgrade notices.",
    categoryName: "Paywall",
    pattern: "pricingLens",
    placement: "banner",
    surface: "gradient",
    icon: "exclamationmark.triangle.fill",
    iconColorHex: "FFFFFF",
    accentHexA: "DC2626",
    accentHexB: "B91C1C",
    messageTitle: "Plan change pending",
    messageBody: "Advanced exports lock in 24 hours.",
    contextLine: "Subscription lifecycle",
    trailingLabel: "Keep Pro",
  },
  {
    key: "paywall-renewal-success",
    slug: "toast-paywall-renewal-success",
    title: "Paywall Renewal Success Toast",
    summary: "Center confirmation toast after billing cycle renews without interruption.",
    description:
      "A renewal-success status toast using copycat-alerttoast card proportions and clarity.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "Center toast adapted for subscription renewal success.",
    categoryName: "Paywall",
    pattern: "upsellDrawer",
    placement: "center",
    surface: "material",
    icon: "checkmark.seal.fill",
    iconColorHex: "16A34A",
    accentHexA: "16A34A",
    accentHexB: "22C55E",
    messageTitle: "Renewal complete",
    messageBody: "Pro access extended to Nov 2027.",
    contextLine: "Billing status",
    trailingLabel: "Active",
  },
  {
    key: "paywall-family-share",
    slug: "toast-paywall-family-share-enabled",
    title: "Paywall Family Share Enabled Toast",
    summary: "HUD toast confirming family sharing activation for paid plan.",
    description:
      "A top-hud entitlement message in copycat-alerttoast style for family-sharing setup.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "HUD toast adapted for family sharing entitlement enabled event.",
    categoryName: "Paywall",
    pattern: "pricingLens",
    placement: "hud",
    surface: "material",
    icon: "person.3.fill",
    iconColorHex: "6366F1",
    accentHexA: "6366F1",
    accentHexB: "8B5CF6",
    messageTitle: "Family sharing on",
    messageBody: "Up to 5 members can now access Pro.",
    contextLine: "Entitlements",
    trailingLabel: "Manage",
  },
  {
    key: "social-mention-spike",
    slug: "toast-social-mention-spike",
    title: "Social Mention Spike Toast",
    summary: "Banner toast for sudden mention activity bursts in creator feed.",
    description:
      "A social attention toast aligned with copycat-alerttoast readability and compact tone.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "Banner toast adapted for mention spike alerts.",
    categoryName: "Social",
    pattern: "creatorThread",
    placement: "banner",
    surface: "gradient",
    icon: "at",
    iconColorHex: "FFFFFF",
    accentHexA: "0EA5E9",
    accentHexB: "2563EB",
    messageTitle: "Mentions trending",
    messageBody: "You were tagged 47 times in the last hour.",
    contextLine: "Audience activity",
    trailingLabel: "Review",
  },
  {
    key: "commerce-price-drop",
    slug: "toast-commerce-price-drop",
    title: "Commerce Price Drop Toast",
    summary: "HUD savings notification when wishlisted products decrease in price.",
    description:
      "A commerce promotion toast using copycat-alerttoast hierarchy for high-visibility discount updates.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "HUD toast adapted for wishlist price-drop monitoring.",
    categoryName: "Commerce",
    pattern: "productSpotlight",
    placement: "hud",
    surface: "gradient",
    icon: "tag.fill",
    iconColorHex: "FFFFFF",
    accentHexA: "10B981",
    accentHexB: "059669",
    messageTitle: "Price dropped",
    messageBody: "3 saved items are now 15–25% cheaper.",
    contextLine: "Wishlist alerts",
    trailingLabel: "View deals",
  },
];

function escapeSwift(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function renderComponentSwift(item: SourceItem) {
  const gradientSurface = item.surface === "gradient";
  const isCenter = item.placement === "center";
  const isHud = item.placement === "hud";

  return `import SwiftUI

struct ContentView: View {
    @Environment(\\.colorScheme) private var colorScheme

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "${item.accentHexA}").opacity(0.14), Color.clear],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 14) {
                Text("${escapeSwift(item.title)}")
                    .font(.system(size: 30, weight: .black, design: .rounded))

                Text("${escapeSwift(item.summary)}")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)

                ${isHud ? "toastCard" : "Spacer(minLength: 0)"}

                ${isCenter ? "toastCard" : ""}

                ${!isHud && !isCenter ? "Spacer(minLength: 0)\n                toastCard" : ""}
            }
            .padding(24)
        }
    }

    private var toastCard: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color(hex: "${item.accentHexA}").opacity(0.22))
                    .frame(width: 34, height: 34)
                Image(systemName: "${item.icon}")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(Color(hex: "${item.iconColorHex}"))
            }

            VStack(alignment: .leading, spacing: 3) {
                Text("${escapeSwift(item.messageTitle)}")
                    .font(.system(size: 15, weight: .bold, design: .rounded))
                Text("${escapeSwift(item.messageBody)}")
                    .font(.system(size: 12, weight: .medium, design: .rounded))
                    .foregroundStyle(.secondary)
                Text("${escapeSwift(item.contextLine)}")
                    .font(.system(size: 11, weight: .semibold, design: .rounded))
                    .foregroundStyle(Color(hex: "${item.accentHexA}").opacity(0.88))
            }

            Spacer(minLength: 8)

            ${item.trailingLabel
              ? `Text("${escapeSwift(item.trailingLabel)}")
                .font(.system(size: 11, weight: .black, design: .rounded))
                .padding(.horizontal, 9)
                .padding(.vertical, 7)
                .background(Color(hex: "${item.accentHexA}").opacity(0.15), in: Capsule())`
              : "EmptyView()"}
        }
        .padding(14)
        .frame(maxWidth: .infinity)
        ${gradientSurface
          ? `.background(
            LinearGradient(
                colors: [Color(hex: "${item.accentHexA}"), Color(hex: "${item.accentHexB}")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: 16, style: .continuous)
        )
        .foregroundStyle(Color.white)`
          : `.background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(.ultraThinMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(colorScheme == .dark ? Color.white.opacity(0.14) : Color.black.opacity(0.08), lineWidth: 1)
        )`}
    }
}

private extension Color {
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&int)

        let r, g, b: UInt64
        switch cleaned.count {
        case 6:
            (r, g, b) = ((int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff)
        default:
            (r, g, b) = (120, 120, 120)
        }

        self.init(red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255)
    }
}

#Preview { ContentView() }
`;
}

async function fetchArrayBuffer(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) return null;
  return Buffer.from(await response.arrayBuffer());
}

async function nextResearchNumericId() {
  let entries: Array<{ name: string; isDirectory: () => boolean }> = [];
  try {
    entries = await readdir(RESEARCH_ROOT, { withFileTypes: true });
  } catch {
    return 1;
  }

  let max = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const match = entry.name.match(/^(\d{3})-/);
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isFinite(value) && value > max) {
      max = value;
    }
  }
  return max + 1;
}

async function nextSeedValue() {
  let maxSeed = 0;

  try {
    const seedTs = await readFile(path.join(ROOT, "prisma", "seed.ts"), "utf8");
    for (const match of seedTs.matchAll(/seed:\s*(\d+)/g)) {
      const value = Number(match[1]);
      if (Number.isFinite(value) && value > maxSeed) {
        maxSeed = value;
      }
    }
  } catch {
    // ignore
  }

  try {
    const entries = await readdir(SEED_CODE_ROOT, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith("-port-components.json")) continue;

      try {
        const content = await readFile(path.join(SEED_CODE_ROOT, entry.name), "utf8");
        const parsed = JSON.parse(content) as Array<{ seed?: unknown }>;
        for (const item of parsed) {
          const value = typeof item.seed === "number" ? item.seed : Number(item.seed);
          if (Number.isFinite(value) && value > maxSeed) {
            maxSeed = value;
          }
        }
      } catch {
        // ignore malformed json
      }
    }
  } catch {
    // ignore
  }

  return maxSeed + 1;
}

async function main() {
  await mkdir(COPYCAT_ROOT, { recursive: true });
  await mkdir(RESEARCH_ROOT, { recursive: true });
  await mkdir(SEED_CODE_ROOT, { recursive: true });

  const startId = await nextResearchNumericId();
  const startSeed = await nextSeedValue();

  const portItems: PortItem[] = sourceItems.map((item, index) => {
    const numericId = startId + index;
    const id = String(numericId).padStart(3, "0");
    return {
      id,
      numericId,
      key: item.key,
      slug: item.slug,
      sourceTitle: item.title,
      sourceUrl: item.sourceUrl,
      sourcePreviewUrl: item.sourcePreviewUrl,
      categoryName: item.categoryName,
      pattern: item.pattern,
      seed: startSeed + index,
      folderName: `${id}-${item.slug}`,
      seedTitle: item.title,
      summary: `${item.summary} Styled after copycat-alerttoast and rewritten in pure SwiftUI with light/dark adaptation.`,
      description: `${item.description} This variation follows the compact toast language derived from copycat-alerttoast while fitting ${item.categoryName.toLowerCase()} workflows.`,
      changelog:
        "Added as style-driven expansion from copycat-alerttoast to increase category variety coverage.",
      featured: false,
    };
  });

  await writeFile(
    path.join(COPYCAT_ROOT, "source-posts-raw.json"),
    `${JSON.stringify(sourceItems, null, 2)}\n`
  );
  await writeFile(
    path.join(COPYCAT_ROOT, "source-posts-free.json"),
    `${JSON.stringify(sourceItems, null, 2)}\n`
  );
  await writeFile(
    path.join(COPYCAT_ROOT, "source-port-manifest.json"),
    `${JSON.stringify(portItems, null, 2)}\n`
  );

  const seedManifest = portItems.map((item) => ({
    slug: item.slug,
    title: item.seedTitle,
    summary: item.summary,
    description: item.description,
    changelog: item.changelog,
    categoryName: item.categoryName,
    featured: item.featured,
    seed: item.seed,
    pattern: item.pattern,
    folderName: item.folderName,
    screenshots: {
      lightPath: `components/${item.folderName}/light.png`,
      darkPath: `components/${item.folderName}/dark.png`,
    },
    swiftFile: `${item.slug}.swift`,
    source: {
      site: "github.com/elai950/AlertToast",
      url: item.sourceUrl,
    },
  }));

  await writeFile(
    path.join(SEED_CODE_ROOT, "alerttoast-variety-b2-port-components.json"),
    `${JSON.stringify(seedManifest, null, 2)}\n`
  );

  for (const item of portItems) {
    const source = sourceItems.find((entry) => entry.key === item.key);
    if (!source) continue;

    const copycatDir = path.join(COPYCAT_ROOT, item.folderName);
    const researchDir = path.join(RESEARCH_ROOT, item.folderName);
    await mkdir(copycatDir, { recursive: true });
    await mkdir(path.join(researchDir, "original"), { recursive: true });
    await mkdir(path.join(researchDir, "framed"), { recursive: true });

    const previewData = await fetchArrayBuffer(source.sourcePreviewUrl);
    const previewExt = path.extname(new URL(source.sourcePreviewUrl).pathname) || ".png";

    await writeFile(
      path.join(copycatDir, "source-metadata.json"),
      `${JSON.stringify(
        {
          source: {
            title: source.title,
            summary: source.summary,
            sourceUrl: source.sourceUrl,
            previewUrl: source.sourcePreviewUrl,
            styleBase: "copycat-alerttoast",
          },
          port: item,
        },
        null,
        2
      )}\n`
    );
    await writeFile(path.join(copycatDir, "source-code.swift"), `${source.sourceSnippet}\n`, "utf8");
    await writeFile(path.join(copycatDir, "preview-url.txt"), `${source.sourcePreviewUrl}\n`, "utf8");

    if (previewData) {
      await writeFile(path.join(copycatDir, `source-preview${previewExt}`), previewData);
    }

    const swift = renderComponentSwift(source);
    await writeFile(path.join(researchDir, "content.swift"), swift, "utf8");
  }

  console.log(`AlertToast variety components prepared: ${portItems.length}`);
  console.log(`AlertToast variety start ID: ${String(startId).padStart(3, "0")}`);
  console.log(`AlertToast variety seed start: ${startSeed}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
