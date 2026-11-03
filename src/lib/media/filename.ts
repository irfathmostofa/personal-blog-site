import { MEDIA_FOLDERS } from "@/lib/media/constants";
import type { MediaFolder } from "@/lib/types/database";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export function extensionForMime(mime: string, fallbackName = ""): string {
  const fromMime = EXT_BY_MIME[mime];
  if (fromMime) return fromMime;
  const match = fallbackName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "webp";
}

export function replaceExtension(filename: string, ext: string): string {
  const base = filename.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${ext}`;
}

export function isMediaFolder(value: string): value is MediaFolder {
  return (MEDIA_FOLDERS as readonly string[]).includes(value);
}

export function buildStoragePath(folder: MediaFolder, mime: string, originalName: string): string {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const ext = extensionForMime(mime, originalName);
  const id = crypto.randomUUID();
  return `${folder}/${year}/${month}/${id}.${ext}`;
}

export function folderFromPath(path: string): MediaFolder | null {
  const prefix = path.split("/")[0] ?? "";
  return isMediaFolder(prefix) ? prefix : null;
}
