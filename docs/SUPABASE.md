# Supabase setup

The Quiet Ledger uses one Supabase project for Postgres, Auth, Storage and RLS. Apply the migrations in `supabase/migrations` before any data-backed route is built.

## 1. Create a project

1. Open the Supabase dashboard and create a free project.
2. Copy the project URL, anon key and service-role key from Project Settings -> API.
3. Copy `.env.example` to `.env.local` and fill:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Never commit `.env.local`. Never prefix the service-role key with `NEXT_PUBLIC_`.

## 2. Apply the schema

One file: `supabase/migrations/20261102120000_schema.sql`. Either method is equivalent.

### Option A — SQL Editor

Paste and run `supabase/migrations/20261102120000_schema.sql` in the dashboard SQL Editor.

If `pg_trgm` or `pgcrypto` is already enabled, the `create extension` statements are no-ops.

### Option B — Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Local stack (optional):

```bash
npx supabase start
npx supabase db reset
```

`supabase/config.toml` disables public Auth signup. That matches the product rule: administrators are provisioned, visitors do not self-register.

## 3. Confirm Storage

The schema creates the `blog-media` public bucket and its policies. In Storage:

- Bucket name: `blog-media`
- Public: yes
- File size limit: 10 MiB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `image/gif`

Folder prefixes used by the app: `covers/`, `articles/`, `thumbnails/`, `avatars/`, `general/`.

## 4. Auth settings

In Authentication -> Providers, keep Email enabled.

In Authentication -> Settings:

- Disable public sign-ups. The schema and `config.toml` assume invite-only staff.
- Site URL: `http://localhost:3000` locally, the production origin in production.
- Add the production origin to Redirect URLs.

The `handle_new_user` trigger inserts a `profiles` row for every Auth user. New profiles default to `role = 'editor'`. They cannot reach admin mutations until you promote them, and Phase 5 still verifies the role on the server.

## 5. Provision the first administrator

Do this once, with the service-role key, after creating the Auth user in the dashboard (Authentication -> Users -> Add user).

Replace the email, then run in the SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

If the profile row is missing (the trigger did not run), insert it explicitly:

```sql
insert into public.profiles (id, email, display_name, slug, role)
select
  id,
  email,
  coalesce(raw_user_meta_data ->> 'display_name', split_part(email, '@', 1)),
  lower(regexp_replace(split_part(email, '@', 1), '[^a-z0-9]+', '-', 'g'))
    || '-' || substr(id::text, 1, 8),
  'admin'
from auth.users
where email = 'you@example.com'
on conflict (id) do update
set role = 'admin';
```

Confirm:

```sql
select id, email, role from public.profiles;
```

There must be at least one `admin`. Triggers refuse deleting or demoting the last one.

## 6. Publication eligibility

A post is public only when both are true:

- `status = 'published'`
- `published_at <= now()`

`scheduled` posts stay private until `promote_scheduled_posts()` runs (service role) or a later phase promotes them on a schedule. Do not treat `status` alone as visibility.

## 7. Full-text search

`posts.search_vector` is maintained by triggers on title, subtitle, excerpt, body, SEO fields, category and tags. Public search goes through `search_posts(query, result_limit, result_offset)`.

## 8. Regenerating types

After the live schema is applied:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/lib/types/database.ts
```

`src/lib/types/database.ts` currently matches these migrations by hand. Prefer the generated file once a project exists.

## 9. Security checklist

- RLS is enabled and forced on every public table.
- Anon can read published content, settings, taxonomy and approved comments.
- Anon can insert comments (`pending`), subscribers (`pending` + consent), contact messages, likes, bookmarks and views.
- Staff mutations require an authenticated user whose `profiles.role` is `admin` or `editor`.
- Role changes and `site_settings` writes require `admin`.
- Storage writes require staff. Public bucket does not imply public upload.
- Service-role key stays in `SUPABASE_SERVICE_ROLE_KEY` and is only read by `src/lib/supabase/admin.ts`.
