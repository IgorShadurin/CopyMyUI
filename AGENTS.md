# Repo Notes

- Run `npm run i18n:check` after any change to UI copy, routes that affect localized paths, or `src/i18n/messages.ts`.
- The i18n audit blocks on missing keys, extra keys, empty strings, placeholder mismatches, and non-English values that still match English exactly.
- If a string is intentionally identical across locales because it is a brand or product name, add its message path to the allowlist in [src/i18n/audit.ts](/Users/test/web/copymyui/src/i18n/audit.ts) with a clear reason.
- Do not reintroduce role-switching controls into the UI. For local user management, use `npm run user:create -- --email=<email>`, `npm run user:set-admin -- --email=<email>`, `npm run user:set-moderator -- --email=<email>`, or `npm run user:set-user -- --email=<email>`.
