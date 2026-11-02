# Phase 3 — Public website

Status: **complete**. Public routes read published content from Supabase. Empty and unconfigured states are honest; nothing is invented.

## Delivered

### Query layer

Cookie-less anon client in `src/lib/supabase/public.ts`. Public Server Components never call `cookies()`, so Cache Components can still prerender the shell. `connection()` keeps Phase 3 reads request-fresh until Phase 4 adds `use cache` and tagged revalidation.

Typed helpers in `src/lib/queries`:

- `getHomepageData` — featured, latest, trending, popular, editor picks, featured categories, primary author
- `getPublishedPosts` — listing with search, category, tag, sort and pagination
- `getPostBySlug`, `getRelatedPosts`, `getAdjacentPosts`
- `searchPosts` — `search_posts` RPC, with `ilike` fallback
- `getCategories`, `getCategoryBySlug`, `getTags`, `getTagBySlug`
- `getPrimaryAuthor`

Every helper returns `{ configured, error, data }`. Missing credentials yield `configured: false` instead of a crash.

### Public pages

| Route | Behaviour |
| --- | --- |
| `/` | Editorial homepage. Hero, latest, trending, popular, editor picks, topics, author, newsletter CTA. |
| `/blog` | Grid/list archive with search, category/tag filters, sort, pagination. |
| `/blog/[slug]` | Long-form article: cover, Tiptap JSON body, TOC, progress, share, related, prev/next, author. |
| `/categories` | Category index with published counts. |
| `/category/[slug]` | Category landing with optional image, featured piece, paginated list. |
| `/tag/[slug]` | Tag archive. |
| `/search` | Full-text search with escaped highlighting. |
| `/about` | Mission copy plus live author and topics. |
| `/contact` | Validated form; inserts into `contact_messages`; optional EmailJS notify. |
| `/newsletter` | Honest CTA; signup still Phase 10. |

Legal pages (`/privacy-policy`, `/terms-and-conditions`, `/cookie-policy`) keep real copy about shipped data flows.

### Article rendering

`src/lib/article/tiptap.ts` walks Tiptap JSON (never trusted HTML). Headings get stable ids for the table of contents. Images, code, quotes, lists and tables use `.article-prose`.

### Contact

`src/lib/actions/contact.ts` validates with Zod, rejects honeypot fills silently, inserts through RLS (`is_read` and `is_archived` must be false), then optionally POSTs to EmailJS. Private keys are never required; only the public EmailJS trio from `.env.example`.

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Without Supabase credentials the public shell still builds. With credentials applied and at least one published post, homepage, listing and article routes render that row.

## What Phase 4 depends on

- Query functions are the only public data access. Wrap them in `use cache` / `cacheTag` without changing page components.
- `revalidateTag` from admin mutations should target `posts`, `post:<slug>`, `categories`, `tags`.
- Publication eligibility stays `status = 'published'` and `published_at <= now()`.

## Deliberate omissions

- No `use cache`, ISR or on-demand revalidation — Phase 4.
- No likes, bookmarks, cookie banner, sitemap or RSS — Phase 10.
- No public comment form — Phase 9.
- No Tiptap editor or media library — Phases 7–8.
- Newsletter insert is documented, not faked.
