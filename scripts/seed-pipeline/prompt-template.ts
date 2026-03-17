import type { PipelineCategory } from "./config";
import type { JobRecord, TopicCandidate } from "./types";

function list(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function buildTopicGenerationPrompt(category: PipelineCategory, count: number) {
  return `
You are generating topic briefs for a SwiftUI component seed pipeline.

Category:
- Name: ${category.name}
- Slug: ${category.slug}
- Target count in this batch: ${count}

Reference iOS apps to research on the Apple App Store:
${list(category.referenceApps)}

Requirements:
- Output exactly ${count} topics.
- Every topic must be useful, production-facing, and non-duplicative.
- Base ideas on real mobile UI patterns from popular iOS apps.
- Do not invent fake app names.
- Prefer components that can stand alone as reusable SwiftUI building blocks.
- Avoid obvious duplicates such as ten variants of the same tab bar.
- Focus on what end users or product teams actually need.
- Use concise, descriptive titles that can fit a marketplace title limit of 80 chars.
- Summaries must be feasible later within 20-160 chars.
- Descriptions must be feasible later within 40-1400 chars.
- Include multiple possible visual states when a component benefits from them.

For app references:
- Use official Apple App Store listings as the primary visual research source.
- You may browse to confirm the app and its screenshots.
- Do not copy App Store images into the final dataset; they are research only.

Return structured JSON matching the provided schema.
`.trim();
}

export function buildComponentExecutionPrompt(args: {
  category: PipelineCategory;
  job: JobRecord;
  topic: TopicCandidate;
  jobWorkDir: string;
  rawImagesDir: string;
  codeOutputPath: string;
  resultJsonPath: string;
}) {
  const { category, job, topic, jobWorkDir, rawImagesDir, codeOutputPath, resultJsonPath } = args;

  return `
You are generating a single SwiftUI component for CopyMyUI.

Primary objective:
- Build one polished, reusable SwiftUI component inspired by a real popular iOS app.
- Use /Users/test/XCodeProjects/CopyMyUI as the scratch app.
- Keep ${"/Users/test/XCodeProjects/CopyMyUI/AudioToAudio/App/ContentView.swift"} valid at all times.
- Write the finished component source to ${codeOutputPath} first, then copy that completed file into ${"/Users/test/XCodeProjects/CopyMyUI/AudioToAudio/App/ContentView.swift"} as a final step.
- Run the app on the "Sim2" simulator.
- Capture real simulator screenshots of the component.
- Review the screenshots visually yourself before finishing.
- Use shell commands only for execution. Do not browse the web and do not use MCP tools for this task.

Category:
- ${category.name}

Topic brief:
- Title hint: ${topic.titleHint}
- Reference app: ${topic.appName}
- Why it matters: ${topic.rationale}
- End-user value: ${topic.targetUserValue}
- App Store search hint: ${topic.appStoreSearchHint}
- Differentiator: ${topic.differentiator}
- Suggested states: ${topic.states.join(", ")}

Output files you must write:
- Save the final SwiftUI code copy to: ${codeOutputPath}
- Save raw simulator screenshots into: ${rawImagesDir}

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
2. Write the finished SwiftUI file to ${codeOutputPath}.
3. Copy ${codeOutputPath} to ${"/Users/test/XCodeProjects/CopyMyUI/AudioToAudio/App/ContentView.swift"} only after the file is complete.
4. Build and run on Sim2 with shell commands.
5. Capture raw screenshots into ${rawImagesDir}.
6. Visually review screenshots yourself and iterate if needed.
7. Finish immediately with a JSON-only final response matching the schema.

Execution note:
- If Xcode MCP tools are unavailable, use shell commands directly with xcodebuild, Simulator, and xcrun simctl.
- The orchestrator captures your final JSON response automatically. You do not need to write ${resultJsonPath} yourself.

Job info:
- Job id: ${job.jobId}
- Working directory: ${jobWorkDir}

Return JSON matching the provided schema only.
`.trim();
}
