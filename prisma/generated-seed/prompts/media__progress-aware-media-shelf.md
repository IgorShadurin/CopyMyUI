You are generating a single SwiftUI component for CopyMyUI.

Primary objective:
- Build one polished, reusable SwiftUI component inspired by a real popular iOS app.
- Use /Users/test/XCodeProjects/CopyMyUI as the scratch app.
- Keep /Users/test/XCodeProjects/CopyMyUI/AudioToAudio/App/ContentView.swift valid at all times.
- Write the finished component source to /Users/test/web/copymyui/prisma/generated-seed/work/media__progress-aware-media-shelf/component.swift first, then copy that completed file into /Users/test/XCodeProjects/CopyMyUI/AudioToAudio/App/ContentView.swift as a final step.
- Run the app on the "Sim2" simulator.
- Capture real simulator screenshots of the component.
- Review the screenshots visually yourself before finishing.
- Use shell commands only for execution. Do not browse the web and do not use MCP tools for this task.

Category:
- Media

Topic brief:
- Title hint: Progress-Aware Media Shelf
- Reference app: Netflix
- Why it matters: Official App Store listings for Netflix, YouTube, and Apple Music repeatedly use horizontal content shelves with bold artwork, brief metadata, badges, and resume progress to make large catalogs scannable on mobile.
- End-user value: Helps users browse, compare, and resume shows, videos, or albums quickly from a home feed or detail page.
- App Store search hint: Netflix https://apps.apple.com/us/app/id363590051 | YouTube https://apps.apple.com/us/app/id544007664 | Apple Music https://apps.apple.com/us/app/id1108187390
- Differentiator: This should be more than a plain carousel: the seed should support in-progress bars, live or premium badges, mixed editorial and personalized cards, and compact secondary actions.
- Suggested states: editorial featured card, in-progress resume card, live or premiere badge, premium locked card

Output files you must write:
- Save the final SwiftUI code copy to: /Users/test/web/copymyui/prisma/generated-seed/work/media__progress-aware-media-shelf/component.swift
- Save raw simulator screenshots into: /Users/test/web/copymyui/public/generated-seed/media__progress-aware-media-shelf/raw

Screenshot workflow requirements:
- Use the raw simulator screenshot flow from the iOS screenshot skill.
- Set simulator status bar to 9:41 with strong signal/battery.
- Never show real current time.
- Capture 1 required state and at most 2 states total.
- If you capture multiple states, add dark mode only when it materially improves the showcase.
- The screenshot must clearly contain the component, not an empty wallpaper or blank app shell.
- Before finishing, inspect each screenshot and discard/regenerate any screenshot where the component is not clearly visible or not appealing.

Implementation requirements:
- The component must be original SwiftUI code created by you.
- Use the topic brief as the primary research input. Do not perform extra web research during execution.
- The design can be improved relative to the reference app, but the inspiration must be grounded in a real app pattern.
- Keep the component useful for CopyMyUI users as a reusable building block.
- Write descriptive metadata:
  - title: max 80 chars
  - summary: 20-160 chars
  - description: 40-1400 chars
- Use only SwiftUI.
- Write the final assistant response as JSON only, with no markdown and no extra commentary.

Suggested execution flow:
1. Use the supplied topic brief and reference app name to identify one strong reusable UI pattern.
2. Write the finished SwiftUI file to /Users/test/web/copymyui/prisma/generated-seed/work/media__progress-aware-media-shelf/component.swift.
3. Copy /Users/test/web/copymyui/prisma/generated-seed/work/media__progress-aware-media-shelf/component.swift to /Users/test/XCodeProjects/CopyMyUI/AudioToAudio/App/ContentView.swift only after the file is complete.
4. Build and run on Sim2 with shell commands.
5. Capture raw screenshots into /Users/test/web/copymyui/public/generated-seed/media__progress-aware-media-shelf/raw.
6. Visually review screenshots yourself and iterate if needed.
7. Finish immediately with a JSON-only final response matching the schema.

Execution note:
- If Xcode MCP tools are unavailable, use shell commands directly with xcodebuild, Simulator, and xcrun simctl.
- The orchestrator captures your final JSON response automatically. You do not need to write /Users/test/web/copymyui/prisma/generated-seed/results/media__progress-aware-media-shelf.json yourself.

Job info:
- Job id: media__progress-aware-media-shelf
- Working directory: /Users/test/web/copymyui/prisma/generated-seed/work/media__progress-aware-media-shelf

Return JSON matching the provided schema only.
