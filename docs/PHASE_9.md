# Phase 9 — Additional admin features

Status: **complete**. Staff can manage categories, tags, comments, subscribers, contact messages, analytics and site settings. Public articles accept comments when both the article and the publication allow them; new notes wait for review.

## Delivered

### Categories (`/admin/categories`)

- Create, edit, feature, reorder and delete.
- Name, slug, description and an image chosen through the Phase 7 media picker.
- Article counts are live. Deleting a used category asks for confirmation, then unlinks (`on delete set null`) instead of removing posts.

### Tags (`/admin/tags`)

- Create, edit, search and delete.
- Associated article counts from `post_tags`.
- Deleting a used tag confirms, then unlinks via the cascade on `post_tags`.

### Comments (`/admin/comments` and public articles)

- Staff queue: search, filter by status, approve, reject, spam, restore to pending, delete.
- Public form on `/blog/[slug]` when `posts.comments_enabled` and `site_settings.content.comments_enabled` are both true.
- Inserts as `pending` through RLS. Honeypot field. Email is stored for moderation and never rendered.
- Approved comments render as a thread with one level of replies.

### Subscribers (`/admin/subscribers`)

- Search, filter, confirm, unsubscribe, remove.
- CSV export of the current filter (email, name, status, consent, source, timestamps).
- Public signup remains Phase 10 (double opt-in end to end). This screen manages rows that already exist.

### Contact messages (`/admin/messages`)

- Inbox / unread / archived / all.
- Read detail, mark read or unread, archive or restore, delete.
- Source is the public contact form from Phase 3.

### Analytics (`/admin/analytics`)

- View events, likes, comments, bookmarks and published counts from stored rows.
- 30-day view and publishing charts (hits, not unique visitors).
- Most-viewed articles and category performance from `view_count`.

### Settings (`/admin/settings`)

- General, SEO, content, appearance, newsletter and analytics keys in `site_settings`.
- Logo, favicon and default OG image use the media picker.
- Editors can view; only administrators can save (`is_admin` RLS).

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Signed-in staff can use every Phase 9 route. Signed-out visitors still redirect to `/admin`. Public comment inserts remain `pending` until a staff member approves them.

## What Phase 10 depends on

- Keep comment approval as the public visibility switch.
- Newsletter signup should insert `subscribers` with `consent_given` and honour `newsletter.double_opt_in`.
- Likes, bookmarks and view beacons can read `analytics.collect_*` before inserting.

## Deliberate omissions

- No bulk email send. EmailJS is not a newsletter provider; export is the delivery hand-off.
- No unique-visitor analytics.
- Public comment replies are collected through the same form after approval of the parent; nested UI beyond one level is not built.
- Article editor CRUD remains Phase 8.
