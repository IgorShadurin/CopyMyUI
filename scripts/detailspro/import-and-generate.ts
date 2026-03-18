import { mkdir, readdir, writeFile } from "node:fs/promises";
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

type SourceItem = {
  designId: string;
  href: string;
  sourceUrl: string;
  title: string;
  author: string;
  previewUrl: string;
};

type PortItem = {
  id: string;
  numericId: number;
  slug: string;
  sourceTitle: string;
  sourceAuthor: string;
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
const SITE = "detailspro";
const BASE_URL = "https://detailspro.app";
const COMMUNITY_URL = `${BASE_URL}/community/`;
const COPYCAT_ROOT = path.join(ROOT, "public", "uploads", `copycat-${SITE}`);
const RESEARCH_ROOT = path.join(ROOT, "public", "uploads", "research");
const SEED_CODE_ROOT = path.join(ROOT, "prisma", "seed-code");
const START_SEED = 500;

const patternByCategory: Record<CategoryName, SeedPattern> = {
  Navigation: "segmentedRail",
  Dashboards: "metricsDeck",
  Commerce: "checkoutStack",
  Paywall: "pricingLens",
  Social: "profileGrid",
  Forms: "formWizard",
  Media: "galleryStage",
  Gaming: "audioShelf",
};

function decodeHtmlEntities(input: string) {
  return input
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function asciiTitle(input: string) {
  const normalized = input.normalize("NFKD").replace(/[^\x00-\x7F]/g, "");
  const squashed = normalized.replace(/\s+/g, " ").trim();
  return squashed || "Untitled Design";
}

function toSlug(input: string) {
  const ascii = asciiTitle(input).toLowerCase();
  const slug = ascii
    .replaceAll("&", " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "design";
}

function uniqueSlug(base: string, used: Set<string>) {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let index = 2;
  let candidate = `${base}-${index}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `${base}-${index}`;
  }

  used.add(candidate);
  return candidate;
}

function extractDesignId(href: string) {
  const match = href.match(/([A-F0-9-]{36})/);
  return match?.[1] ?? "";
}

function categoryFromTitle(title: string): CategoryName {
  const value = title.toLowerCase();

  if (
    value.includes("subscription") ||
    value.includes("pricing") ||
    value.includes("plan") ||
    value.includes("upgrade") ||
    value.includes("paywall")
  ) {
    return "Paywall";
  }

  if (
    value.includes("tab") ||
    value.includes("navigation") ||
    value.includes("lock screen") ||
    value.includes("sidebar") ||
    value.includes("dock")
  ) {
    return "Navigation";
  }

  if (
    value.includes("hotel") ||
    value.includes("trip") ||
    value.includes("destination") ||
    value.includes("checkout") ||
    value.includes("cart") ||
    value.includes("shop") ||
    value.includes("product") ||
    value.includes("food")
  ) {
    return "Commerce";
  }

  if (
    value.includes("profile") ||
    value.includes("community") ||
    value.includes("mail") ||
    value.includes("message") ||
    value.includes("friend")
  ) {
    return "Social";
  }

  if (
    value.includes("login") ||
    value.includes("search") ||
    value.includes("guide") ||
    value.includes("article") ||
    value.includes("form") ||
    value.includes("input")
  ) {
    return "Forms";
  }

  if (
    value.includes("widget") ||
    value.includes("stats") ||
    value.includes("activity") ||
    value.includes("dashboard") ||
    value.includes("score")
  ) {
    return "Dashboards";
  }

  if (
    value.includes("music") ||
    value.includes("player") ||
    value.includes("album") ||
    value.includes("station") ||
    value.includes("news")
  ) {
    return "Media";
  }

  return "Media";
}

function buildSummary(seedTitle: string, category: CategoryName) {
  return `${seedTitle} reimagined from DetailsPro Community as a rewritten ${category.toLowerCase()} SwiftUI component with adaptive light and dark styling.`;
}

function buildDescription(seedTitle: string, category: CategoryName, author: string) {
  return `${seedTitle} is a rewritten ${category.toLowerCase()} component for CopyMyUI. It keeps the source interaction intent while introducing fresh structure, spacing, and visual treatment. Source author: ${author}.`;
}

function escapeSwiftString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function renderNavigationSwift(title: string, subtitle: string) {
  return `import SwiftUI

struct ContentView: View {
    @State private var selected = 0
    private let tabs = ["Home", "Explore", "Saved", "Profile"]

    var body: some View {
        VStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 6) {
                Text("${escapeSwiftString(title)}")
                    .font(.system(size: 30, weight: .black, design: .rounded))
                Text("${escapeSwiftString(subtitle)}")
                    .font(.system(size: 15, weight: .medium, design: .rounded))
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .fill(Color.accentColor.opacity(0.12))
                .overlay(
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Navigation Preview")
                            .font(.headline)
                        Text("Context panel for the selected route.")
                            .foregroundStyle(.secondary)
                        Spacer()
                    }
                    .padding(18)
                )
                .frame(height: 230)

            HStack(spacing: 8) {
                ForEach(Array(tabs.enumerated()), id: \\.offset) { index, tab in
                    Button {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.82)) {
                            selected = index
                        }
                    } label: {
                        Text(tab)
                            .font(.system(size: 13, weight: .semibold, design: .rounded))
                            .foregroundStyle(selected == index ? Color.white : Color.primary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .fill(selected == index ? Color.accentColor : Color.clear)
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(8)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
}

function renderDashboardSwift(title: string, subtitle: string) {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 18) {
            VStack(alignment: .leading, spacing: 6) {
                Text("${escapeSwiftString(title)}")
                    .font(.system(size: 30, weight: .black, design: .rounded))
                Text("${escapeSwiftString(subtitle)}")
                    .font(.system(size: 15, weight: .medium, design: .rounded))
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 12) {
                StatCard(name: "Focus", value: "84%")
                StatCard(name: "Tasks", value: "27")
            }

            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color.accentColor.opacity(0.12))
                .frame(height: 140)
                .overlay(alignment: .leading) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Weekly trend")
                            .font(.headline)
                        Text("Smooth chart area reserved for metric movement.")
                            .foregroundStyle(.secondary)
                    }
                    .padding(18)
                }
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

private struct StatCard: View {
    let name: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(name)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.system(size: 28, weight: .black, design: .rounded))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}

#Preview { ContentView() }
`;
}

function renderCommerceSwift(title: string, subtitle: string) {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("${escapeSwiftString(title)}")
                .font(.system(size: 30, weight: .black, design: .rounded))
            Text("${escapeSwiftString(subtitle)}")
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)

            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Color.accentColor.opacity(0.12))
                .frame(height: 210)
                .overlay(
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Featured Item")
                            .font(.system(size: 22, weight: .bold, design: .rounded))
                        Text("Price · Delivery · Benefits")
                            .foregroundStyle(.secondary)
                        Spacer()
                        Button("Continue") {}
                            .buttonStyle(.borderedProminent)
                    }
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                )
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
}

function renderPaywallSwift(title: string, subtitle: string) {
  return `import SwiftUI

struct ContentView: View {
    @State private var annual = true

    var body: some View {
        VStack(spacing: 16) {
            Text("${escapeSwiftString(title)}")
                .font(.system(size: 30, weight: .black, design: .rounded))
                .frame(maxWidth: .infinity, alignment: .leading)
            Text("${escapeSwiftString(subtitle)}")
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, alignment: .leading)

            Picker("Billing", selection: $annual) {
                Text("Annual").tag(true)
                Text("Monthly").tag(false)
            }
            .pickerStyle(.segmented)

            VStack(alignment: .leading, spacing: 10) {
                Text(annual ? "$49 / year" : "$9 / month")
                    .font(.system(size: 30, weight: .black, design: .rounded))
                Text("Unlock all premium templates and exports.")
                    .foregroundStyle(.secondary)
                Button("Start free trial") {}
                    .buttonStyle(.borderedProminent)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(18)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
}

function renderSocialSwift(title: string, subtitle: string) {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("${escapeSwiftString(title)}")
                .font(.system(size: 30, weight: .black, design: .rounded))
            Text("${escapeSwiftString(subtitle)}")
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)

            HStack(spacing: 12) {
                Circle().fill(Color.pink.opacity(0.8)).frame(width: 56, height: 56)
                Circle().fill(Color.blue.opacity(0.8)).frame(width: 56, height: 56)
                Circle().fill(Color.green.opacity(0.8)).frame(width: 56, height: 56)
                Spacer()
            }

            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color.accentColor.opacity(0.1))
                .frame(height: 180)
                .overlay(alignment: .topLeading) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Community update")
                            .font(.headline)
                        Text("Shared activity and status indicators.")
                            .foregroundStyle(.secondary)
                    }
                    .padding(18)
                }
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
}

function renderFormsSwift(title: string, subtitle: string) {
  return `import SwiftUI

struct ContentView: View {
    @State private var value1 = ""
    @State private var value2 = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("${escapeSwiftString(title)}")
                .font(.system(size: 30, weight: .black, design: .rounded))
            Text("${escapeSwiftString(subtitle)}")
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)

            TextField("Email", text: $value1)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .textFieldStyle(.roundedBorder)

            SecureField("Password", text: $value2)
                .textFieldStyle(.roundedBorder)

            Button("Continue") {}
                .buttonStyle(.borderedProminent)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
}

function renderMediaSwift(title: string, subtitle: string) {
  return `import SwiftUI

struct ContentView: View {
    @State private var progress = 0.35

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("${escapeSwiftString(title)}")
                .font(.system(size: 30, weight: .black, design: .rounded))
            Text("${escapeSwiftString(subtitle)}")
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)

            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color.accentColor.opacity(0.12))
                .frame(height: 210)
                .overlay(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Now Playing")
                            .font(.headline)
                        Slider(value: $progress, in: 0...1)
                    }
                    .padding(16)
                }
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
}

function renderGamingSwift(title: string, subtitle: string) {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("${escapeSwiftString(title)}")
                .font(.system(size: 30, weight: .black, design: .rounded))
            Text("${escapeSwiftString(subtitle)}")
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)

            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color.indigo.opacity(0.18))
                .frame(height: 220)
                .overlay(
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Mission status")
                            .font(.headline)
                        Text("Squad ready • Objective unlocked")
                            .foregroundStyle(.secondary)
                    }
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                )
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
}

function renderComponentSwift(category: CategoryName, title: string, sourceAuthor: string) {
  const subtitle = `Adapted from DetailsPro concept by ${sourceAuthor}`;

  switch (category) {
    case "Navigation":
      return renderNavigationSwift(title, subtitle);
    case "Dashboards":
      return renderDashboardSwift(title, subtitle);
    case "Commerce":
      return renderCommerceSwift(title, subtitle);
    case "Paywall":
      return renderPaywallSwift(title, subtitle);
    case "Social":
      return renderSocialSwift(title, subtitle);
    case "Forms":
      return renderFormsSwift(title, subtitle);
    case "Gaming":
      return renderGamingSwift(title, subtitle);
    case "Media":
    default:
      return renderMediaSwift(title, subtitle);
  }
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function fetchArrayBuffer(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    return null;
  }

  return Buffer.from(await response.arrayBuffer());
}

function parseCommunityCards(html: string) {
  const byDesignId = new Map<string, SourceItem>();

  const anchorRegex =
    /<a[^>]*title="([^"]+?) by ([^"]+?)"[^>]*href="(\/community\/design\/[A-F0-9-]{36}\/?)"[^>]*>[\s\S]*?<img src="(https:\/\/d1w362hbd8dnhw\.cloudfront\.net\/[^"]+)"[^>]*class="[^"]*object-cover[^"]*"/g;
  const serializedRegex =
    /\\"href\\":\\"(\/community\/design\/[A-F0-9-]{36}\/?)\\"[\s\S]*?\\"title\\":\\"([^"]+?) by ([^"]+?)\\"[\s\S]*?\\"src\\":\\"(https:\/\/d1w362hbd8dnhw\.cloudfront\.net\/[^"]+)\\"/g;

  for (const regex of [anchorRegex, serializedRegex]) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
      const [, maybeTitle, maybeAuthor, href, previewUrl] = match;

      const title = asciiTitle(decodeHtmlEntities(maybeTitle));
      const author = asciiTitle(decodeHtmlEntities(maybeAuthor));
      const designId = extractDesignId(href);
      if (!designId) {
        continue;
      }

      if (!byDesignId.has(designId)) {
        byDesignId.set(designId, {
          designId,
          href: href.replace(/\/+$/, "/"),
          sourceUrl: `${BASE_URL}${href.replace(/\/+$/, "/")}`,
          title,
          author,
          previewUrl,
        });
      }
    }
  }

  return [...byDesignId.values()].sort((a, b) => a.title.localeCompare(b.title));
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
    if (!entry.isDirectory()) {
      continue;
    }

    const match = entry.name.match(/^(\d{3})-/);
    if (!match) {
      continue;
    }

    const value = Number(match[1]);
    if (Number.isFinite(value) && value > max) {
      max = value;
    }
  }

  return max + 1;
}

async function main() {
  await mkdir(COPYCAT_ROOT, { recursive: true });
  await mkdir(RESEARCH_ROOT, { recursive: true });
  await mkdir(SEED_CODE_ROOT, { recursive: true });

  const communityHtml = await fetchHtml(COMMUNITY_URL);
  const sourceItems = parseCommunityCards(communityHtml);
  const freeItems = sourceItems;

  const startId = await nextResearchNumericId();
  const usedSlugs = new Set<string>();
  const portItems: PortItem[] = freeItems.map((item, index) => {
    const numericId = startId + index;
    const id = String(numericId).padStart(3, "0");
    const categoryName = categoryFromTitle(item.title);
    const slug = uniqueSlug(toSlug(item.title), usedSlugs);
    const seedTitle = item.title;

    return {
      id,
      numericId,
      slug,
      sourceTitle: item.title,
      sourceAuthor: item.author,
      sourceUrl: item.sourceUrl,
      sourcePreviewUrl: item.previewUrl,
      categoryName,
      pattern: patternByCategory[categoryName],
      seed: START_SEED + index,
      folderName: `${id}-${slug}`,
      seedTitle,
      summary: buildSummary(seedTitle, categoryName),
      description: buildDescription(seedTitle, categoryName, item.author),
      changelog:
        "Rewritten from DetailsPro Community research with fresh SwiftUI implementation and simulator captures.",
      featured: false,
    };
  });

  await writeFile(
    path.join(COPYCAT_ROOT, "source-posts-raw.json"),
    `${JSON.stringify(sourceItems, null, 2)}\n`
  );
  await writeFile(
    path.join(COPYCAT_ROOT, "source-posts-free.json"),
    `${JSON.stringify(freeItems, null, 2)}\n`
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
      site: "detailspro.app",
      url: item.sourceUrl,
      author: item.sourceAuthor,
    },
  }));

  await writeFile(
    path.join(SEED_CODE_ROOT, "detailspro-port-components.json"),
    `${JSON.stringify(seedManifest, null, 2)}\n`
  );

  for (const item of portItems) {
    const source = sourceItems.find((entry) => entry.sourceUrl === item.sourceUrl);
    if (!source) {
      continue;
    }

    const copycatComponentDir = path.join(COPYCAT_ROOT, item.folderName);
    const researchComponentDir = path.join(RESEARCH_ROOT, item.folderName);
    await mkdir(copycatComponentDir, { recursive: true });
    await mkdir(path.join(researchComponentDir, "original"), { recursive: true });
    await mkdir(path.join(researchComponentDir, "framed"), { recursive: true });

    const designPageHtml = await fetchHtml(source.sourceUrl);
    const openInAppMatch = designPageHtml.match(/href="(detailspro:\/\/[^"]+)"/i);
    const previewData = await fetchArrayBuffer(source.previewUrl);
    const previewExt = path.extname(new URL(source.previewUrl).pathname) || ".jpg";

    await writeFile(
      path.join(copycatComponentDir, "source-metadata.json"),
      `${JSON.stringify(
        {
          source: {
            title: source.title,
            author: source.author,
            sourceUrl: source.sourceUrl,
            designId: source.designId,
            previewUrl: source.previewUrl,
            openInAppUrl: openInAppMatch?.[1] ?? null,
          },
          port: item,
        },
        null,
        2
      )}\n`
    );
    await writeFile(path.join(copycatComponentDir, "source-page.html"), designPageHtml, "utf8");
    await writeFile(path.join(copycatComponentDir, "preview-url.txt"), `${source.previewUrl}\n`, "utf8");

    if (previewData) {
      await writeFile(path.join(copycatComponentDir, `source-preview${previewExt}`), previewData);
    }

    const rewrittenSwift = renderComponentSwift(item.categoryName, item.seedTitle, item.sourceAuthor);
    await writeFile(path.join(researchComponentDir, "content.swift"), rewrittenSwift, "utf8");
  }

  console.log(`DetailsPro community cards parsed: ${sourceItems.length}`);
  console.log(`Prepared free components: ${portItems.length}`);
  console.log(`Start ID: ${String(startId).padStart(3, "0")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
