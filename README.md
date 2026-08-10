# CopyMyUI: SwiftUI Marketplace

CopyMyUI is a curated SwiftUI marketplace for builders who want better iOS UI without starting from a blank canvas. It helps designers, indie hackers, product teams, and client developers discover polished SwiftUI patterns, save their favorites, buy premium components, and publish their own work through a moderated flow.

The product combines the feel of a modern component gallery with creator profiles, searchable categories, premium unlocks, and private drafting tools. Public visitors can browse shared components and creator pages without signing in, while creators can manage private drafts, screenshots, pricing, moderation updates, and API access from their dashboard.

## Why CopyMyUI

- Discover ready-to-use SwiftUI components across multiple UI categories.
- Browse free and premium examples with visual previews before opening code.
- Save favorites and quickly return to the patterns you want to reuse.
- Explore public creator profiles and see what each designer or developer has shared.
- Publish your own components through a review process that keeps the catalog clean.
- Unlock premium components after purchase while keeping source code protected before checkout.

## What Users Can Do

### For visitors

- Browse approved SwiftUI components without authentication.
- Search by component title, description, or author.
- Open dedicated category pages with relevant items and category context.
- Visit public creator pages and explore their shared free and premium components.
- Share component pages and search results with clean, human-friendly URLs.

### For creators

- Sign in with Google.
- Create components with SwiftUI code, screenshots, descriptions, and up to 3 categories.
- Keep work private until it is reviewed.
- Submit updates that go back through moderation before changes go live.
- Mark approved components as premium and set the payout target in USD.
- Receive visibility through public creator profiles and component detail pages.

### For moderators and admins

- Review submitted components and approve or decline them.
- Adjust categories during moderation before a component is published.
- Manage categories, descriptions, and homepage curation.
- Control the marketplace markup percentage used to calculate final sale prices.
- Manage operational settings from the admin area.

## Core Product Areas

### SwiftUI component discovery

CopyMyUI is designed to make component discovery fast. The homepage highlights most-saved work across categories, premium picks, and creator activity so visitors can quickly find useful interface ideas for real apps.

### Premium marketplace

Premium components are shown as screenshot-first listings. Buyers see the visual preview and pricing upfront, while the source code remains locked until purchase. Creators define the amount they want to receive, and the platform adds a configurable marketplace margin on top.

### Creator identity

Public creator profiles make the catalog feel alive. Instead of a flat list of snippets, users can explore who made a component, what else they have shared, and whether they publish free inspiration, premium assets, or both.

### Moderated quality

Nothing becomes public automatically. Components move through review before they are listed, and any meaningful update requires another approval pass. That keeps the public catalog more consistent and trustworthy.

## Main Features

- Google-only authentication
- Free and premium component publishing
- Screenshot-based premium previews
- Favorites
- Public creator profiles
- Category landing pages
- Shareable search URLs
- API keys with scoped access controls
- Admin controls for pricing rules and content management
- English-first UI with i18n support for Spanish, Russian, and German

## Technical Footer

CopyMyUI is built with a modern TypeScript stack centered around Next.js, Prisma, SQLite, NextAuth, and shadcn/ui. It includes moderation workflows, premium purchase logic, public profile routing, localized UI, API key management, shareable search pages, and automated tests for both unit and end-to-end flows.

### Useful scripts

- `npm run dev` - start the local development server
- `npm run build` - create a production build
- `npm run lint` - run linting
- `npm run test:unit` - run unit tests
- `npm run test:e2e` - run Playwright end-to-end tests
- `npm run i18n:check` - verify translation coverage and placeholder consistency
- `npm run db:seed` - reset a local database and seed the compact demo gallery
- `npm run db:seed:safe` - add missing compact demo records without deleting data
- `npm run db:seed:compact` - replace only known demo-owned components with one example per category while preserving real users and their content

The production gallery seed intentionally contains eight components: one for
each category. The previous generated Swift and screenshot corpus is excluded
from Git so remote clones and Coolify builds remain small. A verified recovery
archive may be kept locally under the ignored `.local-backups/` directory.

### Local setup

1. Install dependencies with `npm install`.
2. Create a `.env` file with the required values.
3. Run Prisma migrations.
4. Seed the database if you want demo content.
5. Start the app with `npm run dev`.

### Environment variables

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `ADMIN_EMAILS`
- `MODERATOR_EMAILS`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_REGISTRATION_NOTIFICATIONS_ENABLED`

### Quality checks

After UI copy or localization changes, run `npm run i18n:check`. For product changes, the expected baseline is linting, unit tests, end-to-end tests, and a production build.
