# Repo Notes

- Run `npm run i18n:check` after any change to UI copy, routes that affect localized paths, or `src/i18n/messages.ts`.
- The i18n audit blocks on missing keys, extra keys, empty strings, placeholder mismatches, and non-English values that still match English exactly.
- If a string is intentionally identical across locales because it is a brand or product name, add its message path to the allowlist in [src/i18n/audit.ts](/Users/test/web/copymyui/src/i18n/audit.ts) with a clear reason.
- Do not reintroduce role-switching controls into the UI. For local user management, use `npm run user:create -- --email=<email>`, `npm run user:set-admin -- --email=<email>`, `npm run user:set-moderator -- --email=<email>`, or `npm run user:set-user -- --email=<email>`.
- Always keep checks green before handoff: `npm run lint` and tests (`npm test` or a scoped subset when appropriate) must pass for touched areas.

## UI Consistency Rules (Always Follow)

- Reuse shared UI primitives before adding one-off styles. Prefer [`AppActionButton`](/Users/test/web/copymyui/src/components/ui/app-action-button.tsx), [`Button`](/Users/test/web/copymyui/src/components/ui/button.tsx), and [`buttonVariants`](/Users/test/web/copymyui/src/components/ui/button-variants.ts).
- Do not duplicate CTA/button class strings across pages. If multiple screens need the same shape/size/tone, add or reuse a shared component/variant.
- For primary user actions in headers, rails, dialogs, and hero sections, include a relevant left icon by default (for example Google/Search/Plus/Chevron). Skip icons only when space is constrained or the action is purely textual metadata.
- Keep action sizing tokenized via shared props (`uiSize` / variant sizes) instead of hardcoding mixed `h-*` values per page.
- When adjusting button visuals globally (radius, height, spacing, icon positioning), update shared components first and then migrate usages; avoid local overrides unless strictly necessary.
