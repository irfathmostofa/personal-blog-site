import type { MediaFolder } from "@/lib/types/database";

export const MEDIA_BUCKET = "blog-media";

export const MEDIA_FOLDERS = [
  "covers",
  "articles",
  "thumbnails",
  "avatars",
  "general",
] as const satisfies readonly MediaFolder[];

export const MEDIA_FOLDER_LABEL: Record<MediaFolder, string> = {
  covers: "Covers",
  articles: "Articles",
  thumbnails: "Thumbnails",
  avatars: "Avatars",
  general: "General",
};

export const MEDIA_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export const MEDIA_ACCEPT = MEDIA_ALLOWED_TYPES.join(",");

export const MEDIA_MAX_INPUT_BYTES = 10 * 1024 * 1024;
export const MEDIA_MAX_FILES = 12;

export const MEDIA_OPTIMIZE = {
  maxWidthOrHeight: 1920,
  quality: 0.88,
  maxSizeMB: 1.2,
  outputType: "image/webp" as const,
};

export const MEDIA_SKIP_REENCODE = new Set(["image/gif"]);
