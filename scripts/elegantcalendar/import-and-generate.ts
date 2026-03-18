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
  categoryName: CategoryName;
  pattern: SeedPattern;
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
const SITE = "elegantcalendar";
const COPYCAT_ROOT = path.join(ROOT, "public", "uploads", `copycat-${SITE}`);
const RESEARCH_ROOT = path.join(ROOT, "public", "uploads", "research");
const SEED_CODE_ROOT = path.join(ROOT, "prisma", "seed-code");
const START_SEED = 900;

const REPO = "https://github.com/ThasianX/ElegantCalendar";
const README = `${REPO}/blob/master/README.md`;
const EXAMPLE_CALENDAR =
  `${REPO}/blob/master/Example/Example/Calendar%20with%20Accessory%20View/ExampleCalendarView.swift`;
const EXAMPLE_MONTHLY =
  `${REPO}/blob/master/Example/Example/Individual%20Views/ExampleMonthlyCalendarView.swift`;
const EXAMPLE_YEARLY =
  `${REPO}/blob/master/Example/Example/Individual%20Views/ExampleYearlyCalendarView.swift`;
const EXAMPLE_SELECTION =
  `${REPO}/blob/master/Example/Example/Selection%20and%20Exit/ExampleSelectionView.swift`;
const EXAMPLE_VISITS =
  `${REPO}/blob/master/Example/Example/Calendar%20with%20Accessory%20View/VisitsListView.swift`;
const EXAMPLE_THEME =
  `${REPO}/blob/master/Example/Example/Shared/ChangeThemeButton.swift`;

const PREVIEW_DARK =
  "https://raw.githubusercontent.com/ThasianX/GIFs/master/ElegantCalendar/dark_demo.gif";
const PREVIEW_LIGHT =
  "https://raw.githubusercontent.com/ThasianX/GIFs/master/ElegantCalendar/light_demo.gif";
const PREVIEW_ROYALBLUE =
  "https://raw.githubusercontent.com/ThasianX/ElegantCalendar/master/Screenshots/royalblue.PNG";
const PREVIEW_MAUVE =
  "https://raw.githubusercontent.com/ThasianX/ElegantCalendar/master/Screenshots/mauvePurple.PNG";

const sourceItems: SourceItem[] = [
  {
    key: "full-horizontal",
    slug: "elegant-calendar-full-horizontal",
    title: "Elegant Calendar Full Horizontal",
    summary: "Full calendar flow with horizontal month-year paging adaptation.",
    sourceUrl: README,
    sourcePreviewUrl: PREVIEW_LIGHT,
    sourceSnippet: "ElegantCalendarView with default horizontal axis.",
    categoryName: "Navigation",
    pattern: "segmentedRail",
  },
  {
    key: "full-vertical",
    slug: "elegant-calendar-full-vertical",
    title: "Elegant Calendar Full Vertical",
    summary: "Full calendar flow with vertical month-year arrangement adaptation.",
    sourceUrl: README,
    sourcePreviewUrl: PREVIEW_DARK,
    sourceSnippet: "ElegantCalendarView(...).vertical()",
    categoryName: "Navigation",
    pattern: "sidebarFlow",
  },
  {
    key: "monthly-view",
    slug: "elegant-calendar-monthly-view",
    title: "Elegant Calendar Monthly View",
    summary: "Standalone monthly calendar inspired by MonthlyCalendarView.",
    sourceUrl: EXAMPLE_MONTHLY,
    sourcePreviewUrl: PREVIEW_ROYALBLUE,
    sourceSnippet: "MonthlyCalendarView with selectable days and date callbacks.",
    categoryName: "Forms",
    pattern: "formWizard",
  },
  {
    key: "yearly-view",
    slug: "elegant-calendar-yearly-view",
    title: "Elegant Calendar Yearly View",
    summary: "Standalone yearly overview inspired by YearlyCalendarView.",
    sourceUrl: EXAMPLE_YEARLY,
    sourcePreviewUrl: PREVIEW_MAUVE,
    sourceSnippet: "YearlyCalendarView with month selection callbacks.",
    categoryName: "Dashboards",
    pattern: "metricsDeck",
  },
  {
    key: "selection-flow",
    slug: "elegant-calendar-selection-flow",
    title: "Elegant Calendar Selection Flow",
    summary: "Date selection and dismiss flow inspired by selection-and-exit demo.",
    sourceUrl: EXAMPLE_SELECTION,
    sourcePreviewUrl: PREVIEW_LIGHT,
    sourceSnippet: "Selection model toggles calendar and closes after day selection.",
    categoryName: "Forms",
    pattern: "onboardingFlow",
  },
  {
    key: "accessory-view",
    slug: "elegant-calendar-accessory-view",
    title: "Elegant Calendar Accessory View",
    summary: "Selected-day accessory list inspired by visits preview demo.",
    sourceUrl: EXAMPLE_VISITS,
    sourcePreviewUrl: PREVIEW_ROYALBLUE,
    sourceSnippet: "calendar(viewForSelectedDate:) returning an accessory list view.",
    categoryName: "Forms",
    pattern: "feedbackSteps",
  },
  {
    key: "theme-switcher",
    slug: "elegant-calendar-theme-switcher",
    title: "Elegant Calendar Theme Switcher",
    summary: "Theme rotation control inspired by ChangeThemeButton behavior.",
    sourceUrl: EXAMPLE_THEME,
    sourcePreviewUrl: PREVIEW_MAUVE,
    sourceSnippet: "Randomly selecting calendar themes and applying to the view.",
    categoryName: "Dashboards",
    pattern: "opsBoard",
  },
  {
    key: "range-navigation",
    slug: "elegant-calendar-range-navigation",
    title: "Elegant Calendar Range Navigation",
    summary: "Wide date-range monthly navigation inspired by configuration ranges.",
    sourceUrl: README,
    sourcePreviewUrl: PREVIEW_LIGHT,
    sourceSnippet: "CalendarConfiguration(startDate:endDate:) with broad ranges.",
    categoryName: "Navigation",
    pattern: "commandSheet",
  },
  {
    key: "excluded-days",
    slug: "elegant-calendar-excluded-days",
    title: "Elegant Calendar Excluded Days",
    summary: "Selectable day rules inspired by canSelectDate datasource API.",
    sourceUrl: EXAMPLE_MONTHLY,
    sourcePreviewUrl: PREVIEW_DARK,
    sourceSnippet: "calendar(canSelectDate:) disabling specific day patterns.",
    categoryName: "Forms",
    pattern: "credentialPanel",
  },
  {
    key: "today-jump",
    slug: "elegant-calendar-today-jump",
    title: "Elegant Calendar Today Jump",
    summary: "Month navigator with quick jump-to-today inspired by scroll APIs.",
    sourceUrl: README,
    sourcePreviewUrl: PREVIEW_ROYALBLUE,
    sourceSnippet: "scrollBackToToday and scrollToMonth style interactions.",
    categoryName: "Navigation",
    pattern: "tabBarOrbit",
  },
];

function escapeSwift(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function sharedMonthLogic(title: string, subtitle: string) {
  return `import SwiftUI

private let dayColumns = Array(repeating: GridItem(.flexible(), spacing: 6), count: 7)
private let weekdaySymbols = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

struct ContentView: View {
    @State private var activeMonth = Date()
    @State private var selectedDate: Date?

    private let calendar = Calendar.current

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("${escapeSwift(title)}")
                .font(.system(size: 30, weight: .black, design: .rounded))
            Text("${escapeSwift(subtitle)}")
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)

            monthHeader
            weekdayHeader
            monthGrid

            if let selectedDate {
                Text("Selected: \\(dateLabel(selectedDate))")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)
            } else {
                Text("Select a day")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)
            }
        }
        .padding(22)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemBackground).ignoresSafeArea())
    }

    private var monthHeader: some View {
        HStack {
            Button {
                shiftMonth(-1)
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 14, weight: .bold))
            }

            Spacer()
            Text(monthLabel(activeMonth))
                .font(.system(size: 20, weight: .bold, design: .rounded))
            Spacer()

            Button {
                shiftMonth(1)
            } label: {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .bold))
            }
        }
    }

    private var weekdayHeader: some View {
        LazyVGrid(columns: dayColumns, spacing: 6) {
            ForEach(weekdaySymbols, id: \\.self) { symbol in
                Text(symbol)
                    .font(.system(size: 11, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
            }
        }
    }

    private var monthGrid: some View {
        LazyVGrid(columns: dayColumns, spacing: 6) {
            ForEach(Array(daysForMonth(activeMonth).enumerated()), id: \\.offset) { _, day in
                if let day {
                    Button {
                        selectedDate = day
                    } label: {
                        Text("\\(calendar.component(.day, from: day))")
                            .font(.system(size: 14, weight: .semibold, design: .rounded))
                            .frame(maxWidth: .infinity, minHeight: 34)
                            .background(
                                RoundedRectangle(cornerRadius: 8, style: .continuous)
                                    .fill(isSameDay(day, selectedDate) ? Color.accentColor.opacity(0.22) : Color.secondary.opacity(0.08))
                            )
                    }
                    .buttonStyle(.plain)
                } else {
                    Color.clear.frame(height: 34)
                }
            }
        }
    }

    private func shiftMonth(_ value: Int) {
        if let next = calendar.date(byAdding: .month, value: value, to: activeMonth) {
            activeMonth = next
        }
    }

    private func daysForMonth(_ month: Date) -> [Date?] {
        guard let start = calendar.date(from: calendar.dateComponents([.year, .month], from: month)),
              let range = calendar.range(of: .day, in: .month, for: start) else {
            return []
        }

        let weekday = calendar.component(.weekday, from: start)
        let leading = (weekday - calendar.firstWeekday + 7) % 7
        var result = Array<Date?>(repeating: nil, count: leading)
        result.append(contentsOf: range.compactMap { day -> Date? in
            calendar.date(byAdding: .day, value: day - 1, to: start)
        })
        return result
    }

    private func monthLabel(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "LLLL yyyy"
        return formatter.string(from: date)
    }

    private func dateLabel(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }

    private func isSameDay(_ lhs: Date?, _ rhs: Date?) -> Bool {
        guard let lhs, let rhs else { return false }
        return calendar.isDate(lhs, inSameDayAs: rhs)
    }
}

#Preview { ContentView() }
`;
}

function renderComponentSwift(item: SourceItem) {
  switch (item.key) {
    case "full-horizontal":
      return `import SwiftUI

struct ContentView: View {
    @State private var tab = 0

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Elegant full calendar")
                .font(.system(size: 30, weight: .black, design: .rounded))
            Text("Horizontal paging between yearly and monthly layers.")
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)

            Picker("Layer", selection: $tab) {
                Text("Year").tag(0)
                Text("Month").tag(1)
            }
            .pickerStyle(.segmented)

            TabView(selection: $tab) {
                YearOverviewCard().tag(0)
                MonthOverviewCard().tag(1)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .frame(height: 420)
        }
        .padding(22)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

private struct YearOverviewCard: View {
    private let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    private let columns = [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 8) {
            ForEach(months, id: \\.self) { month in
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(Color.accentColor.opacity(0.14))
                    .frame(height: 72)
                    .overlay(
                        Text(month)
                            .font(.system(size: 14, weight: .bold, design: .rounded))
                    )
            }
        }
        .padding(14)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

private struct MonthOverviewCard: View {
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 6), count: 7)

    var body: some View {
        LazyVGrid(columns: columns, spacing: 6) {
            ForEach(1...35, id: \\.self) { value in
                let isVisibleDay = value <= 30
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(value % 7 == 0 ? Color.accentColor.opacity(0.2) : Color.secondary.opacity(0.08))
                    .frame(height: 34)
                    .overlay(
                        Text(isVisibleDay ? String(value) : "")
                            .font(.system(size: 12, weight: .semibold, design: .rounded))
                    )
            }
        }
        .padding(14)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

#Preview { ContentView() }
`;
    case "full-vertical":
      return `import SwiftUI

struct ContentView: View {
    private let columns = [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())]
    private let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Elegant full calendar")
                    .font(.system(size: 30, weight: .black, design: .rounded))
                Text("Vertical layout stacking year and month sections.")
                    .foregroundStyle(.secondary)

                Text("Year overview")
                    .font(.system(size: 18, weight: .bold, design: .rounded))

                LazyVGrid(columns: columns, spacing: 8) {
                    ForEach(months, id: \\.self) { month in
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(Color.accentColor.opacity(0.14))
                            .frame(height: 70)
                            .overlay(Text(month).font(.system(size: 14, weight: .bold, design: .rounded)))
                    }
                }

                Text("Month details")
                    .font(.system(size: 18, weight: .bold, design: .rounded))

                MonthBlock()
            }
            .padding(22)
        }
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

private struct MonthBlock: View {
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 6), count: 7)

    var body: some View {
        LazyVGrid(columns: columns, spacing: 6) {
            ForEach(1...35, id: \\.self) { value in
                let isVisibleDay = value <= 30
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.secondary.opacity(0.08))
                    .frame(height: 34)
                    .overlay(
                        Text(isVisibleDay ? String(value) : "")
                            .font(.system(size: 12, weight: .semibold, design: .rounded))
                    )
            }
        }
        .padding(14)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

#Preview { ContentView() }
`;
    case "monthly-view":
      return sharedMonthLogic(
        "Monthly calendar view",
        "Standalone month adaptation with selectable day cells."
      );
    case "yearly-view":
      return `import SwiftUI

struct ContentView: View {
    @State private var selectedMonth = "Jan"
    private let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    private let columns = [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Yearly calendar view")
                .font(.system(size: 30, weight: .black, design: .rounded))
            Text("Quick month jump grid with focus state.")
                .foregroundStyle(.secondary)

            LazyVGrid(columns: columns, spacing: 10) {
                ForEach(months, id: \\.self) { month in
                    Button {
                        selectedMonth = month
                    } label: {
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(selectedMonth == month ? Color.accentColor.opacity(0.22) : Color.secondary.opacity(0.08))
                            .frame(height: 86)
                            .overlay(
                                VStack(spacing: 6) {
                                    Text(month)
                                        .font(.system(size: 15, weight: .bold, design: .rounded))
                                    Text("\\(Int.random(in: 2...12)) events")
                                        .font(.system(size: 11, weight: .medium, design: .rounded))
                                        .foregroundStyle(.secondary)
                                }
                            )
                    }
                    .buttonStyle(.plain)
                }
            }

            Text("Selected month: \\(selectedMonth)")
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)
        }
        .padding(22)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
    case "selection-flow":
      return `import SwiftUI

struct ContentView: View {
    @State private var showCalendar = false
    @State private var selected = "No date selected"

    var body: some View {
        ZStack {
            VStack(spacing: 18) {
                Text("Date selection flow")
                    .font(.system(size: 30, weight: .black, design: .rounded))
                Text(selected)
                    .foregroundStyle(.secondary)

                Button("Show Calendar") {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.9)) {
                        showCalendar = true
                    }
                }
                .buttonStyle(.borderedProminent)
            }

            if showCalendar {
                CalendarPickerOverlay { value in
                    selected = value
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.9)) {
                        showCalendar = false
                    }
                }
                .transition(.move(edge: .trailing).combined(with: .opacity))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

private struct CalendarPickerOverlay: View {
    let onSelect: (String) -> Void
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 6), count: 7)

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Pick a date")
                .font(.system(size: 22, weight: .black, design: .rounded))

            LazyVGrid(columns: columns, spacing: 6) {
                ForEach(1...35, id: \\.self) { day in
                    Button {
                        if day <= 30 {
                            onSelect("May \\(day), 2026")
                        }
                    } label: {
                        RoundedRectangle(cornerRadius: 8, style: .continuous)
                            .fill(day <= 30 ? Color.accentColor.opacity(0.18) : Color.secondary.opacity(0.05))
                            .frame(height: 32)
                            .overlay(
                                Text(day <= 30 ? "\\(day)" : "")
                                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(.ultraThinMaterial)
    }
}

#Preview { ContentView() }
`;
    case "accessory-view":
      return `import SwiftUI

private let accessoryColumns = Array(repeating: GridItem(.flexible(), spacing: 6), count: 7)
private let accessoryWeekdaySymbols = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

struct ContentView: View {
    @State private var activeMonth = Date()
    @State private var selectedDate: Date?
    private let calendar = Calendar.current

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Calendar accessory list")
                .font(.system(size: 30, weight: .black, design: .rounded))
            Text("Selected day reveals a contextual schedule panel.")
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)

            monthHeader
            weekdayHeader
            monthGrid

            if selectedDate != nil {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Agenda")
                        .font(.system(size: 15, weight: .bold, design: .rounded))
                    AccessoryRow(color: .teal, title: "Planning Session", time: "09:30")
                    AccessoryRow(color: .orange, title: "Client Check-in", time: "13:15")
                    AccessoryRow(color: .purple, title: "Wrap-up", time: "17:40")
                }
                .padding(14)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            }

            if let selectedDate {
                Text("Selected: \\(dateLabel(selectedDate))")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)
            } else {
                Text("Select a day")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)
            }
        }
        .padding(22)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemBackground).ignoresSafeArea())
    }

    private var monthHeader: some View {
        HStack {
            Button {
                shiftMonth(-1)
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 14, weight: .bold))
            }

            Spacer()
            Text(monthLabel(activeMonth))
                .font(.system(size: 20, weight: .bold, design: .rounded))
            Spacer()

            Button {
                shiftMonth(1)
            } label: {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .bold))
            }
        }
    }

    private var weekdayHeader: some View {
        LazyVGrid(columns: accessoryColumns, spacing: 6) {
            ForEach(accessoryWeekdaySymbols, id: \\.self) { symbol in
                Text(symbol)
                    .font(.system(size: 11, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
            }
        }
    }

    private var monthGrid: some View {
        LazyVGrid(columns: accessoryColumns, spacing: 6) {
            ForEach(Array(daysForMonth(activeMonth).enumerated()), id: \\.offset) { _, day in
                if let day {
                    Button {
                        selectedDate = day
                    } label: {
                        Text("\\(calendar.component(.day, from: day))")
                            .font(.system(size: 14, weight: .semibold, design: .rounded))
                            .frame(maxWidth: .infinity, minHeight: 34)
                            .background(
                                RoundedRectangle(cornerRadius: 8, style: .continuous)
                                    .fill(isSameDay(day, selectedDate) ? Color.accentColor.opacity(0.22) : Color.secondary.opacity(0.08))
                            )
                    }
                    .buttonStyle(.plain)
                } else {
                    Color.clear.frame(height: 34)
                }
            }
        }
    }

    private func shiftMonth(_ value: Int) {
        if let next = calendar.date(byAdding: .month, value: value, to: activeMonth) {
            activeMonth = next
        }
    }

    private func daysForMonth(_ month: Date) -> [Date?] {
        guard let start = calendar.date(from: calendar.dateComponents([.year, .month], from: month)),
              let range = calendar.range(of: .day, in: .month, for: start) else {
            return []
        }

        let weekday = calendar.component(.weekday, from: start)
        let leading = (weekday - calendar.firstWeekday + 7) % 7
        var result = Array<Date?>(repeating: nil, count: leading)
        result.append(contentsOf: range.compactMap { day -> Date? in
            calendar.date(byAdding: .day, value: day - 1, to: start)
        })
        return result
    }

    private func monthLabel(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "LLLL yyyy"
        return formatter.string(from: date)
    }

    private func dateLabel(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }

    private func isSameDay(_ lhs: Date?, _ rhs: Date?) -> Bool {
        guard let lhs, let rhs else { return false }
        return calendar.isDate(lhs, inSameDayAs: rhs)
    }
}

private struct AccessoryRow: View {
    let color: Color
    let title: String
    let time: String

    var body: some View {
        HStack {
            RoundedRectangle(cornerRadius: 3).fill(color).frame(width: 4, height: 26)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                Text(time)
                    .font(.system(size: 11, weight: .medium, design: .rounded))
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
    }
}

#Preview { ContentView() }
`;
    case "theme-switcher":
      return `import SwiftUI

struct ContentView: View {
    @State private var themeIndex = 0
    private let themes: [Color] = [.blue, .purple, .orange, .green, .pink, .indigo, .red, .teal]
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 6), count: 7)

    var body: some View {
        let theme = themes[themeIndex]

        VStack(alignment: .leading, spacing: 16) {
            Text("Calendar theme switcher")
                .font(.system(size: 30, weight: .black, design: .rounded))
            Text("Cycle through visual presets inspired by default themes.")
                .foregroundStyle(.secondary)

            Button("Change Theme") {
                themeIndex = (themeIndex + 1) % themes.count
            }
            .buttonStyle(.borderedProminent)

            LazyVGrid(columns: columns, spacing: 6) {
                ForEach(1...35, id: \\.self) { day in
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(day % 5 == 0 ? theme.opacity(0.24) : Color.secondary.opacity(0.08))
                        .frame(height: 34)
                        .overlay(
                            Text(day <= 30 ? "\\(day)" : "")
                                .font(.system(size: 12, weight: .semibold, design: .rounded))
                                .foregroundStyle(day % 5 == 0 ? theme : .primary)
                        )
                }
            }
        }
        .padding(22)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
    case "range-navigation":
      return sharedMonthLogic(
        "Range navigation",
        "Browse across a broad date horizon with month shifting."
      );
    case "excluded-days":
      return `import SwiftUI

private let excludedColumns = Array(repeating: GridItem(.flexible(), spacing: 6), count: 7)

struct ContentView: View {
    @State private var selectedDate: Int?
    private let excludedDays = Set([4, 11, 18, 25])

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Excluded days calendar")
                .font(.system(size: 30, weight: .black, design: .rounded))
            Text("Certain days are intentionally non-selectable.")
                .foregroundStyle(.secondary)

            LazyVGrid(columns: excludedColumns, spacing: 6) {
                ForEach(1...35, id: \\.self) { day in
                    if day <= 30 {
                        let disabled = excludedDays.contains(day)
                        Button {
                            if !disabled { selectedDate = day }
                        } label: {
                            RoundedRectangle(cornerRadius: 8, style: .continuous)
                                .fill(disabled ? Color.secondary.opacity(0.08) : (selectedDate == day ? Color.accentColor.opacity(0.22) : Color.secondary.opacity(0.08)))
                                .frame(height: 34)
                                .overlay(
                                    Text("\\(day)")
                                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                                        .foregroundStyle(disabled ? .secondary : .primary)
                                )
                        }
                        .buttonStyle(.plain)
                    } else {
                        Color.clear.frame(height: 34)
                    }
                }
            }
        }
        .padding(22)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}

#Preview { ContentView() }
`;
    case "today-jump":
      return `import SwiftUI

private let jumpColumns = Array(repeating: GridItem(.flexible(), spacing: 6), count: 7)

struct ContentView: View {
    @State private var monthOffset = 0

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Today jump navigator")
                .font(.system(size: 30, weight: .black, design: .rounded))
            Text("Jump instantly back to the current month.")
                .foregroundStyle(.secondary)

            HStack {
                Button("Prev") { monthOffset -= 1 }
                Spacer()
                Text(label)
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                Spacer()
                Button("Next") { monthOffset += 1 }
            }
            .buttonStyle(.bordered)

            Button("Today") {
                monthOffset = 0
            }
            .buttonStyle(.borderedProminent)

            LazyVGrid(columns: jumpColumns, spacing: 6) {
                ForEach(1...35, id: \\.self) { day in
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(day == 16 && monthOffset == 0 ? Color.accentColor.opacity(0.22) : Color.secondary.opacity(0.08))
                        .frame(height: 34)
                        .overlay(
                            Text(day <= 30 ? "\\(day)" : "")
                                .font(.system(size: 12, weight: .semibold, design: .rounded))
                        )
                }
            }
        }
        .padding(22)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemBackground).ignoresSafeArea())
    }

    private var label: String {
        let calendar = Calendar.current
        if let date = calendar.date(byAdding: .month, value: monthOffset, to: Date()) {
            let formatter = DateFormatter()
            formatter.dateFormat = "LLLL yyyy"
            return formatter.string(from: date)
        }
        return "Month"
    }
}

#Preview { ContentView() }
`;
    default:
      return sharedMonthLogic(item.title, item.summary);
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
      categoryName: item.categoryName,
      pattern: item.pattern,
      seed: START_SEED + index,
      folderName: `${id}-${item.slug}`,
      seedTitle: item.title,
      summary: `${item.summary} Rewritten for CopyMyUI with pure SwiftUI implementation and adaptive light/dark behavior.`,
      description: `${item.title} is a rewritten SwiftUI calendar component adapted from ElegantCalendar concepts. It keeps the core interaction pattern while avoiding external dependencies.`,
      changelog:
        "Rewritten from ElegantCalendar research with custom Swift-only implementation and simulator captures.",
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
      site: "github.com/ThasianX/ElegantCalendar",
      url: item.sourceUrl,
    },
  }));

  await writeFile(
    path.join(SEED_CODE_ROOT, "elegantcalendar-port-components.json"),
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

  console.log(`ElegantCalendar components prepared: ${portItems.length}`);
  console.log(`ElegantCalendar start ID: ${String(startId).padStart(3, "0")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
