# Phase 2 — Database and Supabase

Status: **schema complete**. Apply the migrations to a live project before Phase 3 reads or writes data.

## Delivered

### Schema

Thirteen tables in `supabase/migrations`, matching `docs/ARCHITECTURE.md`:

`profiles`, `posts`, `categories`, `tags`, `post_tags`, `media_assets`, `comments`, `subscribers`, `bookmarks`, `post_likes`, `post_views`, `site_settings`, `contact_messages`.

Enums reused from Phase 1:

`post_status`, `comment_status`, `subscriber_status`, `user_role`, `media_folder`.

### Migration

One file, `supabase/migrations/20261102120000_schema.sql`:

1. Extensions, enums, tables, constraints, indexes
2. Updated-at, search vector, auth profile bootstrap, counters, helpers
3. RLS on every table, policies, grants
4. `blog-media` bucket, storage policies, default `site_settings`

### Authorization model

- Public `select` is limited to published, due posts (`status = 'published'` and `published_at <= now()`).
- Staff (`profiles.role` in `admin`, `editor`) can read drafts and scheduled posts.
- Only admins can change roles, mutate `site_settings`, or delete profiles.
- The last administrator cannot be demoted or deleted.
- Comments insert as `pending`. Replies must target an approved parent on a public post with comments enabled.
- Newsletter inserts require `consent_given = true` and start as `pending`.
- Likes, bookmarks and views are visitor-keyed (`visitor_id`), not auth-keyed. Counts on `posts` are maintained by triggers.

### Storage

Bucket `blog-media` is public for reads. Uploads, updates and deletes require staff. Paths must start with `covers/`, `articles/`, `thumbnails/`, `avatars/` or `general/`. Max object size is 10 MiB. Allowed types: JPEG, PNG, WebP, AVIF, GIF.

### Types

`src/lib/types/database.ts` now describes every table, enum and RPC. After applying migrations to a live project, regenerate:

```bash
npx supabase gen types typescript --project-id <id> > src/lib/types/database.ts
```

## Apply the schema

See `docs/SUPABASE.md` for project creation, SQL Editor paste order, dashboard alternatives, and admin provisioning.

## Verification (after a live project exists)

1. Run `supabase/migrations/20261102120000_schema.sql`.
2. Confirm RLS is enabled on all thirteen tables.
3. Confirm the `blog-media` bucket exists and is public.
4. Create one Auth user, promote `profiles.role` to `admin` with the service role.
5. Sign in as that user and confirm staff policies allow inserts on `posts`.
6. Sign out and confirm anonymous clients cannot read drafts.

## What Phase 3 depends on

- Published posts are the only public content surface.
- Categories, tags and settings are publicly readable.
- Contact and newsletter writes go through insert policies, not the service role.
- Media metadata lives in `media_assets`; storage objects live in `blog-media`.

## Deliberate omissions

- No seed articles or fake analytics.
- Auth signup is disabled in `supabase/config.toml`. Administrators are provisioned, not self-registered.
- No pg_cron job for `promote_scheduled_posts()`. Call it from a server job in a later phase, or invoke it on read.
- Types are hand-written until `supabase gen types` can run against a real project.
