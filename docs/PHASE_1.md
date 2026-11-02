# Phase 1 — Architecture and initial setup

Status: **complete**. Lint, typecheck and production build pass; the dev server renders the public shell.

## Delivered

### Project setup

- Next.js 16.4.3 with the App Router, TypeScript strict mode, Tailwind CSS v4, ESLint.
- Cache Components and Partial Prefetching enabled (`next.config.ts`), with `allowedDevOrigins` for the preview domain and a Supabase-scoped `images.remotePatterns` entry derived from the environment.
- shadcn/ui initialised on Base UI primitives, with a curated set committed into `src/components/ui`.

### Dependencies installed

`@supabase/ssr`, `@supabase/supabase-js`, `zod`, `react-hook-form`, `@hookform/resolvers`, `next-themes`, `lucide-react`, `motion`, `class-variance-authority`, `clsx`, `tailwind-merge`, `date-fns`, `sonner`, `server-only`.

Deliberately deferred:

| Dependency | Phase | Reason |
| --- | --- | --- |
| `@tiptap/react` + extensions | 8 | No editor surface exists yet |
| `browser-image-compression` | 7 | No upload path exists yet |
| `@emailjs/browser` | 3 | Contact form is not built yet |
| Charting library | 6 | Dashboard is not built yet |

Installing them now would add unused weight and hide the real dependency graph.

### Supabase integration

- `src/lib/supabase/client.ts` — browser singleton via `createBrowserClient`.
- `src/lib/supabase/server.ts` — request-scoped `createServerClient` using `cookies()`; `getAll`/`setAll` per the current `@supabase/ssr` cookie API.
- `src/lib/supabase/admin.ts` — service-role client, guarded by `server-only`, throws if the key is missing.
- `src/proxy.ts` — Next.js 16's replacement for middleware. Rotates the session with `getClaims()` and returns private cache semantics.
- `src/lib/types/database.ts` — typed surface with enums defined now, tables generated in Phase 2.

### Configuration and safety

- `src/lib/env.ts` — Zod-validated environment access. Missing credentials degrade to a placeholder mode so the shell renders, while `requireSupabaseEnv()` fails loudly for any real data operation.
- `.env.example` — placeholders only, no secrets. `.env.local` is gitignored with an explicit `!.env.example` exception.
- `next.config.ts` — image remote patterns are derived from the configured Supabase host so no wildcard domain is trusted by default.

### Design system

- Token-based palette in `src/app/globals.css` for light and dark themes, built on OKLCH for perceptual consistency.
- Three-typeface system: Newsreader (editorial body and headings), Inter (interface), JetBrains Mono (code).
- `.article-prose` component layer — the shared typographic contract for rendered article JSON and the future editor preview.
- Utilities: `container-editorial` (max 82rem page width) and `container-read` (42rem reading measure).
- Reduced-motion handling, visible focus rings, balanced headings, tabular-safe numeric formatting.

### Public shell

- Root layout: fonts, `metadataBase`, title template, Open Graph defaults, viewport theme colours, skip link.
- `(site)` route group with sticky header (desktop nav, mobile sheet, scroll state, theme toggle, search entry) and a four-column footer.
- Landing page describing the real Phase 1 foundation and the twelve-phase roadmap — no invented statistics or fake articles.
- Placeholder routes for `/blog`, `/categories`, `/search`, `/about`, `/contact`, `/newsletter` that explain which phase delivers them instead of faking a form.
- Real legal page shells for `/privacy-policy`, `/terms-and-conditions`, `/cookie-policy`.
- Custom 404.

### Helpers

- `src/lib/constants.ts` — site identity, navigation, admin nav, pagination sizes.
- `src/lib/seo.ts` — `buildMetadata` and JSON-LD serialisation.
- `src/lib/format.ts` — dates, relative time, bytes, compact numbers, slugify, reading time, initials.
- `src/hooks/use-hydrated.ts` — hydration-safe mount detection without `setState` in an effect.

## Verification

```bash
# Typecheck
npx tsc --noEmit

# Lint
npm run lint

# Production build
npm run build
```

All three pass. The build reports 11 static routes plus the proxy, with `/` and every placeholder prerendered.

## What Phase 2 depends on from Phase 1

- `requireSupabaseEnv()` and the three Supabase clients are the only sanctioned entry points.
- The enum type aliases (`post_status`, `comment_status`, `subscriber_status`, `user_role`, `media_folder`) already exist and are reused by migrations.
- `Database` is intentionally a placeholder; Phase 2 replaces it with generated types.
- `proxy.ts` already refreshes sessions, so Phase 5 only adds authorization policy.

## Deliberate omissions

- No `middleware.ts` — Next.js 16 renamed it to `proxy.ts`.
- No admin layout or auth guard — Phase 5.
- No SQL migrations or RLS policies — Phase 2.
- No mock posts or seeded statistics anywhere in the UI.
- No SVG assets beyond the framework defaults; branding is typographic.

## Phase 2 checklist

1. Create the thirteen tables with constraints and indexes.
2. Enable RLS and write policies for each table.
3. Create the `blog-media` bucket and its storage policies.
4. Add `set_updated_at` triggers and the post publication-eligibility helper.
5. Add full-text search vector on `posts`.
6. Generate `src/lib/types/database.ts` from the live project.
7. Document admin provisioning via the service-role script.
