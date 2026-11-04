-- The Quiet Ledger — single merged Supabase schema
-- Paste this file into the SQL Editor, or run: npx supabase db push

-- ---------------------------------------------------------------------------
-- 1. Extensions, enums, tables, indexes
-- ---------------------------------------------------------------------------

create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

create type public.post_status as enum (
  'draft',
  'published',
  'scheduled',
  'archived'
);

create type public.comment_status as enum (
  'pending',
  'approved',
  'rejected',
  'spam'
);

create type public.subscriber_status as enum (
  'pending',
  'confirmed',
  'unsubscribed'
);

create type public.user_role as enum (
  'admin',
  'editor'
);

create type public.media_folder as enum (
  'covers',
  'articles',
  'thumbnails',
  'avatars',
  'general'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null,
  slug text not null unique,
  bio text,
  role public.user_role not null default 'editor',
  website_url text,
  twitter_url text,
  github_url text,
  linkedin_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint profiles_display_name_len check (
    char_length(display_name) between 1 and 120
  )
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  original_filename text not null,
  storage_path text not null unique,
  public_url text not null,
  mime_type text not null,
  file_size bigint not null,
  original_file_size bigint not null,
  width integer,
  height integer,
  format text not null,
  folder public.media_folder not null default 'general',
  alt_text text,
  caption text,
  uploaded_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_assets_file_size_nonneg check (file_size >= 0),
  constraint media_assets_original_size_nonneg check (original_file_size >= 0),
  constraint media_assets_width_positive check (width is null or width > 0),
  constraint media_assets_height_positive check (height is null or height > 0)
);

alter table public.profiles
  add column avatar_id uuid references public.media_assets (id) on delete set null;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_id uuid references public.media_assets (id) on delete set null,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint categories_name_len check (
    char_length(name) between 1 and 80
  )
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tags_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint tags_name_len check (
    char_length(name) between 1 and 60
  )
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  subtitle text,
  excerpt text,
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  cover_id uuid references public.media_assets (id) on delete set null,
  og_image_id uuid references public.media_assets (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  author_id uuid not null references public.profiles (id) on delete restrict,
  status public.post_status not null default 'draft',
  featured boolean not null default false,
  editors_pick boolean not null default false,
  trending boolean not null default false,
  comments_enabled boolean not null default true,
  seo_title text,
  seo_description text,
  canonical_url text,
  reading_time_minutes integer not null default 0,
  word_count integer not null default 0,
  like_count integer not null default 0,
  view_count integer not null default 0,
  published_at timestamptz,
  scheduled_for timestamptz,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint posts_title_len check (
    char_length(title) between 1 and 200
  ),
  constraint posts_content_object check (jsonb_typeof(content) = 'object'),
  constraint posts_counts_nonneg check (
    reading_time_minutes >= 0
    and word_count >= 0
    and like_count >= 0
    and view_count >= 0
  ),
  constraint posts_published_requires_timestamp check (
    status <> 'published' or published_at is not null
  ),
  constraint posts_scheduled_requires_timestamp check (
    status <> 'scheduled' or scheduled_for is not null
  )
);

create table public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  author_name text not null,
  author_email text not null,
  body text not null,
  status public.comment_status not null default 'pending',
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_author_name_len check (
    char_length(author_name) between 1 and 80
  ),
  constraint comments_body_len check (
    char_length(body) between 1 and 5000
  )
);

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  status public.subscriber_status not null default 'pending',
  confirmation_token text unique,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  consent_given boolean not null default false,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  constraint bookmarks_post_visitor unique (post_id, visitor_id)
);

create table public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  constraint post_likes_post_visitor unique (post_id, visitor_id)
);

create table public.post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  visitor_id text,
  referrer text,
  viewed_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_value_object check (jsonb_typeof(value) = 'object')
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  is_archived boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_messages_name_len check (
    char_length(name) between 1 and 120
  ),
  constraint contact_messages_subject_len check (
    char_length(subject) between 1 and 200
  ),
  constraint contact_messages_message_len check (
    char_length(message) between 1 and 8000
  )
);

create index profiles_role_idx on public.profiles (role);
create index profiles_avatar_id_idx on public.profiles (avatar_id);

create index media_assets_uploaded_by_idx on public.media_assets (uploaded_by);
create index media_assets_folder_created_idx on public.media_assets (folder, created_at desc);
create index media_assets_created_at_idx on public.media_assets (created_at desc);

create index categories_featured_idx on public.categories (sort_order, name) where featured;
create index categories_image_id_idx on public.categories (image_id);

create index tags_name_trgm_idx on public.tags using gin (name gin_trgm_ops);

create index posts_author_id_idx on public.posts (author_id);
create index posts_category_id_idx on public.posts (category_id);
create index posts_cover_id_idx on public.posts (cover_id);
create index posts_og_image_id_idx on public.posts (og_image_id);
create index posts_status_idx on public.posts (status);
create index posts_public_published_at_idx
  on public.posts (published_at desc)
  where status = 'published';
create index posts_featured_idx
  on public.posts (published_at desc)
  where featured and status = 'published';
create index posts_editors_pick_idx
  on public.posts (published_at desc)
  where editors_pick and status = 'published';
create index posts_trending_idx
  on public.posts (published_at desc)
  where trending and status = 'published';
create index posts_scheduled_idx
  on public.posts (scheduled_for)
  where status = 'scheduled';
create index posts_search_vector_idx on public.posts using gin (search_vector);
create index posts_title_trgm_idx on public.posts using gin (title gin_trgm_ops);
create index posts_view_count_idx on public.posts (view_count desc);

create index post_tags_tag_id_idx on public.post_tags (tag_id);

create index comments_post_id_status_idx on public.comments (post_id, status, created_at desc);
create index comments_parent_id_idx on public.comments (parent_id);
create index comments_status_created_idx on public.comments (status, created_at desc);

create index subscribers_status_idx on public.subscribers (status);
create index subscribers_created_at_idx on public.subscribers (created_at desc);

create index bookmarks_visitor_id_idx on public.bookmarks (visitor_id);
create index bookmarks_post_id_idx on public.bookmarks (post_id);

create index post_likes_visitor_id_idx on public.post_likes (visitor_id);
create index post_likes_post_id_idx on public.post_likes (post_id);

create index post_views_post_viewed_idx on public.post_views (post_id, viewed_at desc);
create index post_views_viewed_at_idx on public.post_views (viewed_at desc);

create index contact_messages_unread_idx
  on public.contact_messages (created_at desc)
  where not is_read and not is_archived;
create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

-- ---------------------------------------------------------------------------
-- 2. Functions and triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create or replace function public.is_post_public(
  p_status public.post_status,
  p_published_at timestamptz
)
returns boolean
language sql
stable
as $$
  select p_status = 'published'
    and p_published_at is not null
    and p_published_at <= now();
$$;

create or replace function public.post_accepts_public_comments(p_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.posts p
    where p.id = p_post_id
      and public.is_post_public(p.status, p.published_at)
      and p.comments_enabled
  );
$$;

create or replace function public.comment_reply_target_is_valid(
  p_post_id uuid,
  p_parent_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.comments parent
    join public.posts p on p.id = parent.post_id
    where parent.id = p_parent_id
      and parent.post_id = p_post_id
      and parent.status = 'approved'
      and public.is_post_public(p.status, p.published_at)
      and p.comments_enabled
  );
$$;

create or replace function public.tiptap_plain_text(doc jsonb)
returns text
language sql
immutable
as $$
  select coalesce(
    (
      select string_agg(elem #>> '{}', ' ')
      from jsonb_path_query(coalesce(doc, '{}'::jsonb), '$.**.text') as elem
    ),
    ''
  );
$$;

create or replace function public.posts_refresh_search_vector(p_post_id uuid)
returns void
language plpgsql
as $$
declare
  category_name text := '';
  tag_names text := '';
begin
  select coalesce(c.name, '')
    into category_name
  from public.posts p
  left join public.categories c on c.id = p.category_id
  where p.id = p_post_id;

  select coalesce(string_agg(t.name, ' '), '')
    into tag_names
  from public.post_tags pt
  join public.tags t on t.id = pt.tag_id
  where pt.post_id = p_post_id;

  update public.posts
  set search_vector =
    setweight(to_tsvector('english', coalesce(title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(subtitle, '')), 'A')
    || setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')
    || setweight(to_tsvector('english', coalesce(seo_title, '')), 'B')
    || setweight(to_tsvector('english', coalesce(seo_description, '')), 'C')
    || setweight(to_tsvector('english', coalesce(category_name, '')), 'B')
    || setweight(to_tsvector('english', coalesce(tag_names, '')), 'B')
    || setweight(to_tsvector('english', public.tiptap_plain_text(content)), 'C')
  where id = p_post_id;
end;
$$;

create or replace function public.posts_search_vector_trigger()
returns trigger
language plpgsql
as $$
begin
  perform public.posts_refresh_search_vector(new.id);
  return null;
end;
$$;

create or replace function public.post_tags_search_vector_trigger()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.posts_refresh_search_vector(old.post_id);
    return old;
  end if;

  perform public.posts_refresh_search_vector(new.post_id);
  return new;
end;
$$;

create or replace function public.search_posts(
  query text,
  result_limit integer default 20,
  result_offset integer default 0
)
returns setof public.posts
language sql
stable
as $$
  with q as (
    select websearch_to_tsquery('english', coalesce(query, '')) as tsquery
  )
  select p.*
  from public.posts p, q
  where public.is_post_public(p.status, p.published_at)
    and (
      (q.tsquery <> ''::tsquery and p.search_vector @@ q.tsquery)
      or p.title ilike '%' || query || '%'
    )
  order by
    ts_rank(p.search_vector, q.tsquery) desc,
    p.published_at desc
  limit greatest(result_limit, 1)
  offset greatest(result_offset, 0);
$$;

create or replace function public.promote_scheduled_posts()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  promoted integer;
begin
  update public.posts
  set
    status = 'published',
    published_at = coalesce(published_at, scheduled_for, now())
  where status = 'scheduled'
    and scheduled_for is not null
    and scheduled_for <= now();

  get diagnostics promoted = row_count;
  return promoted;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_slug text;
  unique_slug text;
begin
  base_slug := lower(regexp_replace(
    split_part(coalesce(new.email, new.id::text), '@', 1),
    '[^a-z0-9]+',
    '-',
    'g'
  ));
  base_slug := trim(both '-' from base_slug);
  if base_slug = '' then
    base_slug := 'author';
  end if;

  unique_slug := base_slug || '-' || substr(new.id::text, 1, 8);

  insert into public.profiles (id, email, display_name, slug)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      initcap(replace(base_slug, '-', ' '))
    ),
    unique_slug
  );

  return new;
end;
$$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only administrators can change roles';
  end if;

  if old.role = 'admin' and new.role is distinct from 'admin' then
    if (
      select count(*)
      from public.profiles
      where role = 'admin' and id <> old.id
    ) = 0 then
      raise exception 'Cannot demote the last administrator';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.prevent_last_admin_delete()
returns trigger
language plpgsql
as $$
begin
  if old.role = 'admin' then
    if (
      select count(*)
      from public.profiles
      where role = 'admin' and id <> old.id
    ) = 0 then
      raise exception 'Cannot delete the last administrator';
    end if;
  end if;

  return old;
end;
$$;

create or replace function public.normalize_subscriber_email()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

create or replace function public.adjust_post_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts
    set like_count = like_count + 1
    where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts
    set like_count = greatest(like_count - 1, 0)
    where id = old.post_id;
    return old;
  end if;

  return null;
end;
$$;

create or replace function public.adjust_post_view_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set view_count = view_count + 1
  where id = new.post_id;
  return new;
end;
$$;

create or replace function public.confirm_subscription(token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated integer;
begin
  if token is null or char_length(token) < 16 then
    return false;
  end if;

  update public.subscribers
  set
    status = 'confirmed',
    confirmed_at = coalesce(confirmed_at, now()),
    confirmation_token = null
  where confirmation_token = token
    and status = 'pending';

  get diagnostics updated = row_count;
  return updated = 1;
end;
$$;

create or replace function public.unsubscribe_by_token(token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated integer;
begin
  if token is null or char_length(token) < 16 then
    return false;
  end if;

  update public.subscribers
  set
    status = 'unsubscribed',
    unsubscribed_at = coalesce(unsubscribed_at, now()),
    confirmation_token = null
  where confirmation_token = token
    and status <> 'unsubscribed';

  get diagnostics updated = row_count;
  return updated = 1;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger profiles_protect_role
  before update on public.profiles
  for each row
  execute function public.protect_profile_role();

create trigger profiles_prevent_last_admin_delete
  before delete on public.profiles
  for each row
  execute function public.prevent_last_admin_delete();

create trigger media_assets_set_updated_at
  before update on public.media_assets
  for each row
  execute function public.set_updated_at();

create trigger categories_set_updated_at
  before update on public.categories
  for each row
  execute function public.set_updated_at();

create trigger tags_set_updated_at
  before update on public.tags
  for each row
  execute function public.set_updated_at();

create trigger posts_set_updated_at
  before update on public.posts
  for each row
  execute function public.set_updated_at();

create trigger posts_search_vector
  after insert or update of title, subtitle, excerpt, content, seo_title, seo_description, category_id
  on public.posts
  for each row
  execute function public.posts_search_vector_trigger();

create trigger post_tags_search_vector
  after insert or delete on public.post_tags
  for each row
  execute function public.post_tags_search_vector_trigger();

create trigger comments_set_updated_at
  before update on public.comments
  for each row
  execute function public.set_updated_at();

create trigger subscribers_normalize_email
  before insert or update of email on public.subscribers
  for each row
  execute function public.normalize_subscriber_email();

create trigger subscribers_set_updated_at
  before update on public.subscribers
  for each row
  execute function public.set_updated_at();

create trigger post_likes_adjust_count
  after insert or delete on public.post_likes
  for each row
  execute function public.adjust_post_like_count();

create trigger post_views_adjust_count
  after insert on public.post_views
  for each row
  execute function public.adjust_post_view_count();

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row
  execute function public.set_updated_at();

create trigger contact_messages_set_updated_at
  before update on public.contact_messages
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Row Level Security and grants
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.media_assets enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;
alter table public.comments enable row level security;
alter table public.subscribers enable row level security;
alter table public.bookmarks enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_views enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;

alter table public.profiles force row level security;
alter table public.media_assets force row level security;
alter table public.categories force row level security;
alter table public.tags force row level security;
alter table public.posts force row level security;
alter table public.post_tags force row level security;
alter table public.comments force row level security;
alter table public.subscribers force row level security;
alter table public.bookmarks force row level security;
alter table public.post_likes force row level security;
alter table public.post_views force row level security;
alter table public.site_settings force row level security;
alter table public.contact_messages force row level security;

create policy profiles_select_public
  on public.profiles
  for select
  using (true);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy profiles_update_admin
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy profiles_delete_admin
  on public.profiles
  for delete
  to authenticated
  using (public.is_admin());

create policy media_assets_select_public
  on public.media_assets
  for select
  using (true);

create policy media_assets_insert_staff
  on public.media_assets
  for insert
  to authenticated
  with check (public.is_staff() and uploaded_by = (select auth.uid()));

create policy media_assets_update_staff
  on public.media_assets
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy media_assets_delete_staff
  on public.media_assets
  for delete
  to authenticated
  using (public.is_staff());

create policy categories_select_public
  on public.categories
  for select
  using (true);

create policy categories_insert_staff
  on public.categories
  for insert
  to authenticated
  with check (public.is_staff());

create policy categories_update_staff
  on public.categories
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy categories_delete_staff
  on public.categories
  for delete
  to authenticated
  using (public.is_staff());

create policy tags_select_public
  on public.tags
  for select
  using (true);

create policy tags_insert_staff
  on public.tags
  for insert
  to authenticated
  with check (public.is_staff());

create policy tags_update_staff
  on public.tags
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy tags_delete_staff
  on public.tags
  for delete
  to authenticated
  using (public.is_staff());

create policy posts_select_public
  on public.posts
  for select
  using (
    public.is_post_public(status, published_at)
    or public.is_staff()
  );

create policy posts_insert_staff
  on public.posts
  for insert
  to authenticated
  with check (public.is_staff() and author_id = (select auth.uid()));

create policy posts_update_staff
  on public.posts
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy posts_delete_staff
  on public.posts
  for delete
  to authenticated
  using (public.is_staff());

create policy post_tags_select_public
  on public.post_tags
  for select
  using (
    public.is_staff()
    or exists (
      select 1
      from public.posts p
      where p.id = post_id
        and public.is_post_public(p.status, p.published_at)
    )
  );

create policy post_tags_insert_staff
  on public.post_tags
  for insert
  to authenticated
  with check (public.is_staff());

create policy post_tags_delete_staff
  on public.post_tags
  for delete
  to authenticated
  using (public.is_staff());

create policy comments_select_approved
  on public.comments
  for select
  using (
    public.is_staff()
    or (
      status = 'approved'
      and exists (
        select 1
        from public.posts p
        where p.id = post_id
          and public.is_post_public(p.status, p.published_at)
          and p.comments_enabled
      )
    )
  );

create policy comments_insert_public
  on public.comments
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and parent_id is null
    and public.post_accepts_public_comments(post_id)
  );

create policy comments_insert_reply
  on public.comments
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and parent_id is not null
    and public.comment_reply_target_is_valid(post_id, parent_id)
  );

create policy comments_update_staff
  on public.comments
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy comments_delete_staff
  on public.comments
  for delete
  to authenticated
  using (public.is_staff());

create policy subscribers_select_staff
  on public.subscribers
  for select
  to authenticated
  using (public.is_staff());

create policy subscribers_insert_public
  on public.subscribers
  for insert
  with check (
    status = 'pending'
    and consent_given = true
  );

create policy subscribers_update_staff
  on public.subscribers
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy subscribers_delete_staff
  on public.subscribers
  for delete
  to authenticated
  using (public.is_staff());

create policy bookmarks_insert_public
  on public.bookmarks
  for insert
  with check (char_length(visitor_id) between 8 and 128);

create policy bookmarks_delete_public
  on public.bookmarks
  for delete
  using (char_length(visitor_id) between 8 and 128);

create policy bookmarks_select_staff
  on public.bookmarks
  for select
  to authenticated
  using (public.is_staff());

create policy post_likes_insert_public
  on public.post_likes
  for insert
  with check (char_length(visitor_id) between 8 and 128);

create policy post_likes_delete_public
  on public.post_likes
  for delete
  using (char_length(visitor_id) between 8 and 128);

create policy post_likes_select_staff
  on public.post_likes
  for select
  to authenticated
  using (public.is_staff());

create policy post_views_insert_public
  on public.post_views
  for insert
  with check (true);

create policy post_views_select_staff
  on public.post_views
  for select
  to authenticated
  using (public.is_staff());

create policy site_settings_select_public
  on public.site_settings
  for select
  using (true);

create policy site_settings_insert_admin
  on public.site_settings
  for insert
  to authenticated
  with check (public.is_admin());

create policy site_settings_update_admin
  on public.site_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy site_settings_delete_admin
  on public.site_settings
  for delete
  to authenticated
  using (public.is_admin());

create policy contact_messages_insert_public
  on public.contact_messages
  for insert
  with check (
    is_read = false
    and is_archived = false
  );

create policy contact_messages_select_staff
  on public.contact_messages
  for select
  to authenticated
  using (public.is_staff());

create policy contact_messages_update_staff
  on public.contact_messages
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy contact_messages_delete_staff
  on public.contact_messages
  for delete
  to authenticated
  using (public.is_staff());

grant usage on schema public to anon, authenticated, service_role;

grant select on table public.profiles to anon, authenticated;
grant update, delete on table public.profiles to authenticated;

grant select on table public.media_assets to anon, authenticated;
grant insert, update, delete on table public.media_assets to authenticated;

grant select on table public.categories to anon, authenticated;
grant insert, update, delete on table public.categories to authenticated;

grant select on table public.tags to anon, authenticated;
grant insert, update, delete on table public.tags to authenticated;

grant select on table public.posts to anon, authenticated;
grant insert, update, delete on table public.posts to authenticated;

grant select on table public.post_tags to anon, authenticated;
grant insert, delete on table public.post_tags to authenticated;

grant select, insert on table public.comments to anon, authenticated;
grant update, delete on table public.comments to authenticated;

grant insert on table public.subscribers to anon, authenticated;
grant select, update, delete on table public.subscribers to authenticated;

grant insert, delete on table public.bookmarks to anon, authenticated;
grant select on table public.bookmarks to authenticated;

grant insert, delete on table public.post_likes to anon, authenticated;
grant select on table public.post_likes to authenticated;

grant insert on table public.post_views to anon, authenticated;
grant select on table public.post_views to authenticated;

grant select on table public.site_settings to anon, authenticated;
grant insert, update, delete on table public.site_settings to authenticated;

grant insert on table public.contact_messages to anon, authenticated;
grant select, update, delete on table public.contact_messages to authenticated;

grant all on all tables in schema public to service_role;

grant usage on type public.post_status to anon, authenticated, service_role;
grant usage on type public.comment_status to anon, authenticated, service_role;
grant usage on type public.subscriber_status to anon, authenticated, service_role;
grant usage on type public.user_role to anon, authenticated, service_role;
grant usage on type public.media_folder to anon, authenticated, service_role;

grant execute on function public.is_staff() to anon, authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.is_post_public(public.post_status, timestamptz) to anon, authenticated, service_role;
grant execute on function public.post_accepts_public_comments(uuid) to anon, authenticated, service_role;
grant execute on function public.comment_reply_target_is_valid(uuid, uuid) to anon, authenticated, service_role;
grant execute on function public.search_posts(text, integer, integer) to anon, authenticated, service_role;
grant execute on function public.confirm_subscription(text) to anon, authenticated, service_role;
grant execute on function public.unsubscribe_by_token(text) to anon, authenticated, service_role;
grant execute on function public.promote_scheduled_posts() to service_role;

revoke execute on function public.promote_scheduled_posts() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.protect_profile_role() from anon, authenticated;
revoke execute on function public.prevent_last_admin_delete() from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Storage bucket and default site settings
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-media',
  'blog-media',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "blog_media_public_read" on storage.objects;
drop policy if exists "blog_media_staff_insert" on storage.objects;
drop policy if exists "blog_media_staff_update" on storage.objects;
drop policy if exists "blog_media_staff_delete" on storage.objects;

create policy blog_media_public_read
  on storage.objects
  for select
  using (bucket_id = 'blog-media');

create policy blog_media_staff_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'blog-media'
    and public.is_staff()
    and (storage.foldername(name))[1] in (
      'covers',
      'articles',
      'thumbnails',
      'avatars',
      'general'
    )
  );

create policy blog_media_staff_update
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'blog-media' and public.is_staff())
  with check (bucket_id = 'blog-media' and public.is_staff());

create policy blog_media_staff_delete
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'blog-media' and public.is_staff());

insert into public.site_settings (key, value)
values
  (
    'general',
    jsonb_build_object(
      'name', 'The Quiet Ledger',
      'short_name', 'Ledger',
      'tagline', 'Dispatches on technology, craft, and the slow web.',
      'description', 'An independent publication covering technology, design, engineering craft, and the culture of building software for the long term.',
      'default_author_id', null,
      'logo_media_id', null,
      'favicon_media_id', null,
      'social', jsonb_build_object(
        'twitter', '',
        'github', '',
        'linkedin', '',
        'mastodon', ''
      )
    )
  ),
  (
    'seo',
    jsonb_build_object(
      'default_title', 'The Quiet Ledger',
      'default_description', 'An independent publication covering technology, design, engineering craft, and the culture of building software for the long term.',
      'canonical_url', 'http://localhost:3000',
      'og_image_id', null
    )
  ),
  (
    'content',
    jsonb_build_object(
      'comments_enabled', true,
      'default_status', 'draft',
      'featured_post_ids', '[]'::jsonb,
      'reading_measure', 'narrow'
    )
  ),
  (
    'appearance',
    jsonb_build_object(
      'default_theme', 'system',
      'accent', 'copper'
    )
  ),
  (
    'newsletter',
    jsonb_build_object(
      'enabled', true,
      'double_opt_in', true,
      'from_name', 'The Quiet Ledger'
    )
  ),
  (
    'analytics',
    jsonb_build_object(
      'collect_views', true,
      'collect_likes', true
    )
  )
on conflict (key) do nothing;
