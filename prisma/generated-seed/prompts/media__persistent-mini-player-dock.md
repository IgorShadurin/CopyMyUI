You are generating a single SwiftUI component for CopyMyUI.

Primary objective:
- Build one polished, reusable SwiftUI component inspired by a real popular iOS app.
- Use /Users/test/XCodeProjects/CopyMyUI as the scratch app.
- Keep /Users/test/XCodeProjects/CopyMyUI/AudioToAudio/App/ContentView.swift valid at all times.
- Write the finished component source to /Users/test/web/copymyui/prisma/generated-seed/work/media__persistent-mini-player-dock/component.swift first, then copy that completed file into /Users/test/XCodeProjects/CopyMyUI/AudioToAudio/App/ContentView.swift as a final step.
- Run the app on the "Sim2" simulator.
- Capture real simulator screenshots of the component.
- Review the screenshots visually yourself before finishing.
- Use shell commands only for execution. Do not browse the web and do not use MCP tools for this task.

Category:
- Media

Topic brief:
- Title hint: Persistent Mini Player Dock
- Reference app: Spotify
- Why it matters: Official App Store screenshots for Spotify, Apple Music, Audible, and Pocket Casts consistently surface a compact bottom player that keeps playback context visible while users browse elsewhere in the app.
- End-user value: Lets listeners pause, resume, and reopen full playback from anywhere without losing their place.
- App Store search hint: Spotify https://apps.apple.com/us/app/id324684580 | Apple Music https://apps.apple.com/us/app/id1108187390 | Pocket Casts https://apps.apple.com/us/app/id414834813 | Audible https://apps.apple.com/us/app/id379693831
- Differentiator: Unlike a generic bottom bar, this component needs playback-aware states like artwork, progress, route handoff, buffering, and offline status in a compact expandable shell.
- Suggested states: collapsed playing, collapsed paused, buffering, offline downloaded item

Output files you must write:
- Save the final SwiftUI code copy to: /Users/test/web/copymyui/prisma/generated-seed/work/media__persistent-mini-player-dock/component.swift
- Save raw simulator screenshots into: /Users/test/web/copymyui/public/generated-seed/media__persistent-mini-player-dock/raw

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
2. Write the finished SwiftUI file to /Users/test/web/copymyui/prisma/generated-seed/work/media__persistent-mini-player-dock/component.swift.
3. Copy /Users/test/web/copymyui/prisma/generated-seed/work/media__persistent-mini-player-dock/component.swift to /Users/test/XCodeProjects/CopyMyUI/AudioToAudio/App/ContentView.swift only after the file is complete.
4. Build and run on Sim2 with shell commands.
5. Capture raw screenshots into /Users/test/web/copymyui/public/generated-seed/media__persistent-mini-player-dock/raw.
6. Visually review screenshots yourself and iterate if needed.
7. Finish immediately with a JSON-only final response matching the schema.

Execution note:
- If Xcode MCP tools are unavailable, use shell commands directly with xcodebuild, Simulator, and xcrun simctl.
- The orchestrator captures your final JSON response automatically. You do not need to write /Users/test/web/copymyui/prisma/generated-seed/results/media__persistent-mini-player-dock.json yourself.

Job info:
- Job id: media__persistent-mini-player-dock
- Working directory: /Users/test/web/copymyui/prisma/generated-seed/work/media__persistent-mini-player-dock

Return JSON matching the provided schema only.
