# Phase 8 — Rich text article editor

Status: **complete**. Staff can compose, autosave, preview and publish articles from `/admin/posts` and `/admin/posts/new`. Bodies are stored as Tiptap JSON and rendered by the existing public article page.

## Delivered

### Editor

- Tiptap 3 (`@tiptap/react` + StarterKit) on `/admin/posts/new` and `/admin/posts/[id]`.
- Formatting: paragraphs, H1–H4, bold, italic, underline, strike, highlight, alignment, lists, blockquotes, rules, links, inline code, lowlight code blocks, tables, undo/redo.
- Sticky toolbar with keyboard shortcut labels. Placeholder copy is editorial, not generic.

### Images

Inline figures reuse the Phase 7 pipeline. There is no second compressor.

- Insert from the media picker (upload or library).
- Drag-and-drop and clipboard paste call `uploadOptimizedFile` (`src/lib/media/upload-file.ts`).
- Node attributes persisted: `src`, `alt`, `caption`, `width`, `height`, `align`, `mediaId`.
- Selected figures expose align, width, caption, alt, replace, preview and remove.

Cover and Open Graph fields use `CoverImageField` and store `cover_id` / `og_image_id`.

### Autosave and publishing

- Drafts debounce-save after 1.8s. A generation token drops stale responses.
- Published articles are not autosaved; staff must click Save or Publish.
- Intents: save, publish, schedule, unpublish, archive.
- `status = published` requires `published_at`. `status = scheduled` requires a future `scheduled_for`.
- Word count and reading time are derived from the document, not typed in.

### Posts list

`/admin/posts` lists every status with search, status filter, sort, duplicate and delete. Queries are uncached (`connection()` + cookies) after `requireStaff`.

### Storage

Content is Tiptap JSON (`jsonb`). The public renderer in `ArticleBody` gained highlight marks, text alignment and heading level 1 (mapped to `h2` so the page title stays the only `h1`).

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Signed-in staff can create a draft at `/admin/posts/new`. Signed-out visitors still redirect to `/admin`.

## What Phase 9 depends on

- Category and tag pickers already read live rows. Phase 9 should add CRUD, not a second editor field.
- Do not cache admin post queries with `"use cache"`.
- Keep `requireStaff` on every mutation.

## Deliberate omissions

- No raw HTML storage or `dangerouslySetInnerHTML` for article bodies.
- Syntax highlighting on the public page stays plain text; lowlight runs only in the editor.
- Category/tag/comment/subscriber/settings CRUD remains Phase 9.
