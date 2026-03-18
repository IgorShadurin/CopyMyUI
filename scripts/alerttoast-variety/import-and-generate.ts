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
const SITE = "alerttoast-variety";
const COPYCAT_ROOT = path.join(ROOT, "public", "uploads", `copycat-${SITE}`);
const RESEARCH_ROOT = path.join(ROOT, "public", "uploads", "research");
const SEED_CODE_ROOT = path.join(ROOT, "prisma", "seed-code");

const ALERTTOAST_REPO = "https://github.com/elai950/AlertToast";
const ALERTTOAST_README = `${ALERTTOAST_REPO}/blob/master/README.md`;
const PREVIEW = "https://raw.githubusercontent.com/elai950/AlertToast/master/Assets/ToastExample.gif";

const sourceItems: SourceItem[] = [
  {
    key: "gaming-quest-unlocked",
    slug: "toast-gaming-quest-unlocked",
    title: "Gaming Quest Unlocked Toast",
    summary: "Quest reward notification with compact badge and center toast treatment.",
    description:
      "A game progression notification card in AlertToast style, tuned for achievement unlock moments.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "Alert-style center toast adapted for quest unlock feedback.",
    categoryName: "Gaming",
    pattern: "opsBoard",
    placement: "center",
    surface: "gradient",
    icon: "flag.checkered.2.crossed",
    iconColorHex: "FFFFFF",
    accentHexA: "3A2AFF",
    accentHexB: "8A3DFF",
    messageTitle: "Quest unlocked",
    messageBody: "Shadow Keepline chapter is now available.",
    contextLine: "Campaign progression",
    trailingLabel: "+400 XP",
  },
  {
    key: "gaming-matchmaking-ready",
    slug: "toast-gaming-matchmaking-ready",
    title: "Gaming Matchmaking Ready Toast",
    summary: "Top HUD toast for party-ready state with ping marker and short status copy.",
    description:
      "A fast HUD-style ready notification in AlertToast visual language for match queues.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "HUD toast adapted for low-latency matchmaking ready signal.",
    categoryName: "Gaming",
    pattern: "storyShelf",
    placement: "hud",
    surface: "material",
    icon: "bolt.fill",
    iconColorHex: "FFB800",
    accentHexA: "22C55E",
    accentHexB: "16A34A",
    messageTitle: "Match ready",
    messageBody: "All squad members confirmed. Join in 10s.",
    contextLine: "Ranked queue",
    trailingLabel: "32 ms",
  },
  {
    key: "paywall-trial-ending",
    slug: "toast-paywall-trial-ending",
    title: "Paywall Trial Ending Toast",
    summary: "Bottom banner reminder for trial expiration with clear upgrade cue.",
    description:
      "A paywall reminder banner using AlertToast-like compact hierarchy and urgency styling.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "Banner toast adapted for trial ending and upgrade reminder flow.",
    categoryName: "Paywall",
    pattern: "pricingLens",
    placement: "banner",
    surface: "gradient",
    icon: "hourglass",
    iconColorHex: "FFFFFF",
    accentHexA: "F97316",
    accentHexB: "EF4444",
    messageTitle: "Trial ends tomorrow",
    messageBody: "Keep premium exports and templates with Pro.",
    contextLine: "Billing reminder",
    trailingLabel: "Upgrade",
  },
  {
    key: "paywall-upgrade-confirmed",
    slug: "toast-paywall-upgrade-confirmed",
    title: "Paywall Upgrade Confirmed Toast",
    summary: "Centered success confirmation toast after premium purchase completion.",
    description:
      "A completion-style toast for successful plan upgrade in paywall checkout flows.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "Center toast adapted for subscription upgrade completion feedback.",
    categoryName: "Paywall",
    pattern: "upsellDrawer",
    placement: "center",
    surface: "material",
    icon: "crown.fill",
    iconColorHex: "F59E0B",
    accentHexA: "7C3AED",
    accentHexB: "A855F7",
    messageTitle: "Pro activated",
    messageBody: "Annual plan is active on all your devices.",
    contextLine: "Subscription status",
    trailingLabel: "Success",
  },
  {
    key: "paywall-discount-window",
    slug: "toast-paywall-discount-window",
    title: "Paywall Discount Window Toast",
    summary: "HUD discount notification for limited-time offer in upgrade journey.",
    description:
      "A time-sensitive discount toast styled after AlertToast HUD mode for monetization prompts.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "HUD toast adapted for limited paywall discount windows.",
    categoryName: "Paywall",
    pattern: "pricingLens",
    placement: "hud",
    surface: "gradient",
    icon: "tag.fill",
    iconColorHex: "FFFFFF",
    accentHexA: "0EA5E9",
    accentHexB: "2563EB",
    messageTitle: "48% off unlock",
    messageBody: "Offer expires in 03:21:18.",
    contextLine: "Limited promotion",
    trailingLabel: "Claim",
  },
  {
    key: "social-follow-back",
    slug: "toast-social-follow-back",
    title: "Social Follow Back Toast",
    summary: "Soft banner confirmation for follow events and relationship updates.",
    description:
      "A social follow action confirmation in AlertToast-inspired compact card format.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "Banner toast adapted for social graph follow-back feedback.",
    categoryName: "Social",
    pattern: "communityBanner",
    placement: "banner",
    surface: "material",
    icon: "person.2.fill",
    iconColorHex: "6366F1",
    accentHexA: "6366F1",
    accentHexB: "8B5CF6",
    messageTitle: "Followed back",
    messageBody: "@riley.studio now follows you too.",
    contextLine: "Community update",
    trailingLabel: "View",
  },
  {
    key: "social-dm-sent",
    slug: "toast-social-dm-sent",
    title: "Social DM Sent Toast",
    summary: "Center confirmation toast for direct message delivery state.",
    description:
      "A message delivery confirmation toast using AlertToast-style card composition.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "Center toast adapted for DM delivery feedback in chat flows.",
    categoryName: "Social",
    pattern: "creatorThread",
    placement: "center",
    surface: "gradient",
    icon: "paperplane.fill",
    iconColorHex: "FFFFFF",
    accentHexA: "0EA5E9",
    accentHexB: "0284C7",
    messageTitle: "Message delivered",
    messageBody: "Your note was sent to 3 recipients.",
    contextLine: "Direct messages",
    trailingLabel: "Now",
  },
  {
    key: "social-live-room",
    slug: "toast-social-live-room",
    title: "Social Live Room Toast",
    summary: "Top HUD prompt when followed creator starts a live session.",
    description:
      "A real-time social alert in AlertToast HUD style for creator live events.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "HUD toast adapted for creator live room notifications.",
    categoryName: "Social",
    pattern: "storyShelf",
    placement: "hud",
    surface: "material",
    icon: "dot.radiowaves.left.and.right",
    iconColorHex: "EF4444",
    accentHexA: "EF4444",
    accentHexB: "F97316",
    messageTitle: "Live now",
    messageBody: "Mina is streaming UI teardown.",
    contextLine: "Creator activity",
    trailingLabel: "Join",
  },
  {
    key: "commerce-order-shipped",
    slug: "toast-commerce-order-shipped",
    title: "Commerce Order Shipped Toast",
    summary: "Shipping update banner with tracking shortcut for purchase journey.",
    description:
      "A transactional shipping toast in AlertToast style for post-checkout status changes.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "Banner toast adapted for order shipped state and tracking CTA.",
    categoryName: "Commerce",
    pattern: "checkoutStack",
    placement: "banner",
    surface: "gradient",
    icon: "shippingbox.fill",
    iconColorHex: "FFFFFF",
    accentHexA: "10B981",
    accentHexB: "059669",
    messageTitle: "Order shipped",
    messageBody: "Package #A29-44 is on the way.",
    contextLine: "Delivery updates",
    trailingLabel: "Track",
  },
  {
    key: "commerce-cart-saved",
    slug: "toast-commerce-cart-saved",
    title: "Commerce Cart Saved Toast",
    summary: "Center save-state toast for cart persistence and return-later flows.",
    description:
      "A cart-save acknowledgment toast in AlertToast visual style for commerce retention.",
    sourceUrl: ALERTTOAST_README,
    sourcePreviewUrl: PREVIEW,
    sourceSnippet: "Center toast adapted for save-cart and revisit checkout scenarios.",
    categoryName: "Commerce",
    pattern: "productSpotlight",
    placement: "center",
    surface: "material",
    icon: "cart.badge.plus",
    iconColorHex: "0EA5E9",
    accentHexA: "0EA5E9",
    accentHexB: "6366F1",
    messageTitle: "Cart saved",
    messageBody: "4 items were preserved for later checkout.",
    contextLine: "Cart actions",
    trailingLabel: "Open",
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
    path.join(SEED_CODE_ROOT, "alerttoast-variety-port-components.json"),
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
