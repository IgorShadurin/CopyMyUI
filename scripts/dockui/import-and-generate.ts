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

type DockuiPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  isPremium: boolean;
  post_type: string;
  code_snippet: string;
  preview_image_url: string;
  created_at: string;
};

type PortItem = {
  id: string;
  numericId: number;
  slug: string;
  sourceTitle: string;
  sourceDescription: string;
  sourcePostType: string;
  sourceId: string;
  sourcePreviewImageUrl: string;
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
const COPYCAT_ROOT = path.join(ROOT, "public", "uploads", "copycat");
const RESEARCH_ROOT = path.join(ROOT, "public", "uploads", "research");
const SEED_CODE_ROOT = path.join(ROOT, "prisma", "seed-code");

const SUPABASE_URL = "https://dwxfipenxnqkhgtwggrv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3eGZpcGVueG5xa2hndHdnZ3J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwNjU4OTMsImV4cCI6MjA0MzY0MTg5M30.0mg37FPNXhj0drM0TFSlSzpl2Ofc7nyaHqOTnobvjac";

const categoryBySlug: Record<string, CategoryName> = {
  "account-alert": "Forms",
  "account-deletion-confirmation": "Forms",
  "battery-widget-view": "Dashboards",
  "creator-revenue-analytics": "Dashboards",
  "daily-streak-view": "Social",
  "ig-story-bubbles": "Social",
  "movie-theater-seat-view": "Commerce",
  "music-player": "Media",
  "navigation-widget-view": "Navigation",
  "notification-center-view": "Social",
  "order-confirmation-screen": "Commerce",
  "order-history-view": "Commerce",
  "order-tracker": "Commerce",
  "order-tracking": "Commerce",
  "sales-dashboard": "Dashboards",
  "shop-checkout": "Commerce",
  "shopping-cart-view": "Commerce",
  "stacked-images": "Media",
  "subscription-plan-view": "Paywall",
  "success-alert-view": "Forms",
  "travel-destination-view": "Media",
  "user-achievements-badges": "Social",
  "user-profile-card": "Social",
  "weather-app-forecast": "Dashboards",
  "weather-widget": "Dashboards",
  "wrapped-stats": "Dashboards",
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

function toSentence(input: string) {
  return input
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sourcePreviewExtension(url: string) {
  const pathname = new URL(url).pathname;
  const base = path.basename(pathname);
  const extension = path.extname(base).toLowerCase();
  if (extension === ".png" || extension === ".jpg" || extension === ".jpeg" || extension === ".webp") {
    return extension;
  }
  return ".png";
}

function rewriteTitle(slug: string, sourceTitle: string) {
  const cleaned = sourceTitle.replace(/\s+/g, " ").trim();

  if (slug === "weather-widget") {
    return "Forecast Snapshot Widget";
  }
  if (slug === "wrapped-stats") {
    return "Yearly Listening Wrap";
  }
  if (slug === "creator-revenue-analytics") {
    return "Creator Earnings Board";
  }

  return cleaned;
}

function buildSummary(slug: string, categoryName: CategoryName) {
  const readable = toSentence(slug);

  return `${readable} rebuilt as a ${categoryName.toLowerCase()} SwiftUI component with adaptive light and dark styling.`;
}

function buildDescription(slug: string, categoryName: CategoryName, sourceDescription: string) {
  const normalized = sourceDescription.replace(/\s+/g, " ").trim();
  const firstSentence = normalized.split(/[.!?]/)[0] ?? normalized;

  return `${toSentence(slug)} is a rewritten ${categoryName.toLowerCase()} surface for CopyMyUI. It keeps the same product intent while using new structure, spacing, and styling. Source intent: ${firstSentence}.`;
}

async function fetchPosts() {
  const url =
    `${SUPABASE_URL}/rest/v1/posts` +
    "?select=id,slug,title,description,isPremium,post_type,code_snippet,preview_image_url,created_at" +
    "&public=eq.true&status=eq.published&order=created_at.desc";

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`DockUI fetch failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as DockuiPost[];
  return payload;
}

function buildPortItems(posts: DockuiPost[]) {
  const free = posts.filter((post) => !post.isPremium);
  const filtered = free.filter((post) => post.slug !== "revenue-card");
  const sorted = [...filtered].sort((a, b) => a.slug.localeCompare(b.slug));

  return sorted.map<PortItem>((post, index) => {
    const numericId = index + 2;
    const id = String(numericId).padStart(3, "0");
    const categoryName = categoryBySlug[post.slug] ?? "Dashboards";
    const seedTitle = rewriteTitle(post.slug, post.title);

    return {
      id,
      numericId,
      slug: post.slug,
      sourceTitle: post.title,
      sourceDescription: post.description,
      sourcePostType: post.post_type,
      sourceId: post.id,
      sourcePreviewImageUrl: post.preview_image_url,
      categoryName,
      pattern: patternByCategory[categoryName],
      seed: 29 + numericId,
      folderName: `${id}-${post.slug}`,
      seedTitle,
      summary: buildSummary(post.slug, categoryName),
      description: buildDescription(post.slug, categoryName, post.description),
      changelog:
        "Rewritten from the DockUI research source with fresh SwiftUI code and simulator-based light/dark captures.",
      featured: false,
    };
  });
}

function shellEscapeSwift(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function renderWidgetTemplate(
  title: string,
  subtitle: string,
  icon: string,
  accentHex: string,
  value: string,
  footerLeft: string,
  footerRight: string
) {
  return `import SwiftUI

struct ContentView: View {
    @Environment(\\.colorScheme) private var colorScheme

    private var accent: Color {
        Color(hex: "${accentHex}")
    }

    private var cardFill: Color {
        colorScheme == .dark ? Color.white.opacity(0.08) : Color.white
    }

    private var cardStroke: Color {
        colorScheme == .dark ? Color.white.opacity(0.12) : Color.black.opacity(0.08)
    }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: colorScheme == .dark
                    ? [Color.black, Color(red: 0.09, green: 0.09, blue: 0.11)]
                    : [Color.white, Color(red: 0.95, green: 0.97, blue: 1.0)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    ZStack {
                        Circle()
                            .fill(accent.opacity(0.18))
                            .frame(width: 42, height: 42)

                        Image(systemName: "${icon}")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundStyle(accent)
                    }

                    Spacer(minLength: 0)

                    Text("LIVE")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(accent)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 5)
                        .background(accent.opacity(0.14), in: Capsule())
                }

                Text("${shellEscapeSwift(title)}")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundStyle(.primary)

                Text("${shellEscapeSwift(subtitle)}")
                    .font(.system(size: 14, weight: .medium, design: .rounded))
                    .foregroundStyle(.secondary)

                Text("${shellEscapeSwift(value)}")
                    .font(.system(size: 36, weight: .black, design: .rounded))
                    .foregroundStyle(.primary)

                HStack {
                    Text("${shellEscapeSwift(footerLeft)}")
                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                        .foregroundStyle(.secondary)

                    Spacer(minLength: 0)

                    Text("${shellEscapeSwift(footerRight)}")
                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                        .foregroundStyle(accent)
                }

                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(.secondary.opacity(0.25))
                        .frame(height: 8)

                    Capsule()
                        .fill(accent)
                        .frame(width: 190, height: 8)
                }
            }
            .padding(22)
            .frame(width: 390)
            .background(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .fill(cardFill)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .stroke(cardStroke, lineWidth: 1)
            )
            .padding(.horizontal, 18)
        }
    }
}

private extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&value)

        let r = Double((value >> 16) & 0xFF) / 255
        let g = Double((value >> 8) & 0xFF) / 255
        let b = Double(value & 0xFF) / 255
        self.init(.sRGB, red: r, green: g, blue: b, opacity: 1)
    }
}

#Preview {
    ContentView()
}
`;
}

function renderAccountDeletionTemplate() {
  return `import SwiftUI

struct ContentView: View {
    @State private var confirmationText = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 22) {
                    ZStack {
                        Circle()
                            .fill(Color.red.opacity(0.18))
                            .frame(width: 88, height: 88)

                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 36, weight: .bold))
                            .foregroundStyle(.red)
                    }
                    .padding(.top, 16)

                    VStack(spacing: 8) {
                        Text("Delete account")
                            .font(.system(size: 30, weight: .black, design: .rounded))

                        Text("This permanently removes profile data, orders, and saved preferences.")
                            .font(.system(size: 15, weight: .medium, design: .rounded))
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                    }

                    VStack(alignment: .leading, spacing: 14) {
                        DangerRow(icon: "person.crop.circle.badge.xmark", text: "Profile and identity information")
                        DangerRow(icon: "tray.full.fill", text: "Purchase and activity history")
                        DangerRow(icon: "bell.slash.fill", text: "Notification and reminder settings")
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(18)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Type DELETE to continue")
                            .font(.system(size: 13, weight: .semibold, design: .rounded))
                            .foregroundStyle(.secondary)

                        TextField("DELETE", text: $confirmationText)
                            .textInputAutocapitalization(.characters)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 12)
                            .background(.background, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .stroke(.secondary.opacity(0.3), lineWidth: 1)
                            )
                    }

                    HStack(spacing: 12) {
                        Button("Cancel") {}
                            .buttonStyle(SoftActionButtonStyle(background: .secondary.opacity(0.12), foreground: .primary))

                        Button("Delete") {}
                            .buttonStyle(SoftActionButtonStyle(background: .red, foreground: .white))
                    }
                }
                .padding(20)
            }
            .background(
                LinearGradient(
                    colors: [Color.red.opacity(0.08), Color.orange.opacity(0.05), Color.clear],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            )
            .navigationTitle("Confirm action")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

private struct DangerRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(.red)
                .font(.system(size: 15, weight: .bold))
                .frame(width: 18)

            Text(text)
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(.primary)

            Spacer(minLength: 0)
        }
    }
}

private struct SoftActionButtonStyle: ButtonStyle {
    let background: Color
    let foreground: Color

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .bold, design: .rounded))
            .foregroundStyle(foreground)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(background.opacity(configuration.isPressed ? 0.84 : 1), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

#Preview {
    ContentView()
}
`;
}

function renderDashboardTemplate(
  title: string,
  subtitle: string,
  headline: string,
  accentHex: string
) {
  return `import SwiftUI

private struct MetricPoint: Identifiable {
    let id: Int
    let value: Double
}

struct ContentView: View {
    @Environment(\\.colorScheme) private var colorScheme

    private let points: [MetricPoint] = (0..<12).map { index in
        let wave = sin(Double(index) * 0.7) * 8
        let climb = Double(index) * 3.2
        return MetricPoint(id: index, value: max(8, 22 + climb + wave))
    }

    private var accent: Color {
        Color(hex: "${accentHex}")
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("${shellEscapeSwift(title)}")
                    .font(.system(size: 28, weight: .black, design: .rounded))

                Text("${shellEscapeSwift(subtitle)}")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)

                HStack(spacing: 12) {
                    StatCard(title: "Revenue", value: "${shellEscapeSwift(headline)}", accent: accent)
                    StatCard(title: "Growth", value: "+12.8%", accent: .green)
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text("Performance")
                        .font(.system(size: 15, weight: .bold, design: .rounded))
                        .foregroundStyle(.secondary)

                    GeometryReader { proxy in
                        HStack(alignment: .bottom, spacing: 8) {
                            ForEach(points) { point in
                                RoundedRectangle(cornerRadius: 6, style: .continuous)
                                    .fill(accent.opacity(colorScheme == .dark ? 0.82 : 0.72))
                                    .frame(height: CGFloat(point.value / 70.0) * max(proxy.size.height, 1))
                            }
                        }
                    }
                    .frame(height: 140)
                }
                .padding(16)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))

                VStack(spacing: 12) {
                    TrendRow(label: "Subscriptions", amount: "$4,240", delta: "+9%")
                    TrendRow(label: "One-time sales", amount: "$1,380", delta: "+4%")
                    TrendRow(label: "Refund rate", amount: "1.3%", delta: "-0.5%")
                }
                .padding(16)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            }
            .padding(20)
        }
        .background(
            LinearGradient(
                colors: colorScheme == .dark
                    ? [Color.black, Color(red: 0.09, green: 0.1, blue: 0.13)]
                    : [Color.white, Color(red: 0.95, green: 0.97, blue: 1.0)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
    }
}

private struct StatCard: View {
    let title: String
    let value: String
    let accent: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.system(size: 13, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)

            Text(value)
                .font(.system(size: 24, weight: .black, design: .rounded))
                .foregroundStyle(.primary)

            Capsule()
                .fill(accent.opacity(0.26))
                .frame(width: 72, height: 6)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

private struct TrendRow: View {
    let label: String
    let amount: String
    let delta: String

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                Text(amount)
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundStyle(.secondary)
            }

            Spacer(minLength: 0)

            Text(delta)
                .font(.system(size: 13, weight: .bold, design: .rounded))
                .foregroundStyle(delta.hasPrefix("-") ? .red : .green)
        }
    }
}

private extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&value)
        self.init(
            .sRGB,
            red: Double((value >> 16) & 0xFF) / 255,
            green: Double((value >> 8) & 0xFF) / 255,
            blue: Double(value & 0xFF) / 255,
            opacity: 1
        )
    }
}

#Preview {
    ContentView()
}
`;
}

function renderStreakTemplate() {
  return `import SwiftUI

struct ContentView: View {
    private let days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    private let completed = Set([0, 1, 2, 3, 4, 5])

    var body: some View {
        VStack(spacing: 18) {
            Spacer(minLength: 10)

            ZStack {
                Circle()
                    .fill(Color.orange.opacity(0.22))
                    .frame(width: 110, height: 110)

                Image(systemName: "flame.fill")
                    .font(.system(size: 54))
                    .foregroundStyle(
                        LinearGradient(colors: [.orange, .yellow], startPoint: .top, endPoint: .bottom)
                    )
            }

            Text("67")
                .font(.system(size: 76, weight: .black, design: .rounded))
                .foregroundStyle(.orange)

            Text("day streak")
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundStyle(.orange)

            HStack(spacing: 12) {
                ForEach(Array(days.enumerated()), id: \\.offset) { index, day in
                    VStack(spacing: 8) {
                        Text(day)
                            .font(.system(size: 12, weight: .bold, design: .rounded))
                            .foregroundStyle(.secondary)

                        Circle()
                            .fill(completed.contains(index) ? Color.orange : Color.secondary.opacity(0.25))
                            .frame(width: 30, height: 30)
                            .overlay {
                                if completed.contains(index) {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundStyle(.white)
                                }
                            }
                    }
                }
            }
            .padding(.vertical, 8)

            Text("You extended your streak today.")
                .font(.system(size: 15, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)

            Spacer(minLength: 10)
        }
        .padding(22)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}

#Preview {
    ContentView()
}
`;
}

function renderStoryTemplate() {
  return `import SwiftUI

private struct Story: Identifiable {
    let id = UUID()
    let name: String
    let colors: [Color]
}

struct ContentView: View {
    private let stories: [Story] = [
        Story(name: "Mia", colors: [.pink, .orange]),
        Story(name: "Ryo", colors: [.purple, .blue]),
        Story(name: "Nora", colors: [.teal, .mint]),
        Story(name: "Ava", colors: [.indigo, .cyan]),
        Story(name: "Leo", colors: [.red, .orange]),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Stories")
                .font(.system(size: 30, weight: .black, design: .rounded))

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 14) {
                    ForEach(stories) { story in
                        VStack(spacing: 8) {
                            ZStack {
                                Circle()
                                    .fill(
                                        LinearGradient(colors: story.colors, startPoint: .topLeading, endPoint: .bottomTrailing)
                                    )
                                    .frame(width: 84, height: 84)

                                Circle()
                                    .fill(.background)
                                    .frame(width: 76, height: 76)

                                Circle()
                                    .fill(
                                        LinearGradient(colors: story.colors.map { $0.opacity(0.4) }, startPoint: .top, endPoint: .bottom)
                                    )
                                    .frame(width: 70, height: 70)
                            }

                            Text(story.name)
                                .font(.system(size: 13, weight: .bold, design: .rounded))
                        }
                    }
                }
                .padding(.horizontal, 2)
            }
        }
        .padding(22)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}

#Preview {
    ContentView()
}
`;
}

function renderSeatTemplate() {
  return `import SwiftUI

struct ContentView: View {
    @State private var selected: Set<Int> = [6, 7, 8]

    private let seats = Array(0..<40)

    var body: some View {
        VStack(spacing: 20) {
            Text("Choose your seats")
                .font(.system(size: 30, weight: .black, design: .rounded))

            Text("Row C • 7:30 PM")
                .font(.system(size: 15, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)

            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(.blue.opacity(0.25))
                .frame(height: 14)
                .overlay {
                    Text("SCREEN")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundStyle(.blue)
                }
                .padding(.horizontal, 40)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 8), spacing: 10) {
                ForEach(seats, id: \\.self) { seat in
                    let isSelected = selected.contains(seat)

                    RoundedRectangle(cornerRadius: 6, style: .continuous)
                        .fill(isSelected ? Color.blue : Color.secondary.opacity(0.25))
                        .frame(height: 24)
                        .onTapGesture {
                            if isSelected {
                                selected.remove(seat)
                            } else {
                                selected.insert(seat)
                            }
                        }
                }
            }
            .padding(.horizontal, 20)

            HStack {
                Text("3 seats")
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                Spacer(minLength: 0)
                Text("$42.00")
                    .font(.system(size: 20, weight: .black, design: .rounded))
            }
            .padding(.horizontal, 22)

            Button("Continue") {}
                .font(.system(size: 17, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(.blue, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                .padding(.horizontal, 22)

            Spacer(minLength: 10)
        }
        .padding(.top, 18)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}

#Preview {
    ContentView()
}
`;
}

function renderMusicTemplate() {
  return `import SwiftUI

struct ContentView: View {
    @State private var progress: Double = 0.36
    @State private var volume: Double = 0.64

    var body: some View {
        NavigationStack {
            VStack(spacing: 28) {
                RoundedRectangle(cornerRadius: 30, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [.purple.opacity(0.65), .blue.opacity(0.55)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay {
                        Image(systemName: "music.note.list")
                            .font(.system(size: 78, weight: .medium))
                            .foregroundStyle(.white.opacity(0.84))
                    }
                    .frame(width: 280, height: 280)
                    .shadow(color: .black.opacity(0.2), radius: 16, y: 8)

                VStack(spacing: 4) {
                    Text("Night Drive")
                        .font(.system(size: 28, weight: .black, design: .rounded))

                    Text("Luna Archive")
                        .font(.system(size: 16, weight: .semibold, design: .rounded))
                        .foregroundStyle(.secondary)
                }

                VStack(spacing: 8) {
                    Slider(value: $progress)
                    HStack {
                        Text("1:18")
                        Spacer(minLength: 0)
                        Text("3:34")
                    }
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundStyle(.secondary)
                }
                .padding(.horizontal, 26)

                HStack(spacing: 34) {
                    Image(systemName: "backward.fill")
                    Image(systemName: "play.fill")
                        .padding(18)
                        .background(.blue, in: Circle())
                        .foregroundStyle(.white)
                    Image(systemName: "forward.fill")
                }
                .font(.system(size: 30, weight: .bold))

                HStack(spacing: 10) {
                    Image(systemName: "speaker.fill")
                    Slider(value: $volume)
                    Image(systemName: "speaker.wave.3.fill")
                }
                .padding(.horizontal, 26)

                Spacer(minLength: 6)
            }
            .padding(.top, 24)
            .background(
                LinearGradient(
                    colors: [Color.purple.opacity(0.14), Color.blue.opacity(0.08), Color.clear],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            )
            .navigationTitle("Now Playing")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

#Preview {
    ContentView()
}
`;
}

function renderNavigationTemplate() {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color(.systemGroupedBackground)
                .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    Image(systemName: "location.north.line.fill")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundStyle(.blue)

                    Spacer(minLength: 0)

                    Text("12:45")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundStyle(.secondary)
                }

                Text("Turn left onto Pine Street")
                    .font(.system(size: 28, weight: .black, design: .rounded))

                HStack(spacing: 16) {
                    TripMetric(title: "Distance", value: "167 m")
                    TripMetric(title: "ETA", value: "9 min")
                    TripMetric(title: "Arrival", value: "6:30 PM")
                }

                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(.secondary.opacity(0.25))
                        .frame(height: 8)

                    Capsule()
                        .fill(.blue)
                        .frame(width: 220, height: 8)
                }
            }
            .padding(22)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .stroke(.white.opacity(0.3), lineWidth: 1)
            )
            .padding(.horizontal, 18)
        }
    }
}

private struct TripMetric: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(title)
                .font(.system(size: 12, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundStyle(.primary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

#Preview {
    ContentView()
}
`;
}

function renderListTemplate(title: string, rows: Array<{ icon: string; text: string; meta: string }>) {
  const rowCode = rows
    .map(
      (row) =>
        `NotificationRow(icon: "${row.icon}", text: "${shellEscapeSwift(row.text)}", meta: "${shellEscapeSwift(row.meta)}")`
    )
    .join(",\n                    ");

  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 12) {
                    ForEach([
                    ${rowCode}
                    ]) { item in
                        HStack(spacing: 12) {
                            ZStack {
                                Circle()
                                    .fill(.blue.opacity(0.14))
                                    .frame(width: 38, height: 38)

                                Image(systemName: item.icon)
                                    .foregroundStyle(.blue)
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                Text(item.text)
                                    .font(.system(size: 15, weight: .semibold, design: .rounded))
                                Text(item.meta)
                                    .font(.system(size: 12, weight: .medium, design: .rounded))
                                    .foregroundStyle(.secondary)
                            }

                            Spacer(minLength: 0)
                        }
                        .padding(14)
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    }
                }
                .padding(20)
            }
            .background(Color(.systemGroupedBackground).ignoresSafeArea())
            .navigationTitle("${shellEscapeSwift(title)}")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}

private struct NotificationRow: Identifiable {
    let id = UUID()
    let icon: String
    let text: String
    let meta: String
}

#Preview {
    ContentView()
}
`;
}

function renderOrderConfirmationTemplate() {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 18) {
            Spacer(minLength: 16)

            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.18))
                    .frame(width: 96, height: 96)

                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 52))
                    .foregroundStyle(.green)
            }

            Text("Order confirmed")
                .font(.system(size: 31, weight: .black, design: .rounded))

            Text("Your package is being prepared and will ship today.")
                .font(.system(size: 15, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            VStack(spacing: 10) {
                ReceiptRow(label: "Order number", value: "#A-12094")
                ReceiptRow(label: "Items", value: "3")
                ReceiptRow(label: "Total", value: "$124.99")
                ReceiptRow(label: "Delivery", value: "Tomorrow")
            }
            .padding(18)
            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .padding(.horizontal, 20)

            Button("Track shipment") {}
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(.blue, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                .padding(.horizontal, 20)

            Spacer(minLength: 12)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}

private struct ReceiptRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer(minLength: 0)
            Text(value)
                .font(.system(size: 15, weight: .bold, design: .rounded))
        }
    }
}

#Preview {
    ContentView()
}
`;
}

function renderOrderTrackerTemplate(title: string, subtitle: string) {
  return renderWidgetTemplate(title, subtitle, "shippingbox.fill", "1E88E5", "3 of 5 steps", "Courier: Tom", "Arrives in 15 min");
}

function renderCheckoutTemplate() {
  return `import SwiftUI

private struct CheckoutItem: Identifiable {
    let id = UUID()
    let name: String
    let details: String
    let price: String
}

struct ContentView: View {
    private let items: [CheckoutItem] = [
        CheckoutItem(name: "Plant Pot", details: "Large, sand", price: "$32"),
        CheckoutItem(name: "Leaf Spray", details: "250 ml", price: "$14"),
        CheckoutItem(name: "Plant Food", details: "Starter pack", price: "$9")
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 12) {
                    ForEach(items) { item in
                        HStack {
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .fill(.green.opacity(0.2))
                                .frame(width: 52, height: 52)
                                .overlay(Image(systemName: "leaf.fill").foregroundStyle(.green))

                            VStack(alignment: .leading, spacing: 3) {
                                Text(item.name)
                                    .font(.system(size: 15, weight: .bold, design: .rounded))
                                Text(item.details)
                                    .font(.system(size: 13, weight: .medium, design: .rounded))
                                    .foregroundStyle(.secondary)
                            }

                            Spacer(minLength: 0)

                            Text(item.price)
                                .font(.system(size: 16, weight: .black, design: .rounded))
                        }
                        .padding(14)
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    }

                    VStack(spacing: 8) {
                        SummaryRow(label: "Subtotal", value: "$55")
                        SummaryRow(label: "Delivery", value: "$6")
                        SummaryRow(label: "Total", value: "$61")
                    }
                    .padding(16)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))

                    Button("Complete purchase") {}
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(.green, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }
                .padding(20)
            }
            .background(Color(.systemGroupedBackground).ignoresSafeArea())
            .navigationTitle("Checkout")
        }
    }
}

private struct SummaryRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer(minLength: 0)
            Text(value)
                .font(.system(size: 15, weight: .bold, design: .rounded))
        }
    }
}

#Preview {
    ContentView()
}
`;
}

function renderCartTemplate() {
  return `import SwiftUI

private struct CartItem: Identifiable {
    let id = UUID()
    let name: String
    let count: Int
    let price: String
}

struct ContentView: View {
    private let items: [CartItem] = [
        CartItem(name: "Wireless Speaker", count: 1, price: "$89"),
        CartItem(name: "USB-C Cable", count: 2, price: "$24"),
        CartItem(name: "Desk Light", count: 1, price: "$42")
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 10) {
                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(items) { item in
                            HStack(spacing: 12) {
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .fill(.blue.opacity(0.15))
                                    .frame(width: 48, height: 48)
                                    .overlay(Image(systemName: "cart.fill").foregroundStyle(.blue))

                                VStack(alignment: .leading, spacing: 4) {
                                    Text(item.name)
                                        .font(.system(size: 15, weight: .bold, design: .rounded))
                                    Text("Qty \(item.count)")
                                        .font(.system(size: 13, weight: .medium, design: .rounded))
                                        .foregroundStyle(.secondary)
                                }

                                Spacer(minLength: 0)

                                Text(item.price)
                                    .font(.system(size: 16, weight: .black, design: .rounded))
                            }
                            .padding(14)
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                }

                VStack(spacing: 10) {
                    HStack {
                        Text("Total")
                            .foregroundStyle(.secondary)
                        Spacer(minLength: 0)
                        Text("$155")
                            .font(.system(size: 22, weight: .black, design: .rounded))
                    }

                    Button("Proceed to checkout") {}
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(.blue, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }
                .padding(20)
                .background(.thinMaterial)
            }
            .background(Color(.systemGroupedBackground).ignoresSafeArea())
            .navigationTitle("Your cart")
        }
    }
}

#Preview {
    ContentView()
}
`;
}

function renderStackedTemplate() {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.black.opacity(0.88), Color(red: 0.11, green: 0.11, blue: 0.14)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            ZStack {
                StackedCard(angle: -10, scale: 0.86, colors: [.purple, .blue])
                StackedCard(angle: -4, scale: 0.92, colors: [.pink, .orange])
                StackedCard(angle: 0, scale: 1.0, colors: [.teal, .mint])
            }
            .padding(24)
        }
    }
}

private struct StackedCard: View {
    let angle: Double
    let scale: CGFloat
    let colors: [Color]

    var body: some View {
        RoundedRectangle(cornerRadius: 28, style: .continuous)
            .fill(LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing))
            .frame(width: 300, height: 420)
            .overlay {
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .stroke(.white.opacity(0.26), lineWidth: 1)
            }
            .overlay(alignment: .bottomLeading) {
                Text("Gallery")
                    .font(.system(size: 30, weight: .black, design: .rounded))
                    .foregroundStyle(.white.opacity(0.9))
                    .padding(24)
            }
            .rotationEffect(.degrees(angle))
            .scaleEffect(scale)
            .shadow(color: .black.opacity(0.3), radius: 18, y: 12)
    }
}

#Preview {
    ContentView()
}
`;
}

function renderSubscriptionTemplate() {
  return `import SwiftUI

struct ContentView: View {
    @State private var selected = 1

    private let plans = [
        ("Starter", "$4.99/mo", "Basic tools"),
        ("Pro", "$9.99/mo", "All premium features"),
        ("Team", "$19.99/mo", "5 seats included"),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                Text("Choose your plan")
                    .font(.system(size: 32, weight: .black, design: .rounded))
                    .frame(maxWidth: .infinity, alignment: .leading)

                Text("Upgrade for unlimited exports, faster processing, and early access components.")
                    .font(.system(size: 15, weight: .medium, design: .rounded))
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)

                ForEach(Array(plans.enumerated()), id: \\.offset) { index, plan in
                    Button {
                        selected = index
                    } label: {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(plan.0)
                                    .font(.system(size: 18, weight: .bold, design: .rounded))
                                Text(plan.2)
                                    .font(.system(size: 13, weight: .medium, design: .rounded))
                                    .foregroundStyle(.secondary)
                            }

                            Spacer(minLength: 0)

                            Text(plan.1)
                                .font(.system(size: 16, weight: .black, design: .rounded))
                        }
                        .padding(16)
                        .background(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .fill(selected == index ? Color.blue.opacity(0.18) : Color.secondary.opacity(0.12))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(selected == index ? Color.blue : Color.clear, lineWidth: 1.5)
                        )
                    }
                    .buttonStyle(.plain)
                }

                Button("Start subscription") {}
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .background(.blue, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .padding(.top, 8)
            }
            .padding(20)
        }
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}

#Preview {
    ContentView()
}
`;
}

function renderTravelTemplate() {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack(alignment: .bottom) {
            LinearGradient(
                colors: [Color(red: 0.17, green: 0.44, blue: 0.64), Color(red: 0.05, green: 0.12, blue: 0.2)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer(minLength: 0)

                VStack(alignment: .leading, spacing: 14) {
                    Text("Lisbon")
                        .font(.system(size: 44, weight: .black, design: .rounded))

                    Text("Coastal viewpoints, tiled streets, and sunset tram rides.")
                        .font(.system(size: 15, weight: .semibold, design: .rounded))
                        .foregroundStyle(.secondary)

                    HStack(spacing: 12) {
                        Label("4.8 rating", systemImage: "star.fill")
                        Label("2.1k reviews", systemImage: "person.2.fill")
                    }
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)
                }
                .padding(20)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
                .padding(18)
            }
        }
    }
}

#Preview {
    ContentView()
}
`;
}

function renderAchievementsTemplate() {
  return `import SwiftUI

private struct Badge: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let accent: Color
}

struct ContentView: View {
    private let badges: [Badge] = [
        Badge(icon: "flame.fill", title: "7 day streak", accent: .orange),
        Badge(icon: "bolt.fill", title: "Quick finisher", accent: .yellow),
        Badge(icon: "star.fill", title: "Top rated", accent: .blue),
        Badge(icon: "crown.fill", title: "Milestone", accent: .purple),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Achievements")
                .font(.system(size: 32, weight: .black, design: .rounded))

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(badges) { badge in
                    VStack(spacing: 8) {
                        Circle()
                            .fill(badge.accent.opacity(0.2))
                            .frame(width: 54, height: 54)
                            .overlay(
                                Image(systemName: badge.icon)
                                    .font(.system(size: 22, weight: .bold))
                                    .foregroundStyle(badge.accent)
                            )

                        Text(badge.title)
                            .font(.system(size: 14, weight: .bold, design: .rounded))
                            .multilineTextAlignment(.center)
                    }
                    .padding(.vertical, 14)
                    .frame(maxWidth: .infinity)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
            }

            Spacer(minLength: 0)
        }
        .padding(20)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}

#Preview {
    ContentView()
}
`;
}

function renderProfileTemplate() {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 16) {
            Circle()
                .fill(
                    LinearGradient(colors: [.pink, .orange], startPoint: .topLeading, endPoint: .bottomTrailing)
                )
                .frame(width: 104, height: 104)
                .overlay(
                    Text("AL")
                        .font(.system(size: 34, weight: .black, design: .rounded))
                        .foregroundStyle(.white)
                )

            Text("Avery Lane")
                .font(.system(size: 30, weight: .black, design: .rounded))

            Text("Product designer sharing interface experiments and motion studies.")
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)

            HStack(spacing: 16) {
                ProfileMetric(value: "38k", label: "Followers")
                ProfileMetric(value: "214", label: "Posts")
                ProfileMetric(value: "91", label: "Projects")
            }

            Button("Follow") {}
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(.blue, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                .padding(.horizontal, 20)

            Spacer(minLength: 0)
        }
        .padding(.top, 26)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}

private struct ProfileMetric: View {
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 3) {
            Text(value)
                .font(.system(size: 20, weight: .black, design: .rounded))
            Text(label)
                .font(.system(size: 12, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

#Preview {
    ContentView()
}
`;
}

function renderForecastTemplate() {
  return `import SwiftUI

private struct ForecastHour: Identifiable {
    let id = UUID()
    let label: String
    let icon: String
    let temp: String
}

private struct ForecastDay: Identifiable {
    let id = UUID()
    let day: String
    let icon: String
    let high: String
    let low: String
}

struct ContentView: View {
    private let hours: [ForecastHour] = [
        ForecastHour(label: "Now", icon: "cloud.sun.fill", temp: "22°"),
        ForecastHour(label: "11 AM", icon: "cloud.fill", temp: "21°"),
        ForecastHour(label: "12 PM", icon: "cloud.rain.fill", temp: "20°"),
        ForecastHour(label: "1 PM", icon: "sun.max.fill", temp: "24°"),
    ]

    private let days: [ForecastDay] = [
        ForecastDay(day: "Mon", icon: "cloud.sun.fill", high: "23°", low: "16°"),
        ForecastDay(day: "Tue", icon: "cloud.rain.fill", high: "20°", low: "14°"),
        ForecastDay(day: "Wed", icon: "sun.max.fill", high: "24°", low: "17°"),
        ForecastDay(day: "Thu", icon: "cloud.bolt.rain.fill", high: "19°", low: "13°"),
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("San Francisco")
                            .font(.system(size: 28, weight: .black, design: .rounded))
                        Text("22° • Partly Cloudy")
                            .font(.system(size: 15, weight: .semibold, design: .rounded))
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .background(
                        LinearGradient(colors: [.blue.opacity(0.74), .purple.opacity(0.62)], startPoint: .topLeading, endPoint: .bottomTrailing),
                        in: RoundedRectangle(cornerRadius: 22, style: .continuous)
                    )
                    .foregroundStyle(.white)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(hours) { hour in
                                VStack(spacing: 6) {
                                    Text(hour.label)
                                        .font(.system(size: 12, weight: .bold, design: .rounded))
                                        .foregroundStyle(.secondary)

                                    Image(systemName: hour.icon)
                                        .font(.system(size: 20))
                                        .foregroundStyle(.blue)

                                    Text(hour.temp)
                                        .font(.system(size: 15, weight: .bold, design: .rounded))
                                }
                                .padding(.vertical, 10)
                                .frame(width: 74)
                                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                            }
                        }
                    }

                    VStack(spacing: 10) {
                        ForEach(days) { day in
                            HStack {
                                Text(day.day)
                                    .frame(width: 42, alignment: .leading)

                                Image(systemName: day.icon)
                                    .foregroundStyle(.blue)

                                Spacer(minLength: 0)

                                Text(day.high)
                                    .font(.system(size: 15, weight: .bold, design: .rounded))

                                Text(day.low)
                                    .foregroundStyle(.secondary)
                            }
                            .font(.system(size: 14, weight: .semibold, design: .rounded))
                            .padding(12)
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        }
                    }
                }
                .padding(20)
            }
            .background(Color(.systemGroupedBackground).ignoresSafeArea())
            .navigationTitle("Forecast")
        }
    }
}

#Preview {
    ContentView()
}
`;
}

function renderWeatherWidgetTemplate() {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.12, green: 0.16, blue: 0.25), Color(red: 0.18, green: 0.25, blue: 0.36)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 10) {
                Text("Cupertino")
                    .font(.system(size: 18, weight: .bold, design: .rounded))

                Text("68°")
                    .font(.system(size: 56, weight: .black, design: .rounded))

                HStack(spacing: 8) {
                    Image(systemName: "moon.stars.fill")
                    Text("Clear tonight")
                }
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .foregroundStyle(.white.opacity(0.86))

                Text("Heat advisory")
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(.white.opacity(0.16), in: Capsule())
            }
            .foregroundStyle(.white)
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

#Preview {
    ContentView()
}
`;
}

function renderWrappedStatsTemplate() {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.black, Color(red: 0.12, green: 0.08, blue: 0.2)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 16) {
                Text("Your 2025 wrap")
                    .font(.system(size: 26, weight: .black, design: .rounded))
                    .foregroundStyle(.white)

                Text("52,418 minutes played")
                    .font(.system(size: 40, weight: .black, design: .rounded))
                    .foregroundStyle(.green)

                VStack(spacing: 10) {
                    WrapMetric(label: "Top genre", value: "Alt Pop")
                    WrapMetric(label: "Most played day", value: "Friday")
                    WrapMetric(label: "Favorite hour", value: "10 PM")
                }
            }
            .padding(22)
            .background(Color.white.opacity(0.06), in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            .padding(20)
        }
    }
}

private struct WrapMetric: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(.white.opacity(0.72))
            Spacer(minLength: 0)
            Text(value)
                .foregroundStyle(.white)
                .font(.system(size: 15, weight: .bold, design: .rounded))
        }
        .font(.system(size: 14, weight: .semibold, design: .rounded))
    }
}

#Preview {
    ContentView()
}
`;
}

function renderSwiftForSlug(item: PortItem) {
  switch (item.slug) {
    case "account-alert":
      return renderWidgetTemplate(
        "Verification required",
        "Update account security by April 15",
        "exclamationmark.triangle.fill",
        "D32F2F",
        "Action needed",
        "Status: Pending",
        "Open settings"
      );
    case "account-deletion-confirmation":
      return renderAccountDeletionTemplate();
    case "battery-widget-view":
      return renderWidgetTemplate(
        "Vehicle charging",
        "Estimated completion in 41 minutes",
        "bolt.fill",
        "2E7D32",
        "36%",
        "0%",
        "100%"
      );
    case "creator-revenue-analytics":
      return renderDashboardTemplate("Creator Earnings", "Last 30 days performance", "$8,420", "14B8A6");
    case "daily-streak-view":
      return renderStreakTemplate();
    case "ig-story-bubbles":
      return renderStoryTemplate();
    case "movie-theater-seat-view":
      return renderSeatTemplate();
    case "music-player":
      return renderMusicTemplate();
    case "navigation-widget-view":
      return renderNavigationTemplate();
    case "notification-center-view":
      return renderListTemplate("Notifications", [
        { icon: "bell.fill", text: "New comment on your component", meta: "2 minutes ago" },
        { icon: "sparkles", text: "Featured in weekly digest", meta: "24 minutes ago" },
        { icon: "heart.fill", text: "8 new likes", meta: "1 hour ago" },
      ]);
    case "order-confirmation-screen":
      return renderOrderConfirmationTemplate();
    case "order-history-view":
      return renderListTemplate("Order History", [
        { icon: "shippingbox.fill", text: "Order #A-12094 delivered", meta: "Yesterday" },
        { icon: "shippingbox.fill", text: "Order #A-11872 in transit", meta: "2 days ago" },
        { icon: "shippingbox.fill", text: "Order #A-11750 processing", meta: "3 days ago" },
      ]);
    case "order-tracker":
      return renderOrderTrackerTemplate("Order tracker", "Delivery partner is nearby");
    case "order-tracking":
      return renderOrderTrackerTemplate("Order progress", "Courier is picking up your order");
    case "sales-dashboard":
      return renderDashboardTemplate("Sales Overview", "Weekly summary and channel split", "$12,980", "0EA5E9");
    case "shop-checkout":
      return renderCheckoutTemplate();
    case "shopping-cart-view":
      return renderCartTemplate();
    case "stacked-images":
      return renderStackedTemplate();
    case "subscription-plan-view":
      return renderSubscriptionTemplate();
    case "success-alert-view":
      return renderWidgetTemplate(
        "Payment processed",
        "Everything went through without issues",
        "checkmark.circle.fill",
        "2E7D32",
        "Success",
        "Transaction ID: 3482",
        "Dismiss"
      );
    case "travel-destination-view":
      return renderTravelTemplate();
    case "user-achievements-badges":
      return renderAchievementsTemplate();
    case "user-profile-card":
      return renderProfileTemplate();
    case "weather-app-forecast":
      return renderForecastTemplate();
    case "weather-widget":
      return renderWeatherWidgetTemplate();
    case "wrapped-stats":
      return renderWrappedStatsTemplate();
    default:
      return renderWidgetTemplate(
        item.seedTitle,
        "CopyMyUI rewritten component",
        "square.grid.2x2.fill",
        "1976D2",
        "Preview",
        "Local build",
        "Ready"
      );
  }
}

async function main() {
  await mkdir(COPYCAT_ROOT, { recursive: true });
  await mkdir(RESEARCH_ROOT, { recursive: true });
  await mkdir(SEED_CODE_ROOT, { recursive: true });

  const posts = await fetchPosts();

  await writeFile(
    path.join(COPYCAT_ROOT, "dockui-posts-raw.json"),
    `${JSON.stringify(posts, null, 2)}\n`,
    "utf8"
  );

  const freePosts = posts.filter((post) => !post.isPremium);
  await writeFile(
    path.join(COPYCAT_ROOT, "dockui-posts-free.json"),
    `${JSON.stringify(freePosts, null, 2)}\n`,
    "utf8"
  );

  const portItems = buildPortItems(posts);

  await writeFile(
    path.join(COPYCAT_ROOT, "dockui-port-manifest.json"),
    `${JSON.stringify(portItems, null, 2)}\n`,
    "utf8"
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
  }));

  await writeFile(
    path.join(SEED_CODE_ROOT, "dockui-port-components.json"),
    `${JSON.stringify(seedManifest, null, 2)}\n`,
    "utf8"
  );

  for (const item of portItems) {
    const post = posts.find((entry) => entry.slug === item.slug);

    if (!post) {
      continue;
    }

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
            id: post.id,
            slug: post.slug,
            title: post.title,
            description: post.description,
            postType: post.post_type,
            isPremium: post.isPremium,
            createdAt: post.created_at,
            previewImageUrl: post.preview_image_url,
          },
          port: item,
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    await writeFile(path.join(copycatComponentDir, "dockui-source.swift"), `${post.code_snippet}\n`, "utf8");
    await writeFile(path.join(copycatComponentDir, "preview-url.txt"), `${post.preview_image_url}\n`, "utf8");

    const previewResponse = await fetch(post.preview_image_url);
    if (previewResponse.ok) {
      const extension = sourcePreviewExtension(post.preview_image_url);
      const previewBuffer = Buffer.from(await previewResponse.arrayBuffer());
      await writeFile(path.join(copycatComponentDir, `source-preview${extension}`), previewBuffer);
    }

    const rewrittenSwift = renderSwiftForSlug(item);
    await writeFile(path.join(researchComponentDir, "content.swift"), rewrittenSwift, "utf8");
  }

  console.log(`DockUI posts fetched: ${posts.length}`);
  console.log(`Free posts extracted: ${freePosts.length}`);
  console.log(`Components prepared for port: ${portItems.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
