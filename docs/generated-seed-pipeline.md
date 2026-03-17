# Generated Seed Pipeline

## Goal

Replace the current demo-heavy component seed with generated real-world SwiftUI components.

Current rollout rule:

- Keep `audio-trimmer`.
- Remove the rest of the legacy public sample dataset over time.
- Generate new components from real iOS app patterns by category.
- Only import validated generated manifests into the seed.

## Adjusted Rollout Plan

The full target is `100` generated components per category, but that is a long-running external batch. The safe rollout is:

1. Generate topic briefs per category.
2. Run a small pilot batch per category.
3. Inspect screenshots and manifests.
4. Tighten prompts and validators.
5. Run the large batch.
6. Validate all outputs.
7. Seed the database from validated manifests.

This repo now implements steps `1`, `2`, `3`, `6`, and `7` in a reusable way.

## Storage Layout

- Plan: `prisma/generated-seed/plan.json`
- Topic batches: `prisma/generated-seed/topics`
- Job registry: `prisma/generated-seed/jobs.json`
- Prompts: `prisma/generated-seed/prompts`
- Raw model results: `prisma/generated-seed/results`
- Final component manifests: `prisma/generated-seed/components`
- Generated code workdirs: `prisma/generated-seed/work/<job-id>`
- Raw screenshots: `public/generated-seed/<job-id>/raw`
- Framed screenshots: `public/generated-seed/<job-id>/framed`
- Preview screenshots: `public/generated-seed/<job-id>/preview`
- Site-ready JPG assets: `public/generated-seed/<job-id>/site`

## Scratch App Rules

Scratch app root:

- `/Users/test/XCodeProjects/CopyMyUI`

Scratch component file:

- `/Users/test/XCodeProjects/CopyMyUI/AudioToAudio/App/ContentView.swift`

Safety rule:

- The pipeline restores a backup of `ContentView.swift` if component execution fails.
- If the file is missing before a run, the pipeline recreates it from `scripts/seed-pipeline/templates/scratch-content-view.swift`.

## Commands

Initialize the plan:

```bash
npm run seed:pipeline -- init
```

Generate topic ideas for all categories:

```bash
npm run seed:pipeline -- generate-topics
```

Generate topic ideas for one category:

```bash
npm run seed:pipeline -- generate-topics --category=media --count=100
```

Run one job:

```bash
npm run seed:pipeline -- run-job --job=media__persistent-mini-player-dock
```

Start one job in the background with a dedicated log file:

```bash
npm run seed:pipeline -- start-job --job=media__persistent-mini-player-dock
```

Finalize a job when a result JSON already exists:

```bash
npm run seed:pipeline -- finalize-job --job=media__persistent-mini-player-dock
```

Reset a stale or interrupted job back to `topics-ready`:

```bash
npm run seed:pipeline -- reset-job --job=media__persistent-mini-player-dock
```

Validate generated manifests:

```bash
npm run seed:pipeline -- validate
```

Validate one job:

```bash
npm run seed:pipeline -- validate --job=media__persistent-mini-player-dock
```

Show registry status:

```bash
npm run seed:pipeline -- status
```

## Detached Batch Execution

Long `codex-proxy` runs are better launched outside an interactive terminal session.

Preferred:

```bash
npm run seed:pipeline -- start-job --job=media__persistent-mini-player-dock
```

Fallback:

```bash
nohup zsh -lc 'cd /Users/test/web/copymyui && npm run seed:pipeline -- run-job --job=media__persistent-mini-player-dock' \
  > /Users/test/web/copymyui/prisma/generated-seed/logs/media__persistent-mini-player-dock.log 2>&1 </dev/null &
```

Then inspect progress with:

```bash
tail -f prisma/generated-seed/logs/media__persistent-mini-player-dock.log
```

## Import Into Seed

`prisma/seed.ts` already loads generated manifests from:

- `prisma/generated-seed/components`

The current seed behavior is:

- preserve `audio-trimmer`
- ignore generated manifests that fail self-review
- convert raw generated screenshots into site-ready JPG assets
- seed generated manifests as approved free components

After validating generated manifests, reseed with:

```bash
npm run db:seed
```

## Expected Large-Batch Workflow

1. `npm run seed:pipeline -- init`
2. `npm run seed:pipeline -- generate-topics`
3. Run a pilot batch of several jobs across categories.
4. Inspect screenshots visually.
5. Adjust prompts if needed.
6. Launch the full detached batch category by category.
7. `npm run seed:pipeline -- validate`
8. Review errors and rerun failed jobs.
9. `npm run db:seed`
