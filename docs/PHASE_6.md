# Phase 6 — Admin dashboard

Status: **complete**. The newsroom has a collapsible sidebar, live statistics, and charts drawn from the database. Later admin tools are linked as honest placeholders, not fake screens.

## Delivered

### Layout

- `src/components/admin/admin-shell.tsx` — sidebar + top bar around every `(panel)` route.
- Desktop sidebar collapses to icons (`PanelLeft`). Mobile uses a left `Sheet`.
- Top bar: breadcrumbs, view-site link, theme toggle, profile, sign-out.
- Navigation comes from `ADMIN_NAV`. Routes that are not built yet show a phase badge and open an honest “not built” page.

### Statistics

`getDashboardStats` in `src/lib/admin/stats.ts` runs on the user-scoped server client after `requireStaff`. It is uncached (reads cookies). Counts:

| Card | Source |
| --- | --- |
| Articles | `posts` |
| Published / drafts / scheduled / archived | `posts.status` |
| Views | `post_views` row count (events, not unique visitors) |
| Comments / pending | `comments` |
| Subscribers | `subscribers` where `status = 'confirmed'` |
| Categories / tags | table counts |
| Unread messages | `contact_messages` unread and not archived |

Zeros mean empty tables. Missing credentials show an unconfigured notice. Query errors surface instead of invented numbers.

### Charts and lists

- Publishing activity: published posts per UTC day, last 14 days.
- Views over time: `post_views.viewed_at` per UTC day, last 14 days, labelled as hits.
- Popular articles: top five by `view_count` (all statuses).
- Recent activity: last six posts by `updated_at`.

Charts are CSS bar series. No chart library; Phase 1 deferred that until this surface existed, and CSS is enough.

### Placeholder routes

Protected pages exist for posts, new post, categories, tags, media, comments, subscribers, messages, analytics and settings. Each explains which later phase owns the work.

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Signed-in staff see real counts. Signed-out visitors hitting `/admin/dashboard` still redirect to `/admin`.

## What Phase 7 depends on

- Keep `requireStaff` on the panel layout. Media mutations must call it again in the Server Action.
- Do not cache admin queries with `"use cache"`.
- The media library should replace `/admin/media`, not invent a second shell.

## Deliberate omissions

- No article editor, media uploader, or taxonomy CRUD.
- No Recharts / chart package.
- View counts are not unique visitors and are labelled as such.
