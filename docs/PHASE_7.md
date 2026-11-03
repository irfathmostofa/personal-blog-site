# Phase 7 — Image management system

Status: **complete**. Staff can upload, optimize, browse, select and delete images from `/admin/media`. The same uploader and picker are reused for cover selection on `/admin/posts/new`.

## Delivered

### Optimization pipeline

`src/lib/media/optimize.ts` runs in the browser with `browser-image-compression`:

- Allowed types: JPEG, PNG, WebP, AVIF, GIF. Max 10 MB, matching the `blog-media` bucket.
- Default encode: max 1920px on the long edge, WebP at quality 0.88, aspect ratio preserved.
- GIF is stored as-is so frames are not flattened.
- If the WebP result is larger than the original of the same type, the original is kept.
- Statistics (bytes, dimensions, format, percent saved) are measured from the actual `File` objects. Nothing is mocked.

### Storage and records

1. Staff session is required (`requireStaff`) on every media Server Action.
2. The browser client uploads the optimized file to `blog-media/{folder}/{year}/{month}/{uuid}.ext`.
3. `recordMediaAsset` inserts a `media_assets` row through the user-scoped client so RLS applies (`uploaded_by = auth.uid()`).
4. If the row insert fails, the storage object is removed.
5. Duplicate detection reuses an existing row when `original_filename` and `original_file_size` match, so the same file is not stored twice.

Folder prefixes stay inside `covers/`, `articles/`, `thumbnails/`, `avatars/`, `general/`.

### Media library (`/admin/media`)

- Drag-and-drop uploader with original vs optimized previews and real compression stats.
- Grid of stored images: preview, filename, size, dimensions, format, folder, date.
- Search, folder filter, sort (newest, oldest, largest, smallest, name), pagination.
- Detail dialog: alt text, caption, copy URL, open original, save metadata.
- Delete dialog checks covers, OG images, article JSON, category images, avatars and site settings. In-use images require an extra confirmation. Storage is removed first, then the row.

Admin queries are uncached (`connection()` + cookies). They do not use `"use cache"`.

### Image picker

`ImagePicker` / `CoverImageField` open a modal that can search the library, upload a new file through the same pipeline, and return one or many `MediaAsset` records. `/admin/posts/new` already uses the cover field so Phase 8 does not invent a second upload path.

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Signed-in staff can upload at `/admin/media`. Signed-out visitors still redirect to `/admin`.

## What Phase 8 depends on

- Insert images through `ImagePicker` (single) or the uploader; persist `src`, `alt`, `caption`, `width` and `height` on the Tiptap image node.
- Cover and OG fields should use `CoverImageField` and store `cover_id` / `og_image_id`.
- Do not add a second compression path inside the editor.

## Deliberate omissions

- Tiptap inline image controls (resize, align) belong to Phase 8.
- No AVIF encode-by-default: browsers encode WebP reliably; AVIF is accepted as input.
- Duplicate handling is filename + original byte size, not perceptual hashing.
