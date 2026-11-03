"use client";

import { checkDuplicateMedia, recordMediaAsset } from "@/lib/actions/media";
import { MEDIA_BUCKET } from "@/lib/media/constants";
import { buildStoragePath } from "@/lib/media/filename";
import { optimizeImage, revokeOptimized, validateImageFile } from "@/lib/media/optimize";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import type { MediaAsset, MediaFolder } from "@/lib/types/database";

export async function uploadOptimizedFile(
  file: File,
  folder: MediaFolder = "articles",
): Promise<MediaAsset> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const duplicate = await checkDuplicateMedia({
    originalFilename: file.name,
    originalFileSize: file.size,
  });
  if (duplicate.status === "success" && duplicate.data) {
    return duplicate.data;
  }

  const optimized = await optimizeImage(file);
  try {
    const path = buildStoragePath(folder, optimized.file.type, file.name);
    const supabase = createClient();
    const { error: storageError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, optimized.file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: optimized.file.type,
      });

    if (storageError) throw new Error(storageError.message);

    const {
      data: { publicUrl },
    } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

    const recorded = await recordMediaAsset({
      filename: optimized.file.name,
      original_filename: file.name,
      storage_path: path,
      public_url: publicUrl,
      mime_type: optimized.file.type,
      file_size: optimized.file.size,
      original_file_size: file.size,
      width: optimized.stats.width || null,
      height: optimized.stats.height || null,
      format: optimized.stats.format,
      folder,
      alt_text: null,
      caption: null,
    });

    if (recorded.status === "error" || !recorded.data) {
      throw new Error(recorded.message);
    }

    return recorded.data;
  } finally {
    revokeOptimized(optimized);
  }
}

export async function uploadOptimizedFiles(
  files: File[],
  folder: MediaFolder = "articles",
): Promise<MediaAsset[]> {
  const assets: MediaAsset[] = [];
  for (const file of files) {
    assets.push(await uploadOptimizedFile(file, folder));
  }
  return assets;
}
