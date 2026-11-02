# The Quiet Ledger

A dynamic editorial publishing platform: a typography-first public publication, a full admin panel, an optimised media pipeline, and a structured rich-text editor. Built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui and Supabase.

> **Status: Phase 4 complete.** The public publication reads live Supabase data behind `"use cache"` and tagged revalidation. Admin auth and the dashboard arrive in Phases 5–12. See `docs/PHASE_1.md` through `docs/PHASE_4.md`.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, Partial Prefetching) |
| Language | TypeScript (strict) |
| UI | React 19, Tailwind CSS v4, shadcn/ui (Base UI primitives) |
| Icons / motion | Lucide React, Motion |
| Data | Supabase Postgres, Auth, Storage, RLS |
| Forms | React Hook Form + Zod |
| Themes | next-themes (class strategy, system aware) |

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- A free Supabase project with the migrations in `supabase/migrations` applied (see `docs/SUPABASE.md`)

## Local development

```bash
# Install dependencies
npm install

# Create your local environment file
cp .env.example .env.local

# Start the development server
npm run dev
```

The app runs at <http://localhost:3000>.

### Without Supabase credentials

The public shell boots without credentials so the design system can be reviewed. Data-backed pages show an empty or unconfigured state instead of invented articles. Fill in `.env.local` and apply migrations to see live content.

## Scripts

```bash
# Start the dev server
npm run dev

# Production build
npm run build

# Serve the production build
npm run start

# Lint
npm run lint

# Typecheck without emitting
npx tsc --noEmit
```

## Environment variables

Copy `.env.example` to `.env.local`. Never commit `.env.local`.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Anon key, guarded by RLS |
| `NEXT_PUBLIC_SITE_URL` | client + server | Canonical origin for SEO and absolute links |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Privileged admin provisioning and scheduled-post promotion; bypasses RLS |
| `CRON_SECRET` | server only | Bearer token for `/api/cron/promote` (optional; Vercel Cron) |
| `NEXT_PUBLIC_EMAILJS_*` | client | Transactional email (contact notifications) |

Access goes through `src/lib/env.ts`, which validates with Zod and fails fast. The service-role key is only read inside `src/lib/supabase/admin.ts`, which is marked `server-only`.

## Project structure

```
src/
  app/
    (site)/            Public publication (header + footer shell)
      page.tsx         Editorial homepage
      blog/            Listing and /blog/[slug]
      category/        Category archives
      tag/             Tag archives
      categories/      Category index
      search/          Full-text search
      about/ contact/ newsletter/
      privacy-policy/ terms-and-conditions/ cookie-policy/
    layout.tsx         Root layout: fonts, metadata, providers
    not-found.tsx      Custom 404
  components/
    brand/             Wordmark
    content/           Article cards, body renderer, listing, contact form
    layout/            Header, footer, theme toggle, shared page shells
    providers/         Theme + tooltip + toast composition
    ui/                shadcn/ui primitives
  hooks/               Reusable client hooks
  lib/
    constants.ts       Site identity and navigation
    env.ts             Validated environment access
    format.ts          Dates, bytes, numbers, slugs, reading time
    seo.ts             Metadata and JSON-LD helpers
    queries/           Public Supabase reads (`use cache`)
    cache/             Tags and revalidate/update helpers
    article/           Tiptap JSON helpers
    types/             Database type surface
    utils.ts           Class merging
    supabase/
      client.ts        Browser client (singleton)
      server.ts        Request-scoped server client
      public.ts        Cookie-less anon client
      admin.ts         Service-role client (server-only)
  proxy.ts             Session refresh (Next.js 16 middleware)
supabase/migrations/   SQL migrations, RLS, storage, seed settings
docs/                  Architecture, phase notes, Supabase setup
```

## Design system

- **Typography**: Newsreader for long-form, Inter for UI, JetBrains Mono for code.
- **Palette**: warm paper in light mode, deep ink in dark mode, copper accent. Tokens are defined once in `src/app/globals.css` and consumed by both themes.
- **Reading styles**: the `.article-prose` class is the single typographic source of truth for rendered article content, shared by the public article page and the editor preview.
- **Accessibility**: skip link, visible focus rings, semantic landmarks, reduced-motion support, mobile-first responsive layout.

## Security posture

- Admin authorization is enforced server-side in later phases; route-level UI hiding is never treated as protection.
- The service-role key is isolated behind `server-only` and is never imported into client code.
- Sessions are cookie-based via `@supabase/ssr` and refreshed in `src/proxy.ts` with `Cache-Control: private, no-store` semantics.
- Supabase RLS is the default authorization mechanism; see `docs/SUPABASE.md`.

## Docs

- `docs/ARCHITECTURE.md` — system boundaries, rendering strategy, data flow.
- `docs/PHASE_1.md` — what shipped in Phase 1.
- `docs/PHASE_2.md` — schema, RLS, storage and typed database surface.
- `docs/PHASE_3.md` — public website, queries and contact form.
- `docs/PHASE_4.md` — `use cache`, tags, revalidation and scheduled-post promotion.
- `docs/SUPABASE.md` — project setup, migrations and admin provisioning.
- `MASTER_PROMPT.md` — the full product specification and phase plan.

## License

Source is private to the project owner. Article content and imagery are copyright the publication.
