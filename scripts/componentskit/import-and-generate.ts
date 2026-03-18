import { mkdir, writeFile } from "node:fs/promises";
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

type SourceComponent = {
  slug: string;
  url: string;
  title: string;
  description: string;
  previewPath: string | null;
  sourceCode: string;
  pageHtml: string;
};

type PortItem = {
  id: string;
  numericId: number;
  slug: string;
  sourceTitle: string;
  sourceDescription: string;
  sourceUrl: string;
  sourcePreviewPath: string | null;
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
const SITE = "componentskit";
const BASE_URL = "https://componentskit.io";
const COPYCAT_ROOT = path.join(ROOT, "public", "uploads", `copycat-${SITE}`);
const RESEARCH_ROOT = path.join(ROOT, "public", "uploads", "research");
const SEED_CODE_ROOT = path.join(ROOT, "prisma", "seed-code");

const START_ID = 28;
const START_SEED = 300;

const categoryBySlug: Record<string, CategoryName> = {
  alert: "Forms",
  avatar: "Social",
  "avatar-group": "Social",
  badge: "Social",
  button: "Forms",
  card: "Commerce",
  checkbox: "Forms",
  "circular-progress": "Dashboards",
  countdown: "Dashboards",
  divider: "Navigation",
  "input-field": "Forms",
  loading: "Dashboards",
  "bottom-modal": "Media",
  "center-modal": "Media",
  "progress-bar": "Dashboards",
  "radio-group": "Forms",
  "segmented-control": "Navigation",
  slider: "Forms",
  "text-input": "Forms",
};

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

function toTitleCase(input: string) {
  return input
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function decodeEscapedJsonString(value: string) {
  try {
    return JSON.parse(`"${value}"`) as string;
  } catch {
    return value;
  }
}

function parseComponentSlugsFromSitemap(xml: string) {
  const matches = Array.from(
    xml.matchAll(/<loc>https:\/\/componentskit\.io\/docs\/components\/([^<]+)<\/loc>/g)
  );

  return [...new Set(matches.map((match) => match[1]))].sort((a, b) => a.localeCompare(b));
}

function extractTitle(html: string, slug: string) {
  const match = html.match(/<title>([^<]+) \| ComponentsKit<\/title>/i);
  if (match?.[1]) {
    return match[1].trim();
  }
  return toTitleCase(slug);
}

function extractDescription(html: string) {
  const match = html.match(/<meta name="description" content="([^"]+)"\/>/i);
  return match?.[1]?.trim() ?? "";
}

function extractPreviewPath(html: string) {
  const preload = html.match(/<link rel="preload" as="image" href="(\/images\/components\/[^"]+)"\/>/i);
  if (preload?.[1]) {
    return preload[1];
  }

  const fallback = html.match(/"src":"(\/images\/components\/[^"]+)"/i);
  return fallback?.[1] ?? null;
}

function extractSourceCode(html: string, slug: string) {
  const snippets = Array.from(html.matchAll(/"content":"((?:[^"\\]|\\.)*)"/g))
    .map((match) => decodeEscapedJsonString(match[1]))
    .map((snippet) => snippet.replace(/\r\n/g, "\n").trim())
    .filter((snippet) => snippet.includes("struct") || snippet.includes("class") || snippet.includes("init("))
    .filter((snippet) => snippet.length >= 80);

  const ranked = snippets
    .sort((a, b) => b.length - a.length)
    .slice(0, 6)
    .filter((snippet, index, arr) => arr.findIndex((item) => item === snippet) === index);

  if (ranked.length === 0) {
    return `// No direct source snippet extracted for ${slug}.\n`;
  }

  const selected = ranked.slice(0, 3).join("\n\n// ----\n\n");
  return `${selected}\n`;
}

function sanitizeForSeedTitle(sourceTitle: string, slug: string) {
  if (slug === "input-field") {
    return "Input Field";
  }
  if (slug === "text-input") {
    return "Multiline Text Input";
  }
  return sourceTitle;
}

function buildSummary(slug: string, category: CategoryName) {
  return `${toTitleCase(slug)} adapted from ComponentsKit into a rewritten ${category.toLowerCase()} SwiftUI component with light/dark support.`;
}

function buildSeedDescription(slug: string, category: CategoryName, sourceDescription: string) {
  const firstSentence = sourceDescription.split(/[.!?]/)[0] ?? sourceDescription;
  return `${toTitleCase(slug)} is a rewritten ${category.toLowerCase()} component for CopyMyUI. It preserves the original interaction intent while using a new implementation and visual treatment. Source intent: ${firstSentence}.`;
}

function renderComponentSwift(slug: string) {
  switch (slug) {
    case "alert":
      return `import SwiftUI

struct ContentView: View {
    @State private var visible = true

    var body: some View {
        ZStack {
            Color(.systemGroupedBackground).ignoresSafeArea()

            if visible {
                VStack(alignment: .leading, spacing: 14) {
                    Label("Important update", systemImage: "exclamationmark.triangle.fill")
                        .font(.system(size: 18, weight: .bold, design: .rounded))
                        .foregroundStyle(.orange)

                    Text("Your billing profile needs a quick review before the next renewal cycle.")
                        .font(.system(size: 15, weight: .medium, design: .rounded))
                        .foregroundStyle(.secondary)

                    HStack(spacing: 10) {
                        Button("Later") {
                            visible = false
                        }
                        .buttonStyle(.bordered)

                        Button("Review now") {}
                        .buttonStyle(.borderedProminent)
                    }
                }
                .padding(18)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                .padding(20)
            } else {
                Button("Show Alert") {
                    visible = true
                }
                .buttonStyle(.borderedProminent)
            }
        }
    }
}

#Preview { ContentView() }
`;
    case "avatar":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color(.systemGroupedBackground).ignoresSafeArea()

            VStack(spacing: 12) {
                Circle()
                    .fill(LinearGradient(colors: [.pink, .orange], startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(width: 110, height: 110)
                    .overlay(Text("AL").font(.system(size: 36, weight: .black, design: .rounded)).foregroundStyle(.white))

                Text("Avery Lane")
                    .font(.system(size: 24, weight: .black, design: .rounded))

                Text("Product Designer")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)
            }
        }
    }
}

#Preview { ContentView() }
`;
    case "avatar-group":
      return `import SwiftUI

struct ContentView: View {
    private let colors: [Color] = [.pink, .blue, .green, .orange, .purple]

    var body: some View {
        ZStack {
            Color(.systemGroupedBackground).ignoresSafeArea()

            HStack(spacing: -14) {
                ForEach(Array(colors.enumerated()), id: \\.offset) { index, color in
                    Circle()
                        .fill(color.gradient)
                        .frame(width: 74, height: 74)
                        .overlay(Text(["AL", "MK", "RC", "JT", "+8"][index]).font(.system(size: 18, weight: .bold, design: .rounded)).foregroundStyle(.white))
                        .overlay(Circle().stroke(.background, lineWidth: 3))
                }
            }
            .padding(24)
        }
    }
}

#Preview { ContentView() }
`;
    case "badge":
      return `import SwiftUI

struct ContentView: View {
    let tags = ["New", "Beta", "Popular", "Archived"]

    var body: some View {
        ZStack {
            Color(.systemGroupedBackground).ignoresSafeArea()

            VStack(spacing: 10) {
                ForEach(tags, id: \\.self) { tag in
                    Text(tag)
                        .font(.system(size: 14, weight: .bold, design: .rounded))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(
                            tag == "Archived" ? Color.secondary.opacity(0.2) : Color.blue.opacity(0.18),
                            in: Capsule()
                        )
                        .foregroundStyle(tag == "Archived" ? Color.secondary : Color.blue)
                }
            }
        }
    }
}

#Preview { ContentView() }
`;
    case "button":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color(.systemGroupedBackground).ignoresSafeArea()

            VStack(spacing: 14) {
                Button("Primary Action") {}
                    .buttonStyle(.borderedProminent)

                Button("Secondary Action") {}
                    .buttonStyle(.bordered)

                Button("Plain Button") {}
            }
            .font(.system(size: 16, weight: .bold, design: .rounded))
        }
    }
}

#Preview { ContentView() }
`;
    case "card":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color(.systemGroupedBackground).ignoresSafeArea()

            VStack(alignment: .leading, spacing: 10) {
                Text("Starter Plan")
                    .font(.system(size: 22, weight: .black, design: .rounded))

                Text("Includes analytics, exports, and custom themes.")
                    .font(.system(size: 14, weight: .medium, design: .rounded))
                    .foregroundStyle(.secondary)

                Divider()

                HStack {
                    Text("$9.99")
                        .font(.system(size: 28, weight: .black, design: .rounded))
                    Text("/ month")
                        .foregroundStyle(.secondary)
                    Spacer()
                }
            }
            .padding(18)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .padding(20)
        }
    }
}

#Preview { ContentView() }
`;
    case "checkbox":
      return `import SwiftUI

struct ContentView: View {
    @State private var checks = [true, false, true]

    var body: some View {
        ZStack {
            Color(.systemGroupedBackground).ignoresSafeArea()

            VStack(alignment: .leading, spacing: 12) {
                ForEach(0..<checks.count, id: \\.self) { index in
                    HStack {
                        Image(systemName: checks[index] ? "checkmark.square.fill" : "square")
                            .foregroundStyle(checks[index] ? Color.blue : Color.secondary)
                            .onTapGesture { checks[index].toggle() }

                        Text(["Email updates", "Product tips", "Weekly digest"][index])
                        Spacer()
                    }
                    .font(.system(size: 16, weight: .semibold, design: .rounded))
                }
            }
            .padding(18)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            .padding(20)
        }
    }
}

#Preview { ContentView() }
`;
    case "circular-progress":
      return `import SwiftUI

struct ContentView: View {
    private let progress = 0.72

    var body: some View {
        ZStack {
            Color(.systemGroupedBackground).ignoresSafeArea()

            ZStack {
                Circle()
                    .stroke(.secondary.opacity(0.24), lineWidth: 16)
                    .frame(width: 180, height: 180)

                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(.blue, style: StrokeStyle(lineWidth: 16, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .frame(width: 180, height: 180)

                Text("72%")
                    .font(.system(size: 34, weight: .black, design: .rounded))
            }
        }
    }
}

#Preview { ContentView() }
`;
    case "countdown":
      return `import SwiftUI

struct ContentView: View {
    @State private var seconds = 95

    var body: some View {
        VStack(spacing: 14) {
            Text("Countdown")
                .font(.system(size: 22, weight: .black, design: .rounded))

            Text(timeString)
                .font(.system(size: 46, weight: .black, design: .rounded))
                .monospacedDigit()

            Button("- 5 sec") {
                seconds = max(0, seconds - 5)
            }
            .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }

    private var timeString: String {
        let m = seconds / 60
        let s = seconds % 60
        return String(format: "%02d:%02d", m, s)
    }
}

#Preview { ContentView() }
`;
    case "divider":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 18) {
            Text("Section One")
            Divider()
            Text("Section Two")
            Rectangle().fill(.secondary.opacity(0.25)).frame(height: 1)
            Text("Section Three")
        }
        .font(.system(size: 18, weight: .bold, design: .rounded))
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
        .padding(24)
    }
}

#Preview { ContentView() }
`;
    case "input-field":
      return `import SwiftUI

struct ContentView: View {
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        VStack(spacing: 12) {
            TextField("Email", text: $email)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()

            SecureField("Password", text: $password)
        }
        .textFieldStyle(.roundedBorder)
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
    case "loading":
      return `import SwiftUI

struct ContentView: View {
    @State private var spinning = false

    var body: some View {
        ZStack {
            Color(.systemGroupedBackground).ignoresSafeArea()

            VStack(spacing: 16) {
                Circle()
                    .trim(from: 0.15, to: 0.85)
                    .stroke(.blue, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .frame(width: 84, height: 84)
                    .rotationEffect(.degrees(spinning ? 360 : 0))
                    .animation(.linear(duration: 1).repeatForever(autoreverses: false), value: spinning)

                Text("Loading…")
                    .font(.system(size: 17, weight: .bold, design: .rounded))
            }
            .onAppear { spinning = true }
        }
    }
}

#Preview { ContentView() }
`;
    case "bottom-modal":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack(alignment: .bottom) {
            Color.black.opacity(0.2).ignoresSafeArea()

            VStack(alignment: .leading, spacing: 12) {
                Capsule().fill(.secondary.opacity(0.4)).frame(width: 48, height: 6).frame(maxWidth: .infinity)
                Text("Bottom Sheet")
                    .font(.system(size: 22, weight: .black, design: .rounded))
                Text("Use this area for quick actions and contextual options.")
                    .foregroundStyle(.secondary)
            }
            .padding(20)
            .frame(maxWidth: .infinity)
            .background(.background, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        }
    }
}

#Preview { ContentView() }
`;
    case "center-modal":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color.black.opacity(0.2).ignoresSafeArea()

            VStack(spacing: 12) {
                Text("Confirm action")
                    .font(.system(size: 24, weight: .black, design: .rounded))
                Text("This modal is centered and blocks interaction behind it.")
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)

                HStack(spacing: 10) {
                    Button("Cancel") {}
                        .buttonStyle(.bordered)
                    Button("Confirm") {}
                        .buttonStyle(.borderedProminent)
                }
            }
            .padding(20)
            .background(.background, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .padding(26)
        }
    }
}

#Preview { ContentView() }
`;
    case "progress-bar":
      return `import SwiftUI

struct ContentView: View {
    private let progress = 0.58

    var body: some View {
        VStack(spacing: 14) {
            Text("Upload")
                .font(.system(size: 21, weight: .black, design: .rounded))

            ZStack(alignment: .leading) {
                Capsule().fill(.secondary.opacity(0.25)).frame(height: 12)
                Capsule().fill(.blue).frame(width: 220, height: 12)
            }
            .frame(width: 380)

            Text("58% complete")
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
    case "radio-group":
      return `import SwiftUI

struct ContentView: View {
    @State private var selected = 1

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(0..<3, id: \\.self) { index in
                HStack {
                    Image(systemName: selected == index ? "largecircle.fill.circle" : "circle")
                        .foregroundStyle(selected == index ? Color.blue : Color.secondary)
                        .onTapGesture { selected = index }
                    Text(["Weekly", "Monthly", "Yearly"][index])
                    Spacer()
                }
                .font(.system(size: 16, weight: .semibold, design: .rounded))
            }
        }
        .padding(18)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .padding(20)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
    case "segmented-control":
      return `import SwiftUI

struct ContentView: View {
    @State private var selected = 0
    private let labels = ["Overview", "Files", "Team"]

    var body: some View {
        VStack(spacing: 16) {
            Picker("View", selection: $selected) {
                ForEach(0..<labels.count, id: \\.self) { index in
                    Text(labels[index]).tag(index)
                }
            }
            .pickerStyle(.segmented)

            Text("Selected: \(labels[selected])")
                .foregroundStyle(.secondary)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
    case "slider":
      return `import SwiftUI

struct ContentView: View {
    @State private var value = 42.0

    var body: some View {
        VStack(spacing: 16) {
            Slider(value: $value, in: 0...100)
            Text("Value: \(Int(value))")
                .font(.system(size: 22, weight: .black, design: .rounded))
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
    case "text-input":
      return `import SwiftUI

struct ContentView: View {
    @State private var text = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Notes")
                .font(.system(size: 18, weight: .bold, design: .rounded))

            TextEditor(text: $text)
                .frame(height: 180)
                .padding(10)
                .background(.background, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(.secondary.opacity(0.3), lineWidth: 1)
                )
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
    default:
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color(.systemGroupedBackground).ignoresSafeArea()
            Text("${toTitleCase(slug)}")
                .font(.system(size: 28, weight: .black, design: .rounded))
        }
    }
}

#Preview { ContentView() }
`;
  }
}

async function fetchHtml(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

async function fetchArrayBuffer(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  await mkdir(COPYCAT_ROOT, { recursive: true });
  await mkdir(RESEARCH_ROOT, { recursive: true });
  await mkdir(SEED_CODE_ROOT, { recursive: true });

  const sitemapXml = await fetchHtml(`${BASE_URL}/sitemap.xml`);
  const componentSlugs = parseComponentSlugsFromSitemap(sitemapXml);

  const sourceComponents: SourceComponent[] = [];

  for (const slug of componentSlugs) {
    const url = `${BASE_URL}/docs/components/${slug}`;
    const html = await fetchHtml(url);
    const title = extractTitle(html, slug);
    const description = extractDescription(html);
    const previewPath = extractPreviewPath(html);
    const sourceCode = extractSourceCode(html, slug);

    sourceComponents.push({
      slug,
      url,
      title,
      description,
      previewPath,
      sourceCode,
      pageHtml: html,
    });
  }

  const portItems: PortItem[] = sourceComponents.map((component, index) => {
    const numericId = START_ID + index;
    const id = String(numericId).padStart(3, "0");
    const categoryName = categoryBySlug[component.slug] ?? "Forms";

    return {
      id,
      numericId,
      slug: component.slug,
      sourceTitle: component.title,
      sourceDescription: component.description,
      sourceUrl: component.url,
      sourcePreviewPath: component.previewPath,
      categoryName,
      pattern: patternByCategory[categoryName],
      seed: START_SEED + index,
      folderName: `${id}-${component.slug}`,
      seedTitle: sanitizeForSeedTitle(component.title, component.slug),
      summary: buildSummary(component.slug, categoryName),
      description: buildSeedDescription(component.slug, categoryName, component.description),
      changelog:
        "Rewritten from ComponentsKit research with custom SwiftUI implementation and simulator captures.",
      featured: false,
    };
  });

  await writeFile(path.join(COPYCAT_ROOT, "source-posts-raw.json"), `${JSON.stringify(sourceComponents, null, 2)}\n`);
  await writeFile(path.join(COPYCAT_ROOT, "source-posts-free.json"), `${JSON.stringify(sourceComponents, null, 2)}\n`);
  await writeFile(path.join(COPYCAT_ROOT, "source-port-manifest.json"), `${JSON.stringify(portItems, null, 2)}\n`);

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
      site: "componentskit.io",
      url: item.sourceUrl,
    },
  }));

  await writeFile(
    path.join(SEED_CODE_ROOT, "componentskit-port-components.json"),
    `${JSON.stringify(seedManifest, null, 2)}\n`
  );

  for (const item of portItems) {
    const component = sourceComponents.find((entry) => entry.slug === item.slug);
    if (!component) continue;

    const copycatComponentDir = path.join(COPYCAT_ROOT, item.folderName);
    const researchComponentDir = path.join(RESEARCH_ROOT, item.folderName);

    await mkdir(copycatComponentDir, { recursive: true });
    await mkdir(path.join(researchComponentDir, "original"), { recursive: true });
    await mkdir(path.join(researchComponentDir, "framed"), { recursive: true });

    await writeFile(
      path.join(copycatComponentDir, "source-metadata.json"),
      `${JSON.stringify(
        {
          source: {
            slug: component.slug,
            title: component.title,
            description: component.description,
            url: component.url,
            previewPath: component.previewPath,
          },
          port: item,
        },
        null,
        2
      )}\n`
    );

    await writeFile(path.join(copycatComponentDir, "source-code.swift"), component.sourceCode, "utf8");
    await writeFile(path.join(copycatComponentDir, "source-page.html"), component.pageHtml, "utf8");
    await writeFile(path.join(copycatComponentDir, "preview-url.txt"), `${component.previewPath ?? ""}\n`, "utf8");

    if (component.previewPath) {
      const fullPreviewUrl = `${BASE_URL}${component.previewPath}`;
      const previewData = await fetchArrayBuffer(fullPreviewUrl);
      if (previewData) {
        const ext = path.extname(component.previewPath) || ".webp";
        await writeFile(path.join(copycatComponentDir, `source-preview${ext}`), previewData);
      }
    }

    const rewrittenSwift = renderComponentSwift(item.slug);
    await writeFile(path.join(researchComponentDir, "content.swift"), rewrittenSwift, "utf8");
  }

  console.log(`ComponentsKit components extracted: ${sourceComponents.length}`);
  console.log(`Prepared for porting: ${portItems.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
