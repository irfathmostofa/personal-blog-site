-- Allow anonymous comment inserts without nested RLS or enum usage failures.
-- Safe to run on a database that already applied 20261102120000_schema.sql.

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

drop policy if exists comments_insert_public on public.comments;
drop policy if exists comments_insert_reply on public.comments;

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

grant usage on type public.post_status to anon, authenticated, service_role;
grant usage on type public.comment_status to anon, authenticated, service_role;
grant usage on type public.subscriber_status to anon, authenticated, service_role;
grant usage on type public.user_role to anon, authenticated, service_role;
grant usage on type public.media_folder to anon, authenticated, service_role;

grant execute on function public.post_accepts_public_comments(uuid) to anon, authenticated, service_role;
grant execute on function public.comment_reply_target_is_valid(uuid, uuid) to anon, authenticated, service_role;
