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

type TrajectoryKind = "straight" | "parabolic" | "teleport";
type ButtonStyleKind =
  | "plain"
  | "droplet"
  | "wiggle"
  | "keyframe"
  | "chroma"
  | "bell"
  | "plus"
  | "calendar"
  | "gear";

type SourceItem = {
  key: string;
  slug: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourcePreviewUrl: string;
  sourceSnippet: string;
  categoryName: CategoryName;
  pattern: SeedPattern;
  trajectory: TrajectoryKind;
  style: ButtonStyleKind;
  usesNotch: boolean;
  showsSelectionInfo: boolean;
  accentHex: string;
  initialIndex: number;
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
const SITE = "animatedtabbar";
const COPYCAT_ROOT = path.join(ROOT, "public", "uploads", `copycat-${SITE}`);
const RESEARCH_ROOT = path.join(ROOT, "public", "uploads", "research");
const SEED_CODE_ROOT = path.join(ROOT, "prisma", "seed-code");

const REPO = "https://github.com/exyte/AnimatedTabBar";
const README = `${REPO}/blob/master/README.md`;
const SOURCE_TABBAR = `${REPO}/blob/master/Sources/AnimatedTabBar/AnimatedTabbar.swift`;
const SOURCE_DROPLET = `${REPO}/blob/master/Sources/AnimatedTabBar/TabBarButtons/DropletButton.swift`;
const SOURCE_WIGGLE = `${REPO}/blob/master/Sources/AnimatedTabBar/TabBarButtons/WiggleButton.swift`;
const SOURCE_EXAMPLE = `${REPO}/blob/master/AnimatedTabBarExample/AnimatedTabBarExample/ContentView.swift`;
const SOURCE_COLOR_BUTTONS = `${REPO}/blob/master/AnimatedTabBarExample/AnimatedTabBarExample/ExampleColorButtons.swift`;
const SOURCE_KEYFRAME = `${REPO}/blob/master/AnimatedTabBarExample/AnimatedTabBarExample/KeyframeWiggleButton.swift`;

const PREVIEW_GIF = "https://user-images.githubusercontent.com/9447630/217482148-8594b3ce-e6be-4e84-a65d-29915566a61a.gif";

const sourceItems: SourceItem[] = [
  {
    key: "straight-orbit",
    slug: "animated-tabbar-straight-orbit",
    title: "Animated TabBar Straight Orbit",
    summary: "Straight indicator path variant adapted from core AnimatedTabBar behavior.",
    sourceUrl: SOURCE_TABBAR,
    sourcePreviewUrl: PREVIEW_GIF,
    sourceSnippet:
      "AnimatedTabBar ballTrajectory(.straight) core variant adapted without external library dependency.",
    categoryName: "Navigation",
    pattern: "tabBarOrbit",
    trajectory: "straight",
    style: "plain",
    usesNotch: false,
    showsSelectionInfo: false,
    accentHex: "5A6CFF",
    initialIndex: 2,
  },
  {
    key: "parabolic-orbit",
    slug: "animated-tabbar-parabolic-orbit",
    title: "Animated TabBar Parabolic Orbit",
    summary: "Jumping indicator that follows an arc between tabs with a notch-surface container.",
    sourceUrl: SOURCE_TABBAR,
    sourcePreviewUrl: PREVIEW_GIF,
    sourceSnippet:
      "BallTrajectory.parabolic with animated path movement and indent reaction under selected tab.",
    categoryName: "Navigation",
    pattern: "segmentedRail",
    trajectory: "parabolic",
    style: "plain",
    usesNotch: true,
    showsSelectionInfo: false,
    accentHex: "3D7BFF",
    initialIndex: 1,
  },
  {
    key: "teleport-orbit",
    slug: "animated-tabbar-teleport-orbit",
    title: "Animated TabBar Teleport Orbit",
    summary: "Teleporting indicator behavior with fade-out/fade-in transition and compact rail styling.",
    sourceUrl: SOURCE_TABBAR,
    sourcePreviewUrl: PREVIEW_GIF,
    sourceSnippet:
      "BallTrajectory.teleport where indicator disappears and reappears over selected tab.",
    categoryName: "Navigation",
    pattern: "sidebarFlow",
    trajectory: "teleport",
    style: "plain",
    usesNotch: false,
    showsSelectionInfo: false,
    accentHex: "00A77E",
    initialIndex: 3,
  },
  {
    key: "color-button-bell",
    slug: "animated-tabbar-color-button-bell",
    title: "Animated TabBar Color Button Bell",
    summary: "ColorButton bell animation style adapted as a standalone tabbar showcase.",
    sourceUrl: SOURCE_COLOR_BUTTONS,
    sourcePreviewUrl: PREVIEW_GIF,
    sourceSnippet:
      "ColorButton(animationType: .bell) adaptation with rotational bell emphasis and colored backing.",
    categoryName: "Navigation",
    pattern: "segmentedRail",
    trajectory: "straight",
    style: "bell",
    usesNotch: false,
    showsSelectionInfo: false,
    accentHex: "6E4DFF",
    initialIndex: 0,
  },
  {
    key: "color-button-plus",
    slug: "animated-tabbar-color-button-plus",
    title: "Animated TabBar Color Button Plus",
    summary: "ColorButton plus animation style adapted with layered plus emphasis.",
    sourceUrl: SOURCE_COLOR_BUTTONS,
    sourcePreviewUrl: PREVIEW_GIF,
    sourceSnippet:
      "ColorButton(animationType: .plus) adaptation with rotating plus overlay and colored capsule background.",
    categoryName: "Navigation",
    pattern: "segmentedRail",
    trajectory: "straight",
    style: "plus",
    usesNotch: false,
    showsSelectionInfo: false,
    accentHex: "EF5B76",
    initialIndex: 2,
  },
  {
    key: "color-button-calendar",
    slug: "animated-tabbar-color-button-calendar",
    title: "Animated TabBar Color Button Calendar",
    summary: "ColorButton calendar animation style adapted with directional offset accent.",
    sourceUrl: SOURCE_COLOR_BUTTONS,
    sourcePreviewUrl: PREVIEW_GIF,
    sourceSnippet:
      "ColorButton(animationType: .calendar) adaptation with moving badge point and spring motion.",
    categoryName: "Navigation",
    pattern: "segmentedRail",
    trajectory: "straight",
    style: "calendar",
    usesNotch: false,
    showsSelectionInfo: false,
    accentHex: "14A3B8",
    initialIndex: 3,
  },
  {
    key: "color-button-gear",
    slug: "animated-tabbar-color-button-gear",
    title: "Animated TabBar Color Button Gear",
    summary: "ColorButton gear animation style adapted with rotational settings glyph motion.",
    sourceUrl: SOURCE_COLOR_BUTTONS,
    sourcePreviewUrl: PREVIEW_GIF,
    sourceSnippet:
      "ColorButton(animationType: .gear) adaptation with rotating gear icon over dynamic color plate.",
    categoryName: "Navigation",
    pattern: "segmentedRail",
    trajectory: "straight",
    style: "gear",
    usesNotch: false,
    showsSelectionInfo: false,
    accentHex: "FF8B38",
    initialIndex: 4,
  },
  {
    key: "droplet-buttons",
    slug: "animated-tabbar-droplet-buttons",
    title: "Animated TabBar Droplet Buttons",
    summary: "Droplet-like reveal under icon taps with soft morphing scale behavior.",
    sourceUrl: SOURCE_DROPLET,
    sourcePreviewUrl: PREVIEW_GIF,
    sourceSnippet:
      "DropletButton preset adapted: animated blob behind selected tab icon in pure SwiftUI.",
    categoryName: "Navigation",
    pattern: "tabBarOrbit",
    trajectory: "parabolic",
    style: "droplet",
    usesNotch: false,
    showsSelectionInfo: false,
    accentHex: "7654FF",
    initialIndex: 0,
  },
  {
    key: "wiggle-buttons",
    slug: "animated-tabbar-wiggle-buttons",
    title: "Animated TabBar Wiggle Buttons",
    summary: "Wiggle-emphasis icon buttons with curved background pulse under selection.",
    sourceUrl: SOURCE_WIGGLE,
    sourcePreviewUrl: PREVIEW_GIF,
    sourceSnippet:
      "WiggleButton preset adapted: icon wiggle plus half-arc background pulse.",
    categoryName: "Navigation",
    pattern: "segmentedRail",
    trajectory: "teleport",
    style: "wiggle",
    usesNotch: false,
    showsSelectionInfo: false,
    accentHex: "E04FFF",
    initialIndex: 4,
  },
  {
    key: "keyframe-style",
    slug: "animated-tabbar-keyframe-style",
    title: "Animated TabBar Keyframe Style",
    summary: "Layered keyframe-like tab button emphasis with quick staged scaling behavior.",
    sourceUrl: SOURCE_KEYFRAME,
    sourcePreviewUrl: PREVIEW_GIF,
    sourceSnippet:
      "KeyframeWiggleButton idea adapted without external dependencies using staged SwiftUI timing.",
    categoryName: "Navigation",
    pattern: "commandSheet",
    trajectory: "straight",
    style: "keyframe",
    usesNotch: true,
    showsSelectionInfo: false,
    accentHex: "FF6A3D",
    initialIndex: 2,
  },
  {
    key: "indented-surface",
    slug: "animated-tabbar-indented-surface",
    title: "Animated TabBar Indented Surface",
    summary: "Bar surface with moving top indentation synchronized to current selected index.",
    sourceUrl: SOURCE_TABBAR,
    sourcePreviewUrl: PREVIEW_GIF,
    sourceSnippet:
      "IndentableRect/SlidingIndentRect concepts adapted to custom shape with animated center notch.",
    categoryName: "Navigation",
    pattern: "tabBarOrbit",
    trajectory: "straight",
    style: "chroma",
    usesNotch: true,
    showsSelectionInfo: false,
    accentHex: "14A3B8",
    initialIndex: 1,
  },
  {
    key: "selection-feedback",
    slug: "animated-tabbar-selection-feedback",
    title: "Animated TabBar Selection Feedback",
    summary: "Selection callback label that mirrors didSelectIndex usage together with animated indicator.",
    sourceUrl: README,
    sourcePreviewUrl: PREVIEW_GIF,
    sourceSnippet:
      "didSelectIndex callback pattern adapted to show immediate selected-tab status above the bar.",
    categoryName: "Dashboards",
    pattern: "metricsDeck",
    trajectory: "parabolic",
    style: "plain",
    usesNotch: false,
    showsSelectionInfo: true,
    accentHex: "FF4365",
    initialIndex: 0,
  },
];

function escapeSwift(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toSentenceCase(input: string) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function renderComponentSwift(item: SourceItem) {
  return `import SwiftUI

private enum DemoTrajectory {
    case straight
    case parabolic
    case teleport
}

private enum DemoButtonStyle {
    case plain
    case droplet
    case wiggle
    case keyframe
    case chroma
    case bell
    case plus
    case calendar
    case gear
}

private struct TabItem: Identifiable {
    let id: Int
    let label: String
    let symbol: String
    let selectedSymbol: String
}

struct ContentView: View {
    @State private var selectedIndex = ${item.initialIndex}
    @State private var selectionLabel = ""

    private let trajectory: DemoTrajectory = .${item.trajectory}
    private let style: DemoButtonStyle = .${item.style}
    private let usesNotch = ${item.usesNotch}
    private let showsSelectionInfo = ${item.showsSelectionInfo}
    private let accent = Color(hex: "${item.accentHex}")

    private let tabs: [TabItem] = [
        .init(id: 0, label: "Bell", symbol: "bell", selectedSymbol: "bell.fill"),
        .init(id: 1, label: "Leaf", symbol: "leaf", selectedSymbol: "leaf.fill"),
        .init(id: 2, label: "Plus", symbol: "plus", selectedSymbol: "plus"),
        .init(id: 3, label: "Calendar", symbol: "calendar", selectedSymbol: "calendar"),
        .init(id: 4, label: "Gear", symbol: "gearshape", selectedSymbol: "gearshape.fill"),
    ]

    var body: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()

            VStack(alignment: .leading, spacing: 12) {
                Text("${escapeSwift(item.title)}")
                    .font(.system(size: 30, weight: .black, design: .rounded))

                Text("${escapeSwift(item.summary)}")
                    .font(.system(size: 15, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)

                if showsSelectionInfo {
                    Label(selectionLabel, systemImage: "sparkles")
                        .font(.system(size: 14, weight: .bold, design: .rounded))
                        .foregroundStyle(accent)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(accent.opacity(0.12), in: Capsule())
                }

                Spacer(minLength: 0)

                AdaptedAnimatedTabBar(
                    selectedIndex: $selectedIndex,
                    items: tabs,
                    trajectory: trajectory,
                    style: style,
                    usesNotch: usesNotch,
                    accent: accent
                )
                .frame(height: 96)
            }
            .padding(20)
        }
        .onAppear {
            selectionLabel = "Selected: \(tabs[selectedIndex].label)"
        }
        .onChange(of: selectedIndex) { newValue in
            selectionLabel = "Selected: \(tabs[newValue].label)"
        }
    }
}

private struct AdaptedAnimatedTabBar: View {
    @Binding var selectedIndex: Int

    let items: [TabItem]
    let trajectory: DemoTrajectory
    let style: DemoButtonStyle
    let usesNotch: Bool
    let accent: Color

    @State private var fromIndex = 0
    @State private var toIndex = 0
    @State private var travel: CGFloat = 1

    @Environment(\\.colorScheme) private var colorScheme

    var body: some View {
        GeometryReader { proxy in
            let width = proxy.size.width
            let count = max(items.count, 1)
            let step = width / CGFloat(count)
            let indicatorX = currentIndicatorX(step: step)

            ZStack(alignment: .topLeading) {
                if usesNotch {
                    TabBarNotchShape(centerX: indicatorX, depth: 14, cornerRadius: 24)
                        .fill(colorScheme == .dark ? Color.white.opacity(0.08) : Color.black.opacity(0.06))
                        .overlay(
                            TabBarNotchShape(centerX: indicatorX, depth: 14, cornerRadius: 24)
                                .stroke(colorScheme == .dark ? Color.white.opacity(0.16) : Color.black.opacity(0.08), lineWidth: 1)
                        )
                } else {
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .fill(colorScheme == .dark ? Color.white.opacity(0.08) : Color.black.opacity(0.06))
                        .overlay(
                            RoundedRectangle(cornerRadius: 24, style: .continuous)
                                .stroke(colorScheme == .dark ? Color.white.opacity(0.16) : Color.black.opacity(0.08), lineWidth: 1)
                        )
                }

                indicator(step: step)

                HStack(spacing: 0) {
                    ForEach(items) { item in
                        Button {
                            select(item.id)
                        } label: {
                            TabGlyph(
                                item: item,
                                style: style,
                                isSelected: item.id == selectedIndex,
                                accent: accent
                            )
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 8)
                .padding(.top, 8)
                .padding(.bottom, 10)
            }
        }
        .onAppear {
            fromIndex = selectedIndex
            toIndex = selectedIndex
            travel = 1
        }
    }

    private func select(_ index: Int) {
        guard index != selectedIndex else { return }
        fromIndex = selectedIndex
        toIndex = index
        selectedIndex = index

        withAnimation(.linear(duration: 0.01)) {
            travel = 0
        }
        withAnimation(.spring(response: 0.58, dampingFraction: 0.74)) {
            travel = 1
        }
    }

    private func centerX(for index: Int, step: CGFloat) -> CGFloat {
        let safeIndex = max(0, min(index, items.count - 1))
        return step * (CGFloat(safeIndex) + 0.5)
    }

    private func currentIndicatorX(step: CGFloat) -> CGFloat {
        let clamped = min(max(travel, CGFloat(0)), CGFloat(1))
        let start = centerX(for: fromIndex, step: step)
        let end = centerX(for: toIndex, step: step)
        return start + (end - start) * clamped
    }

    @ViewBuilder
    private func indicator(step: CGFloat) -> some View {
        let clamped = min(max(travel, CGFloat(0)), CGFloat(1))
        let fromX = centerX(for: fromIndex, step: step)
        let toX = centerX(for: toIndex, step: step)

        switch trajectory {
        case .straight:
            Circle()
                .fill(accent)
                .frame(width: 14, height: 14)
                .offset(x: currentIndicatorX(step: step) - 7, y: 10)
                .shadow(color: accent.opacity(0.38), radius: 8, x: 0, y: 3)

        case .parabolic:
            Circle()
                .fill(accent)
                .frame(width: 14, height: 14)
                .offset(
                    x: currentIndicatorX(step: step) - 7,
                    y: 10 - CGFloat(abs(sin(Double(clamped) * Double.pi))) * 22
                )
                .shadow(color: accent.opacity(0.34), radius: 9, x: 0, y: 3)

        case .teleport:
            Group {
                if clamped <= CGFloat(0.5) {
                    Circle()
                        .fill(accent)
                        .frame(width: 14, height: 14)
                        .scaleEffect(max(CGFloat(0.05), CGFloat(1) - clamped * CGFloat(2)))
                        .opacity(max(CGFloat(0.05), CGFloat(1) - clamped * CGFloat(2)))
                        .offset(x: fromX - 7, y: 10)
                } else {
                    Circle()
                        .fill(accent)
                        .frame(width: 14, height: 14)
                        .scaleEffect(max(CGFloat(0.05), (clamped - CGFloat(0.5)) * CGFloat(2)))
                        .opacity(max(CGFloat(0.05), (clamped - CGFloat(0.5)) * CGFloat(2)))
                        .offset(x: toX - 7, y: 10)
                }
            }
            .shadow(color: accent.opacity(0.34), radius: 9, x: 0, y: 3)
        }
    }
}

private struct TabGlyph: View {
    let item: TabItem
    let style: DemoButtonStyle
    let isSelected: Bool
    let accent: Color

    @Environment(\\.colorScheme) private var colorScheme

    var body: some View {
        ZStack {
            switch style {
            case .plain:
                EmptyView()

            case .droplet:
                Circle()
                    .fill(accent.opacity(isSelected ? 0.25 : 0.0))
                    .frame(width: isSelected ? 32 : 10, height: isSelected ? 32 : 10)
                    .offset(y: isSelected ? -6 : 6)
                    .blur(radius: isSelected ? 0 : 4)

            case .wiggle:
                WiggleArc(progress: isSelected ? 1 : 0)
                    .stroke(accent.opacity(0.32), lineWidth: 5)
                    .frame(width: 30, height: 14)
                    .offset(y: 14)

            case .keyframe:
                ZStack {
                    Circle()
                        .stroke(accent.opacity(isSelected ? 0.45 : 0.0), lineWidth: 2)
                        .frame(width: isSelected ? 34 : 20, height: isSelected ? 34 : 20)
                    Circle()
                        .fill(accent.opacity(isSelected ? 0.12 : 0.0))
                        .frame(width: isSelected ? 30 : 12, height: isSelected ? 30 : 12)
                }

            case .chroma:
                Capsule(style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [accent.opacity(0.85), accent.opacity(0.45)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: isSelected ? 36 : 18, height: isSelected ? 34 : 14)
                    .opacity(isSelected ? 0.28 : 0)

            case .bell:
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(accent.opacity(isSelected ? 0.26 : 0))
                    .frame(width: isSelected ? 32 : 14, height: isSelected ? 32 : 14)

            case .plus:
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(accent.opacity(isSelected ? 0.24 : 0))
                    .rotationEffect(.degrees(isSelected ? 45 : 0))
                    .frame(width: isSelected ? 30 : 14, height: isSelected ? 30 : 14)

            case .calendar:
                RoundedRectangle(cornerRadius: 9, style: .continuous)
                    .fill(accent.opacity(isSelected ? 0.24 : 0))
                    .frame(width: isSelected ? 34 : 14, height: isSelected ? 28 : 12)
                    .overlay(alignment: .top) {
                        Rectangle()
                            .fill(accent.opacity(isSelected ? 0.4 : 0))
                            .frame(height: 5)
                            .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
                    }

            case .gear:
                Circle()
                    .stroke(accent.opacity(isSelected ? 0.42 : 0), lineWidth: 2.2)
                    .frame(width: isSelected ? 34 : 14, height: isSelected ? 34 : 14)
            }

            Image(systemName: isSelected ? item.selectedSymbol : item.symbol)
                .font(.system(size: 19, weight: .semibold, design: .rounded))
                .foregroundStyle(
                    isSelected
                        ? AnyShapeStyle(accent)
                        : AnyShapeStyle(
                            colorScheme == .dark
                                ? Color.white.opacity(0.72)
                                : Color.black.opacity(0.66)
                        )
                )
                .rotationEffect(
                    .degrees(
                        style == .wiggle && isSelected
                            ? 9
                            : style == .bell && isSelected
                                ? 18
                                : style == .gear && isSelected
                                    ? 52
                                    : 0
                    )
                )
                .scaleEffect(
                    isSelected
                        ? (style == .keyframe
                            ? 1.18
                            : style == .plus
                                ? 1.2
                                : 1.1)
                        : 1
                )
                .overlay {
                    if style == .plus {
                        Image(systemName: "plus")
                            .font(.system(size: 12, weight: .black, design: .rounded))
                            .foregroundStyle(accent.opacity(isSelected ? 0.85 : 0))
                            .rotationEffect(.degrees(isSelected ? 90 : 0))
                    }
                }
                .overlay(alignment: .bottomTrailing) {
                    if style == .calendar {
                        Circle()
                            .fill(accent.opacity(isSelected ? 0.9 : 0))
                            .frame(width: 5, height: 5)
                            .offset(x: 4, y: 4)
                    }
                }
        }
        .frame(width: 50, height: 50)
        .animation(.spring(response: 0.38, dampingFraction: 0.72), value: isSelected)
    }
}

private struct WiggleArc: Shape {
    var progress: CGFloat

    var animatableData: CGFloat {
        get { progress }
        set { progress = newValue }
    }

    func path(in rect: CGRect) -> Path {
        let width = rect.width
        let peak = rect.minY + (1 - progress) * rect.height * 0.8

        var path = Path()
        path.move(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.addQuadCurve(
            to: CGPoint(x: rect.maxX, y: rect.maxY),
            control: CGPoint(x: rect.minX + width / 2, y: peak)
        )
        return path
    }
}

private struct TabBarNotchShape: Shape {
    var centerX: CGFloat
    var depth: CGFloat
    var cornerRadius: CGFloat

    var animatableData: CGFloat {
        get { centerX }
        set { centerX = newValue }
    }

    func path(in rect: CGRect) -> Path {
        let r = min(cornerRadius, min(rect.width, rect.height) / 2)
        let notchHalf: CGFloat = 34
        let d = min(depth, 18)
        let c = min(max(centerX, r + notchHalf), rect.width - r - notchHalf)

        var path = Path()
        path.move(to: CGPoint(x: r, y: 0))
        path.addLine(to: CGPoint(x: c - notchHalf, y: 0))
        path.addCurve(
            to: CGPoint(x: c, y: d),
            control1: CGPoint(x: c - notchHalf * 0.58, y: 0),
            control2: CGPoint(x: c - notchHalf * 0.22, y: d)
        )
        path.addCurve(
            to: CGPoint(x: c + notchHalf, y: 0),
            control1: CGPoint(x: c + notchHalf * 0.22, y: d),
            control2: CGPoint(x: c + notchHalf * 0.58, y: 0)
        )
        path.addLine(to: CGPoint(x: rect.width - r, y: 0))
        path.addQuadCurve(
            to: CGPoint(x: rect.width, y: r),
            control: CGPoint(x: rect.width, y: 0)
        )
        path.addLine(to: CGPoint(x: rect.width, y: rect.height - r))
        path.addQuadCurve(
            to: CGPoint(x: rect.width - r, y: rect.height),
            control: CGPoint(x: rect.width, y: rect.height)
        )
        path.addLine(to: CGPoint(x: r, y: rect.height))
        path.addQuadCurve(
            to: CGPoint(x: 0, y: rect.height - r),
            control: CGPoint(x: 0, y: rect.height)
        )
        path.addLine(to: CGPoint(x: 0, y: r))
        path.addQuadCurve(
            to: CGPoint(x: r, y: 0),
            control: CGPoint(x: 0, y: 0)
        )
        path.closeSubpath()
        return path
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
            (r, g, b) = (
                (int >> 16) & 0xff,
                (int >> 8) & 0xff,
                int & 0xff
            )
        default:
            (r, g, b) = (120, 120, 120)
        }

        self.init(
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255
        )
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
      summary: `${item.summary} Rewritten for CopyMyUI with pure SwiftUI implementation and adaptive light/dark support.`,
      description: `${item.title} is a rewritten SwiftUI tab bar component adapted from exyte/AnimatedTabBar concepts. It keeps the interaction intent while replacing implementation details with original SwiftUI code.`,
      changelog:
        `Rewritten from exyte/AnimatedTabBar (${toSentenceCase(item.key.replace(/-/g, " "))}) with custom Swift-only implementation and simulator captures.`,
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
      site: "github.com/exyte/AnimatedTabBar",
      url: item.sourceUrl,
    },
  }));

  await writeFile(
    path.join(SEED_CODE_ROOT, "animatedtabbar-port-components.json"),
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

    const swift = renderComponentSwift(source);
    await writeFile(path.join(researchDir, "content.swift"), swift, "utf8");
  }

  console.log(`AnimatedTabBar components prepared: ${portItems.length}`);
  console.log(`AnimatedTabBar start ID: ${String(startId).padStart(3, "0")}`);
  console.log(`AnimatedTabBar seed start: ${startSeed}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
