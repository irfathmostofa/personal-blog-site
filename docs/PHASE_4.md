# Phase 4 — Caching and revalidation

Status: **complete**. Public reads are cached with Next.js 16 Cache Components. Admin mutations (Phase 5+) invalidate tags; scheduled posts promote on cache fill and via an optional cron route.

## Delivered

### Cached queries

Every public helper in `src/lib/queries` is a `"use cache"` function with explicit `cacheLife` and `cacheTag`. Page components are unchanged.

| Helper | Life | Tags |
| --- | --- | --- |
| `getHomepageData` | hours | `posts`, `categories`, `authors` |
| `getPublishedPosts` | hours | `posts` (+ `category:<slug>` / `tag:<slug>` when filtered) |
| `getPostBySlug` | days | `posts`, `post:<slug>` |
| `getLatestPosts`, `getPopularPosts`, flagged lists, related, adjacent, `searchPosts` | hours | `posts` |
| `getCategories`, `getCategoryBySlug`, `getFeaturedCategories` | days | `categories`, `posts` |
| `getTags`, `getTagBySlug` | days | `tags`, `posts` |
| `getPrimaryAuthor` | days | `authors` |

The cookie-less client in `src/lib/supabase/public.ts` no longer awaits `connection()`. Cached scopes must not read `cookies()` or `headers()`. Contact writes stay in an uncached Server Action.

Publication eligibility is unchanged: `status = 'published'` and `published_at <= now()`.

### Invalidation helpers

`src/lib/cache`:

- Tags: `posts`, `post:<slug>`, `categories`, `category:<slug>`, `tags`, `tag:<slug>`, `authors`.
- `revalidatePosts` / `revalidatePost` / `revalidateTaxonomy` / `revalidateAuthors` — `revalidateTag(tag, "max")` plus related `revalidatePath`. Stale-while-revalidate; safe from Route Handlers.
- `refreshPosts` / `refreshPost` / `refreshTaxonomy` / `refreshAuthors` — `updateTag` for read-your-writes inside Server Actions only.

Phase 5+ admin mutations should call these instead of raw `revalidateTag`.

### Scheduled posts

`promote_scheduled_posts()` is service-role only (no pg_cron). Phase 4 calls it:

1. On cache fill for listings, latest posts, and article pages (`src/lib/queries/schedule.ts`).
2. From `GET/POST /api/cron/promote`, authorized with `Authorization: Bearer $CRON_SECRET`.
3. `vercel.json` schedules that path daily (`0 0 * * *`, Hobby-safe). If any rows were promoted, `revalidatePosts()` runs.

Without `CRON_SECRET` or `SUPABASE_SERVICE_ROLE_KEY` the route stays closed / no-ops. Due posts still become public on the next cache miss that runs promotion.

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Public pages still render without credentials (`configured: false`). With credentials, a published post is served from cache until a tagged revalidation or `cacheLife` expiry.

## What Phase 5 depends on

- Public data access stays in `src/lib/queries`. Do not add cookie reads there.
- After a post/taxonomy mutation, call `refreshPost` / `refreshPosts` / `refreshTaxonomy` from the Server Action.
- Session and role checks belong in admin routes and actions, never in cached public helpers.
- `src/lib/supabase/server.ts` (cookie session) is for Phase 5 auth, not public pages.

## Deliberate omissions

- No admin login or dashboard — Phase 5–6.
- No likes, bookmarks, sitemap or RSS — Phase 10.
- No editor or media library — Phases 7–8.
- Cron is optional; promotion also runs on cache fill.
