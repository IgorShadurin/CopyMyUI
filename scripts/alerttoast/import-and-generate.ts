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
  key: string;
  slug: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourcePreviewUrl: string;
  sourceSnippet: string;
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
const SITE = "alerttoast";
const COPYCAT_ROOT = path.join(ROOT, "public", "uploads", `copycat-${SITE}`);
const RESEARCH_ROOT = path.join(ROOT, "public", "uploads", "research");
const SEED_CODE_ROOT = path.join(ROOT, "prisma", "seed-code");

const REPO_URL = "https://github.com/elai950/AlertToast";
const README_URL = `${REPO_URL}/blob/master/README.md`;
const SOURCE_URL = `${REPO_URL}/blob/master/Sources/AlertToast/AlertToast.swift`;
const PREVIEW_TOAST_GIF =
  "https://raw.githubusercontent.com/elai950/AlertToast/master/Assets/ToastExample.gif";
const PREVIEW_ONBOARDING =
  "https://raw.githubusercontent.com/elai950/AlertToast/master/Assets/onboarding.png";
const START_SEED = 700;

const categoryName: CategoryName = "Forms";
const pattern: SeedPattern = "feedbackSteps";

const sourceItems: SourceItem[] = [
  {
    key: "alert-mode",
    slug: "alert-toast-alert-mode",
    title: "Alert Toast Center Mode",
    summary: "Centered modal toast inspired by AlertToast displayMode.alert.",
    sourceUrl: README_URL,
    sourcePreviewUrl: PREVIEW_TOAST_GIF,
    sourceSnippet:
      "DisplayMode.alert with AlertToast(type: .regular, title:, subTitle:).",
  },
  {
    key: "hud-mode",
    slug: "alert-toast-hud-mode",
    title: "Alert Toast HUD Mode",
    summary: "Top capsule HUD toast inspired by AlertToast displayMode.hud.",
    sourceUrl: SOURCE_URL,
    sourcePreviewUrl: PREVIEW_TOAST_GIF,
    sourceSnippet: "DisplayMode.hud with compact capsule layout and icon/text row.",
  },
  {
    key: "banner-slide-mode",
    slug: "alert-toast-banner-slide-mode",
    title: "Alert Toast Banner Slide Mode",
    summary: "Bottom slide banner toast inspired by AlertToast banner(.slide).",
    sourceUrl: SOURCE_URL,
    sourcePreviewUrl: PREVIEW_TOAST_GIF,
    sourceSnippet: "DisplayMode.banner(.slide) with bottom aligned message surface.",
  },
  {
    key: "banner-pop-mode",
    slug: "alert-toast-banner-pop-mode",
    title: "Alert Toast Banner Pop Mode",
    summary: "Bottom pop banner toast inspired by AlertToast banner(.pop).",
    sourceUrl: SOURCE_URL,
    sourcePreviewUrl: PREVIEW_TOAST_GIF,
    sourceSnippet: "DisplayMode.banner(.pop) with floating card-style pop transition.",
  },
  {
    key: "complete-type",
    slug: "alert-toast-complete-type",
    title: "Alert Toast Complete Type",
    summary: "Success toast with completion icon inspired by AlertToast complete type.",
    sourceUrl: SOURCE_URL,
    sourcePreviewUrl: PREVIEW_ONBOARDING,
    sourceSnippet: "AlertType.complete(Color) success state with completion checkmark.",
  },
  {
    key: "error-type",
    slug: "alert-toast-error-type",
    title: "Alert Toast Error Type",
    summary: "Error toast with failure icon inspired by AlertToast error type.",
    sourceUrl: SOURCE_URL,
    sourcePreviewUrl: PREVIEW_ONBOARDING,
    sourceSnippet: "AlertType.error(Color) failure state with xmark symbol.",
  },
  {
    key: "system-image-type",
    slug: "alert-toast-system-image-type",
    title: "Alert Toast System Image Type",
    summary: "System symbol toast inspired by AlertToast systemImage type.",
    sourceUrl: SOURCE_URL,
    sourcePreviewUrl: PREVIEW_TOAST_GIF,
    sourceSnippet: "AlertType.systemImage(name,color) using SF Symbols.",
  },
  {
    key: "image-type",
    slug: "alert-toast-image-type",
    title: "Alert Toast Image Type",
    summary: "Custom image toast inspired by AlertToast image type.",
    sourceUrl: SOURCE_URL,
    sourcePreviewUrl: PREVIEW_ONBOARDING,
    sourceSnippet: "AlertType.image(name,color) using asset image presentation.",
  },
  {
    key: "loading-type",
    slug: "alert-toast-loading-type",
    title: "Alert Toast Loading Type",
    summary: "Loading toast with spinner inspired by AlertToast loading type.",
    sourceUrl: SOURCE_URL,
    sourcePreviewUrl: PREVIEW_TOAST_GIF,
    sourceSnippet: "AlertType.loading with indefinite progress indicator behavior.",
  },
  {
    key: "custom-style",
    slug: "alert-toast-custom-style",
    title: "Alert Toast Custom Style",
    summary: "Styled toast inspired by AlertStyle customization in AlertToast.",
    sourceUrl: SOURCE_URL,
    sourcePreviewUrl: PREVIEW_ONBOARDING,
    sourceSnippet: "AlertStyle(backgroundColor,titleColor,subTitleColor,titleFont,subTitleFont).",
  },
];

function escapeSwift(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function renderToastCard(
  title: string,
  subtitle: string,
  icon: string,
  iconColor: string,
  cardStyle = ".ultraThinMaterial"
) {
  return `HStack(spacing: 12) {
                Image(systemName: "${icon}")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(${iconColor})

                VStack(alignment: .leading, spacing: 2) {
                    Text("${escapeSwift(title)}")
                        .font(.system(size: 15, weight: .bold, design: .rounded))
                    Text("${escapeSwift(subtitle)}")
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }
            .padding(14)
            .frame(maxWidth: .infinity)
            .background(${cardStyle}, in: RoundedRectangle(cornerRadius: 16, style: .continuous))`;
}

function renderComponentSwift(item: SourceItem) {
  switch (item.key) {
    case "alert-mode":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.blue.opacity(0.08), Color.clear],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 22) {
                Text("Centered toast presentation")
                    .font(.system(size: 26, weight: .black, design: .rounded))
                    .frame(maxWidth: .infinity, alignment: .leading)

                Spacer()

                ${renderToastCard("Message sent", "Your note was delivered successfully.", "paperplane.fill", "Color.accentColor")}
                    .frame(maxWidth: 320)

                Spacer()
            }
            .padding(24)
        }
    }
}

#Preview { ContentView() }
`;
    case "hud-mode":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack(alignment: .top) {
            Color(.systemBackground).ignoresSafeArea()

            VStack(alignment: .leading, spacing: 14) {
                Text("HUD toast presentation")
                    .font(.system(size: 26, weight: .black, design: .rounded))
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text("Compact top message surface.")
                    .foregroundStyle(.secondary)
                Spacer()
            }
            .padding(24)

            HStack(spacing: 10) {
                Image(systemName: "checkmark.seal.fill")
                    .foregroundStyle(Color.green)
                Text("Saved to your library")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 10)
            .background(.ultraThinMaterial, in: Capsule())
            .overlay(Capsule().stroke(Color.gray.opacity(0.2), lineWidth: 1))
            .padding(.top, 70)
            .padding(.horizontal, 24)
        }
    }
}

#Preview { ContentView() }
`;
    case "banner-slide-mode":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack(alignment: .bottom) {
            Color(.systemBackground).ignoresSafeArea()

            VStack(alignment: .leading, spacing: 12) {
                Text("Banner slide presentation")
                    .font(.system(size: 26, weight: .black, design: .rounded))
                Text("Bottom-aligned toast that feels like a slide-in message.")
                    .foregroundStyle(.secondary)
                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(24)

            ${renderToastCard("Connection unstable", "We will retry in the background.", "wifi.exclamationmark", "Color.orange")}
                .padding(.horizontal, 18)
                .padding(.bottom, 18)
        }
    }
}

#Preview { ContentView() }
`;
    case "banner-pop-mode":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack(alignment: .bottom) {
            Color(.systemBackground).ignoresSafeArea()

            VStack(alignment: .leading, spacing: 12) {
                Text("Banner pop presentation")
                    .font(.system(size: 26, weight: .black, design: .rounded))
                Text("Floating bottom toast with more visual elevation.")
                    .foregroundStyle(.secondary)
                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(24)

            ${renderToastCard("Profile updated", "Your latest changes are now visible.", "person.crop.circle.badge.checkmark", "Color.blue")}
                .padding(.horizontal, 26)
                .padding(.bottom, 30)
                .shadow(color: Color.black.opacity(0.14), radius: 18, x: 0, y: 10)
        }
    }
}

#Preview { ContentView() }
`;
    case "complete-type":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()

            VStack(spacing: 16) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 46, weight: .bold))
                    .foregroundStyle(Color.green)
                Text("Upload complete")
                    .font(.system(size: 24, weight: .black, design: .rounded))
                Text("All files were synced successfully.")
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding(24)
            .frame(maxWidth: 300)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
    }
}

#Preview { ContentView() }
`;
    case "error-type":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()

            VStack(spacing: 16) {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 46, weight: .bold))
                    .foregroundStyle(Color.red)
                Text("Action failed")
                    .font(.system(size: 24, weight: .black, design: .rounded))
                Text("Please check your connection and try again.")
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding(24)
            .frame(maxWidth: 300)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
    }
}

#Preview { ContentView() }
`;
    case "system-image-type":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()

            ${renderToastCard("Reminder created", "Check it later in your schedule.", "bell.badge.fill", "Color.indigo")}
                .padding(24)
        }
    }
}

#Preview { ContentView() }
`;
    case "image-type":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()

            HStack(spacing: 12) {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [Color.pink, Color.orange],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 34, height: 34)
                    .overlay(
                        Image(systemName: "photo.fill")
                            .foregroundStyle(Color.white)
                    )

                VStack(alignment: .leading, spacing: 2) {
                    Text("Artwork ready")
                        .font(.system(size: 15, weight: .bold, design: .rounded))
                    Text("Preview image has been attached.")
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }
            .padding(14)
            .frame(maxWidth: .infinity)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .padding(24)
        }
    }
}

#Preview { ContentView() }
`;
    case "loading-type":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()

            VStack(spacing: 14) {
                ProgressView()
                    .scaleEffect(1.3)
                Text("Syncing data")
                    .font(.system(size: 20, weight: .black, design: .rounded))
                Text("Please keep this screen open.")
                    .foregroundStyle(.secondary)
            }
            .padding(24)
            .frame(maxWidth: 280)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
    }
}

#Preview { ContentView() }
`;
    case "custom-style":
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()

            HStack(spacing: 12) {
                Image(systemName: "sparkles")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(Color.white)

                VStack(alignment: .leading, spacing: 4) {
                    Text("Theme applied")
                        .font(.system(size: 16, weight: .black, design: .rounded))
                        .foregroundStyle(Color.white)
                    Text("Brand palette and typography are now active.")
                        .font(.system(size: 12, weight: .medium, design: .rounded))
                        .foregroundStyle(Color.white.opacity(0.88))
                }

                Spacer()
            }
            .padding(14)
            .frame(maxWidth: .infinity)
            .background(
                LinearGradient(
                    colors: [Color(red: 0.15, green: 0.24, blue: 0.62), Color(red: 0.44, green: 0.20, blue: 0.66)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ),
                in: RoundedRectangle(cornerRadius: 16, style: .continuous)
            )
            .padding(24)
        }
    }
}

#Preview { ContentView() }
`;
    default:
      return `import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("${escapeSwift(item.title)}")
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(.systemBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
  }
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
    const numeric = Number(match[1]);
    if (Number.isFinite(numeric) && numeric > max) {
      max = numeric;
    }
  }

  return max + 1;
}

async function main() {
  await mkdir(COPYCAT_ROOT, { recursive: true });
  await mkdir(RESEARCH_ROOT, { recursive: true });
  await mkdir(SEED_CODE_ROOT, { recursive: true });

  const startId = await nextResearchNumericId();
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
      categoryName,
      pattern,
      seed: START_SEED + index,
      folderName: `${id}-${item.slug}`,
      seedTitle: item.title,
      summary: `${item.summary} Rewritten for CopyMyUI with adaptive light and dark styling.`,
      description: `${item.title} is a rewritten SwiftUI toast pattern inspired by AlertToast. It keeps the interaction intent while using a fresh implementation for CopyMyUI.`,
      changelog:
        "Rewritten from AlertToast research source with custom SwiftUI implementation and simulator captures.",
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
    path.join(SEED_CODE_ROOT, "alerttoast-port-components.json"),
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

    await writeFile(path.join(researchDir, "content.swift"), renderComponentSwift(source), "utf8");
  }

  console.log(`AlertToast components prepared: ${portItems.length}`);
  console.log(`AlertToast start ID: ${String(startId).padStart(3, "0")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
