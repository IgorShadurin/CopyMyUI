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

type SourceItem = {
  key: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  categoryName: CategoryName;
  pattern: SeedPattern;
  sourceTitle: string;
  sourceAuthor: string;
  sourceUrl: string;
  sourcePreviewUrl: string;
  accentHexA: string;
  accentHexB: string;
  badge: string;
  headline: string;
  supportingLine: string;
  metricLeftLabel: string;
  metricLeftValue: string;
  metricRightLabel: string;
  metricRightValue: string;
  ctaLabel: string;
};

type PortItem = {
  id: string;
  numericId: number;
  key: string;
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
const SITE = "detailspro-variety";
const COPYCAT_ROOT = path.join(ROOT, "public", "uploads", `copycat-${SITE}`);
const RESEARCH_ROOT = path.join(ROOT, "public", "uploads", "research");
const SEED_CODE_ROOT = path.join(ROOT, "prisma", "seed-code");

const sourceItems: SourceItem[] = [
  {
    key: "gaming-squad-readiness-board",
    slug: "gaming-squad-readiness-board",
    title: "Gaming Squad Readiness Board",
    summary:
      "A compact pre-match readiness card with role health, queue pulse, and launch checkpoint in a clean DetailsPro-inspired layout.",
    description:
      "Gaming Squad Readiness Board translates the polished card language from copycat-detailspro into a game lobby readiness surface.",
    categoryName: "Gaming",
    pattern: "opsBoard",
    sourceTitle: "Sports Live Activity",
    sourceAuthor: "DetailsPro",
    sourceUrl: "https://detailspro.app/community/design/314A5730-C846-4EB4-BD92-169B7029F72E/",
    sourcePreviewUrl: "https://d1w362hbd8dnhw.cloudfront.net/41A25B61-85A4-481B-B480-A65C815F0717.jpg",
    accentHexA: "4F46E5",
    accentHexB: "06B6D4",
    badge: "Ranked Lobby",
    headline: "Launch in 12 seconds",
    supportingLine: "All roles locked and voice channel stable.",
    metricLeftLabel: "Players",
    metricLeftValue: "5/5",
    metricRightLabel: "Ping",
    metricRightValue: "29 ms",
    ctaLabel: "Ready",
  },
  {
    key: "gaming-loot-session-recap",
    slug: "gaming-loot-session-recap",
    title: "Gaming Loot Session Recap",
    summary:
      "A post-run recap panel with drops, rarity totals, and reward claim callout using the same soft rounded DetailsPro visual rhythm.",
    description:
      "Gaming Loot Session Recap is a rewritten reward summary screen with layered cards and high-contrast stat chips.",
    categoryName: "Gaming",
    pattern: "storyShelf",
    sourceTitle: "Player Widget Small",
    sourceAuthor: "DetailsPro",
    sourceUrl: "https://detailspro.app/community/design/7F2E4C3E-1D7F-4216-B1F4-187AF7719B70/",
    sourcePreviewUrl: "https://d1w362hbd8dnhw.cloudfront.net/E1BD763A-0B97-45D6-A18A-FDAF7432414C.jpg",
    accentHexA: "7C3AED",
    accentHexB: "EC4899",
    badge: "Run Complete",
    headline: "Legendary drop secured",
    supportingLine: "Vault Prism rifle added to your collection.",
    metricLeftLabel: "Drops",
    metricLeftValue: "18",
    metricRightLabel: "Legendary",
    metricRightValue: "2",
    ctaLabel: "Claim",
  },
  {
    key: "gaming-raid-briefing-panel",
    slug: "gaming-raid-briefing-panel",
    title: "Gaming Raid Briefing Panel",
    summary:
      "A raid prep module with objective capsule, phase hints, and squad assignment summary in a refined mobile card treatment.",
    description:
      "Gaming Raid Briefing Panel adapts copycat-detailspro styling into encounter preparation UX for cooperative game flows.",
    categoryName: "Gaming",
    pattern: "videoSpotlight",
    sourceTitle: "Station Screen",
    sourceAuthor: "DetailsPro",
    sourceUrl: "https://detailspro.app/community/design/87568844-4D2C-47EA-9122-7CC9937F058D/",
    sourcePreviewUrl: "https://d1w362hbd8dnhw.cloudfront.net/FE568DC9-2FDF-4296-A130-12E3E10A66C0.jpg",
    accentHexA: "2563EB",
    accentHexB: "22C55E",
    badge: "Raid Prep",
    headline: "Phase 1 strategy synced",
    supportingLine: "Healer rotation and split lanes are confirmed.",
    metricLeftLabel: "Teams",
    metricLeftValue: "3",
    metricRightLabel: "Wipes",
    metricRightValue: "0",
    ctaLabel: "Review",
  },
  {
    key: "gaming-rank-promotion-stage",
    slug: "gaming-rank-promotion-stage",
    title: "Gaming Rank Promotion Stage",
    summary:
      "A progression surface that highlights promotion threshold, streak details, and focused next-match prompt in bright card form.",
    description:
      "Gaming Rank Promotion Stage is a polished progression widget for competitive ladders with clear emphasis on near-term milestones.",
    categoryName: "Gaming",
    pattern: "kpiHorizon",
    sourceTitle: "Live activities",
    sourceAuthor: "Ruslan",
    sourceUrl: "https://detailspro.app/community/design/7036D69B-9589-447A-ABE3-947D73DBD06E/",
    sourcePreviewUrl: "https://d1w362hbd8dnhw.cloudfront.net/CF5EB9F4-29D0-4A32-B76F-30CE5A8ADFA1.jpg",
    accentHexA: "F59E0B",
    accentHexB: "EF4444",
    badge: "Promotion Match",
    headline: "1 win to enter Diamond",
    supportingLine: "Current streak keeps your confidence multiplier active.",
    metricLeftLabel: "Streak",
    metricLeftValue: "6",
    metricRightLabel: "MMR",
    metricRightValue: "+48",
    ctaLabel: "Queue",
  },
  {
    key: "paywall-annual-savings-sheet",
    slug: "paywall-annual-savings-sheet",
    title: "Paywall Annual Savings Sheet",
    summary:
      "A transparent pricing sheet with annual savings framing, segmented billing switch, and explicit benefit stack.",
    description:
      "Paywall Annual Savings Sheet applies the same rounded DetailsPro-like hierarchy to conversion-focused subscription presentation.",
    categoryName: "Paywall",
    pattern: "pricingLens",
    sourceTitle: "Subscription Options",
    sourceAuthor: "DetailsPro",
    sourceUrl: "https://detailspro.app/community/design/E4EBE6AD-A2D5-4C2C-903C-C16B12175D80/",
    sourcePreviewUrl: "https://d1w362hbd8dnhw.cloudfront.net/9A897CFC-07CD-4420-B77C-C5E8BB3F1072.jpg",
    accentHexA: "0EA5E9",
    accentHexB: "2563EB",
    badge: "Pro Access",
    headline: "Save 48% with annual",
    supportingLine: "Full template library and priority exports included.",
    metricLeftLabel: "Annual",
    metricLeftValue: "$39",
    metricRightLabel: "Monthly",
    metricRightValue: "$8",
    ctaLabel: "Start Trial",
  },
  {
    key: "paywall-family-plan-selector",
    slug: "paywall-family-plan-selector",
    title: "Paywall Family Plan Selector",
    summary:
      "A family-focused upgrade panel balancing seat count clarity, shared benefits, and immediate upgrade CTA.",
    description:
      "Paywall Family Plan Selector is a rewritten subscription chooser with concise tier contrast and stronger social sharing value framing.",
    categoryName: "Paywall",
    pattern: "upsellDrawer",
    sourceTitle: "Login Screen",
    sourceAuthor: "DetailsPro",
    sourceUrl: "https://detailspro.app/community/design/C7431897-1632-4D22-A4D8-7E3BBC5F0DE2/",
    sourcePreviewUrl: "https://d1w362hbd8dnhw.cloudfront.net/E4FC3738-178F-46F6-B784-9E869E5DFDBE.jpg",
    accentHexA: "14B8A6",
    accentHexB: "22C55E",
    badge: "Family Plan",
    headline: "6 seats, one subscription",
    supportingLine: "Shared premium features across all household devices.",
    metricLeftLabel: "Seats",
    metricLeftValue: "6",
    metricRightLabel: "Price",
    metricRightValue: "$69/y",
    ctaLabel: "Upgrade",
  },
  {
    key: "paywall-pro-upgrade-checklist",
    slug: "paywall-pro-upgrade-checklist",
    title: "Paywall Pro Upgrade Checklist",
    summary:
      "A checklist-first paywall with trust cues, renewal summary, and focused CTA hierarchy for low-friction conversion.",
    description:
      "Paywall Pro Upgrade Checklist restyles conversion copy into digestible benefit rows and a stable action footer.",
    categoryName: "Paywall",
    pattern: "pricingLens",
    sourceTitle: "Design Guides: Color",
    sourceAuthor: "DetailsPro",
    sourceUrl: "https://detailspro.app/community/design/7F33E748-5087-4930-8514-EC193EA4A9D6/",
    sourcePreviewUrl: "https://d1w362hbd8dnhw.cloudfront.net/D020F772-A100-4E3A-B84E-9EA89E7A030F.jpg",
    accentHexA: "6366F1",
    accentHexB: "A855F7",
    badge: "Upgrade Checklist",
    headline: "Everything unlocked in one tap",
    supportingLine: "Instant sync, unlimited exports, private backups.",
    metricLeftLabel: "Trial",
    metricLeftValue: "7 days",
    metricRightLabel: "Cancel",
    metricRightValue: "Anytime",
    ctaLabel: "Continue",
  },
  {
    key: "paywall-lifetime-offer-spotlight",
    slug: "paywall-lifetime-offer-spotlight",
    title: "Paywall Lifetime Offer Spotlight",
    summary:
      "A one-time purchase spotlight with urgency capsule, value comparison, and concise rationale block.",
    description:
      "Paywall Lifetime Offer Spotlight adapts the detailspro card language for lifetime unlock promotion with clean visual priority.",
    categoryName: "Paywall",
    pattern: "upsellDrawer",
    sourceTitle: "Hotel Detail",
    sourceAuthor: "DetailsPro",
    sourceUrl: "https://detailspro.app/community/design/44047BF2-EA59-4EB8-B586-610EB5E2B54F/",
    sourcePreviewUrl: "https://d1w362hbd8dnhw.cloudfront.net/C19BBD33-32D8-414E-B142-EE75FD7BB69D.jpg",
    accentHexA: "F97316",
    accentHexB: "EF4444",
    badge: "Lifetime Access",
    headline: "Pay once, keep forever",
    supportingLine: "No renewals. Includes all future premium packs.",
    metricLeftLabel: "One-time",
    metricLeftValue: "$129",
    metricRightLabel: "Value",
    metricRightValue: "17 mo",
    ctaLabel: "Unlock",
  },
  {
    key: "social-creator-circle-invite",
    slug: "social-creator-circle-invite",
    title: "Social Creator Circle Invite",
    summary:
      "A social invite module with host chips, room timing, and RSVP action designed in soft layered detailspro style.",
    description:
      "Social Creator Circle Invite is a rewritten community event card for creator spaces and member onboarding prompts.",
    categoryName: "Social",
    pattern: "communityBanner",
    sourceTitle: "New Mail Widget",
    sourceAuthor: "Sahand",
    sourceUrl: "https://detailspro.app/community/design/2090D819-1958-46A8-B408-D422B24584F5/",
    sourcePreviewUrl: "https://d1w362hbd8dnhw.cloudfront.net/A743F4FC-ABB1-446B-8304-39157708EA97.jpg",
    accentHexA: "EC4899",
    accentHexB: "8B5CF6",
    badge: "Creator Circle",
    headline: "Invite to private room",
    supportingLine: "Live feedback session starts at 20:30.",
    metricLeftLabel: "Hosts",
    metricLeftValue: "3",
    metricRightLabel: "Seats",
    metricRightValue: "18 left",
    ctaLabel: "RSVP",
  },
  {
    key: "social-live-event-reminder",
    slug: "social-live-event-reminder",
    title: "Social Live Event Reminder",
    summary:
      "A reminder card for upcoming community events with compact audience stats and quick join affordance.",
    description:
      "Social Live Event Reminder repurposes copycat-detailspro visual principles for recurring event and attendance flows.",
    categoryName: "Social",
    pattern: "profileGrid",
    sourceTitle: "TimeZone Widget",
    sourceAuthor: "Emilio",
    sourceUrl: "https://detailspro.app/community/design/6262AB10-8339-4888-86B8-8D73B7D54A73/",
    sourcePreviewUrl: "https://d1w362hbd8dnhw.cloudfront.net/A8B775A7-54D4-4FF5-A35B-714D8435096B.jpg",
    accentHexA: "06B6D4",
    accentHexB: "3B82F6",
    badge: "Live Event",
    headline: "Design teardown starts soon",
    supportingLine: "Reminder set for your followed creators panel.",
    metricLeftLabel: "Watching",
    metricLeftValue: "426",
    metricRightLabel: "Starts",
    metricRightValue: "9:00 PM",
    ctaLabel: "Join",
  },
];

function escapeSwift(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function renderGamingSwift(item: SourceItem, subtitle: string) {
  return `import SwiftUI

struct ContentView: View {
    @Environment(\\.colorScheme) private var colorScheme

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(.systemBackground),
                    Color(hex: "${item.accentHexA}").opacity(colorScheme == .dark ? 0.30 : 0.12)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 16) {
                Text("${escapeSwift(item.title)}")
                    .font(.system(size: 32, weight: .black, design: .rounded))

                Text("${escapeSwift(subtitle)}")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)

                Text("${escapeSwift(item.badge)}")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color(hex: "${item.accentHexA}").opacity(0.20), in: Capsule())

                HStack(spacing: 10) {
                    StatPill(title: "${escapeSwift(item.metricLeftLabel)}", value: "${escapeSwift(item.metricLeftValue)}")
                    StatPill(title: "${escapeSwift(item.metricRightLabel)}", value: "${escapeSwift(item.metricRightValue)}")
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text("${escapeSwift(item.headline)}")
                        .font(.system(size: 22, weight: .bold, design: .rounded))

                    Text("${escapeSwift(item.supportingLine)}")
                        .font(.system(size: 14, weight: .medium, design: .rounded))
                        .foregroundStyle(.secondary)

                    ProgressView(value: 0.72)
                        .tint(Color(hex: "${item.accentHexB}"))

                    Button("${escapeSwift(item.ctaLabel)}") {}
                        .buttonStyle(.borderedProminent)
                        .tint(Color(hex: "${item.accentHexA}"))
                }
                .padding(18)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(colorScheme == .dark ? Color.white.opacity(0.14) : Color.black.opacity(0.08), lineWidth: 1)
                )
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
    }
}

private struct StatPill: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 11, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.system(size: 18, weight: .black, design: .rounded))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
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

function renderPaywallSwift(item: SourceItem, subtitle: string) {
  return `import SwiftUI

struct ContentView: View {
    @Environment(\\.colorScheme) private var colorScheme
    @State private var annual = true

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(.systemBackground),
                    Color(hex: "${item.accentHexA}").opacity(colorScheme == .dark ? 0.28 : 0.12)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 14) {
                Text("${escapeSwift(item.title)}")
                    .font(.system(size: 32, weight: .black, design: .rounded))

                Text("${escapeSwift(subtitle)}")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)

                Text("${escapeSwift(item.badge)}")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color(hex: "${item.accentHexA}").opacity(0.20), in: Capsule())

                Picker("Billing", selection: $annual) {
                    Text("Annual").tag(true)
                    Text("Monthly").tag(false)
                }
                .pickerStyle(.segmented)

                VStack(alignment: .leading, spacing: 12) {
                    Text("${escapeSwift(item.headline)}")
                        .font(.system(size: 22, weight: .bold, design: .rounded))

                    Text("${escapeSwift(item.supportingLine)}")
                        .font(.system(size: 14, weight: .medium, design: .rounded))
                        .foregroundStyle(.secondary)

                    HStack(spacing: 10) {
                        StatPill(title: "${escapeSwift(item.metricLeftLabel)}", value: annual ? "${escapeSwift(item.metricLeftValue)}" : "${escapeSwift(item.metricRightValue)}")
                        StatPill(title: annual ? "${escapeSwift(item.metricRightLabel)}" : "${escapeSwift(item.metricLeftLabel)}", value: annual ? "${escapeSwift(item.metricRightValue)}" : "${escapeSwift(item.metricLeftValue)}")
                    }

                    featureRow("Unlimited component exports")
                    featureRow("Priority sync and backup")
                    featureRow("Cross-device premium access")

                    Button("${escapeSwift(item.ctaLabel)}") {}
                        .buttonStyle(.borderedProminent)
                        .tint(Color(hex: "${item.accentHexA}"))
                        .frame(maxWidth: .infinity)
                }
                .padding(18)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(colorScheme == .dark ? Color.white.opacity(0.14) : Color.black.opacity(0.08), lineWidth: 1)
                )
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
    }

    private func featureRow(_ text: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(Color(hex: "${item.accentHexB}"))
            Text(text)
                .font(.system(size: 13, weight: .semibold, design: .rounded))
            Spacer(minLength: 0)
        }
    }
}

private struct StatPill: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 11, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.system(size: 18, weight: .black, design: .rounded))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(Color.primary.opacity(0.06), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
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

function renderSocialSwift(item: SourceItem, subtitle: string) {
  return `import SwiftUI

struct ContentView: View {
    @Environment(\\.colorScheme) private var colorScheme

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(.systemBackground),
                    Color(hex: "${item.accentHexA}").opacity(colorScheme == .dark ? 0.24 : 0.10)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 16) {
                Text("${escapeSwift(item.title)}")
                    .font(.system(size: 32, weight: .black, design: .rounded))

                Text("${escapeSwift(subtitle)}")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)

                Text("${escapeSwift(item.badge)}")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color(hex: "${item.accentHexA}").opacity(0.20), in: Capsule())

                HStack(spacing: 8) {
                    PersonBubble(initials: "MK", colorHex: "${item.accentHexA}")
                    PersonBubble(initials: "AL", colorHex: "${item.accentHexB}")
                    PersonBubble(initials: "RY", colorHex: "22C55E")
                    Spacer(minLength: 0)
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text("${escapeSwift(item.headline)}")
                        .font(.system(size: 22, weight: .bold, design: .rounded))

                    Text("${escapeSwift(item.supportingLine)}")
                        .font(.system(size: 14, weight: .medium, design: .rounded))
                        .foregroundStyle(.secondary)

                    HStack(spacing: 10) {
                        StatPill(title: "${escapeSwift(item.metricLeftLabel)}", value: "${escapeSwift(item.metricLeftValue)}")
                        StatPill(title: "${escapeSwift(item.metricRightLabel)}", value: "${escapeSwift(item.metricRightValue)}")
                    }

                    Button("${escapeSwift(item.ctaLabel)}") {}
                        .buttonStyle(.borderedProminent)
                        .tint(Color(hex: "${item.accentHexA}"))
                }
                .padding(18)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(colorScheme == .dark ? Color.white.opacity(0.14) : Color.black.opacity(0.08), lineWidth: 1)
                )
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
    }
}

private struct PersonBubble: View {
    let initials: String
    let colorHex: String

    var body: some View {
        Text(initials)
            .font(.system(size: 12, weight: .bold, design: .rounded))
            .foregroundStyle(.white)
            .frame(width: 40, height: 40)
            .background(Color(hex: colorHex), in: Circle())
    }
}

private struct StatPill: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 11, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.system(size: 18, weight: .black, design: .rounded))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(Color.primary.opacity(0.06), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
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

function renderComponentSwift(item: SourceItem) {
  const subtitle = `Adapted from copycat-detailspro style · source: ${item.sourceTitle} by ${item.sourceAuthor}`;

  switch (item.categoryName) {
    case "Gaming":
      return renderGamingSwift(item, subtitle);
    case "Paywall":
      return renderPaywallSwift(item, subtitle);
    case "Social":
      return renderSocialSwift(item, subtitle);
    default:
      return renderGamingSwift(item, subtitle);
  }
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
      sourceTitle: item.sourceTitle,
      sourceAuthor: item.sourceAuthor,
      sourceUrl: item.sourceUrl,
      sourcePreviewUrl: item.sourcePreviewUrl,
      categoryName: item.categoryName,
      pattern: item.pattern,
      seed: startSeed + index,
      folderName: `${id}-${item.slug}`,
      seedTitle: item.title,
      summary: `${item.summary} Rewritten in pure SwiftUI with adaptive light and dark support.`,
      description: `${item.description} This component follows the visual language from copycat-detailspro while introducing fresh structure and implementation details.`,
      changelog:
        "Added as a style-following expansion from copycat-detailspro to improve seed variety in underrepresented categories.",
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
      site: "detailspro.app",
      url: item.sourceUrl,
      author: item.sourceAuthor,
    },
  }));

  await writeFile(
    path.join(SEED_CODE_ROOT, "detailspro-variety-port-components.json"),
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
            title: source.sourceTitle,
            author: source.sourceAuthor,
            styleBase: "copycat-detailspro",
            sourceUrl: source.sourceUrl,
            previewUrl: source.sourcePreviewUrl,
          },
          port: {
            slug: item.slug,
            title: item.seedTitle,
            categoryName: item.categoryName,
            pattern: item.pattern,
            seed: item.seed,
            folderName: item.folderName,
          },
        },
        null,
        2
      )}\n`
    );

    await writeFile(
      path.join(copycatDir, "source-code.swift"),
      `// Style reference notes for ${source.sourceTitle} by ${source.sourceAuthor}\n// Rewritten from scratch for CopyMyUI.\n`,
      "utf8"
    );
    await writeFile(path.join(copycatDir, "preview-url.txt"), `${source.sourcePreviewUrl}\n`, "utf8");

    if (previewData) {
      await writeFile(path.join(copycatDir, `source-preview${previewExt}`), previewData);
    }

    const swift = renderComponentSwift(source);
    await writeFile(path.join(researchDir, "content.swift"), swift, "utf8");
  }

  console.log(`DetailsPro variety components prepared: ${portItems.length}`);
  console.log(`DetailsPro variety start ID: ${String(startId).padStart(3, "0")}`);
  console.log(`DetailsPro variety seed start: ${startSeed}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
