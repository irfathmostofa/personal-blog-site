"use server";

import { revalidatePath } from "next/cache";

import { revalidatePosts } from "@/lib/cache/revalidate";

import { requireStaff } from "@/lib/auth";
import {
  findDuplicateMedia,
  getMediaUsage,
  listMediaAssets,
  type MediaLibraryResult,
} from "@/lib/admin/media";
import { MEDIA_BUCKET } from "@/lib/media/constants";
import { folderFromPath } from "@/lib/media/filename";
import type { MediaActionResult, MediaListQuery, MediaUsage } from "@/lib/media/types";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { MediaAsset } from "@/lib/types/database";
import {
  mediaIdSchema,
  recordMediaSchema,
  updateMediaSchema,
} from "@/lib/validations/media";

function fail(message: string): { status: "error"; message: string } {
  return { status: "error", message };
}

function refreshMedia() {
  revalidatePath("/admin/media");
}

export async function recordMediaAsset(
  input: unknown,
): Promise<MediaActionResult<MediaAsset>> {
  const session = await requireStaff("/admin/media");

  if (!isSupabaseConfigured()) {
    return fail("Supabase is not configured.");
  }

  const parsed = recordMediaSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid media metadata.");
  }

  const folder = folderFromPath(parsed.data.storage_path);
  if (!folder || folder !== parsed.data.folder) {
    return fail("Storage path does not match the selected folder.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      ...parsed.data,
      alt_text: parsed.data.alt_text ?? null,
      caption: parsed.data.caption ?? null,
      uploaded_by: session.userId,
    })
    .select("*")
    .single();

  if (error || !data) {
    await supabase.storage.from(MEDIA_BUCKET).remove([parsed.data.storage_path]);
    return fail(error?.message ?? "The image record could not be saved.");
  }

  refreshMedia();
  return {
    status: "success",
    message: "Image stored.",
    data,
  };
}

export async function updateMediaAsset(
  input: unknown,
): Promise<MediaActionResult<MediaAsset>> {
  await requireStaff("/admin/media");

  if (!isSupabaseConfigured()) {
    return fail("Supabase is not configured.");
  }

  const parsed = updateMediaSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid media fields.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .update({
      alt_text: parsed.data.alt_text,
      caption: parsed.data.caption,
    })
    .eq("id", parsed.data.id)
    .select("*")
    .single();

  if (error || !data) {
    return fail(error?.message ?? "The image could not be updated.");
  }

  refreshMedia();
  return { status: "success", message: "Image details saved.", data };
}

export async function checkDuplicateMedia(input: {
  originalFilename: string;
  originalFileSize: number;
}): Promise<MediaActionResult<MediaAsset | null>> {
  await requireStaff("/admin/media");

  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const filename = input.originalFilename.trim();
  const size = input.originalFileSize;
  if (!filename || !Number.isFinite(size) || size <= 0) {
    return { status: "success", message: "No duplicate.", data: null };
  }

  const data = await findDuplicateMedia({
    originalFilename: filename,
    originalFileSize: size,
  });
  return { status: "success", message: data ? "Duplicate found." : "No duplicate.", data };
}

export async function searchMediaLibrary(
  query: MediaListQuery = {},
): Promise<MediaLibraryResult> {
  await requireStaff("/admin/media");
  return listMediaAssets(query);
}

export async function inspectMediaUsage(
  id: string,
): Promise<MediaActionResult<MediaUsage>> {
  await requireStaff("/admin/media");

  const parsed = mediaIdSchema.safeParse(id);
  if (!parsed.success) return fail("Invalid image id.");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("id", parsed.data)
    .maybeSingle();

  if (error || !data) {
    return fail(error?.message ?? "Image not found.");
  }

  try {
    const usage = await getMediaUsage(data);
    return { status: "success", message: "Usage loaded.", data: usage };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Usage could not be loaded.";
    return fail(message);
  }
}

export async function deleteMediaAsset(
  id: string,
  confirmedInUse = false,
): Promise<MediaActionResult> {
  await requireStaff("/admin/media");

  const parsed = mediaIdSchema.safeParse(id);
  if (!parsed.success) return fail("Invalid image id.");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const supabase = await createClient();
  const { data: asset, error: loadError } = await supabase
    .from("media_assets")
    .select("*")
    .eq("id", parsed.data)
    .maybeSingle();

  if (loadError || !asset) {
    return fail(loadError?.message ?? "Image not found.");
  }

  let usage: MediaUsage;
  try {
    usage = await getMediaUsage(asset);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Usage could not be loaded.";
    return fail(`Deletion stopped because usage could not be checked. ${message}`);
  }
  if (usage.refs.length > 0 && !confirmedInUse) {
    return {
      status: "error",
      message: `This image is referenced by ${usage.refs.length} ${usage.refs.length === 1 ? "item" : "items"}. Confirm to delete it anyway.`,
    };
  }

  const { error: storageError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .remove([asset.storage_path]);

  if (storageError) {
    return fail(`The file could not be removed from storage. ${storageError.message}`);
  }

  const { error: rowError } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", asset.id);

  if (rowError) {
    return fail(
      `The storage object was removed, but the library record could not be deleted. ${rowError.message}`,
    );
  }

  refreshMedia();
  if (usage.refs.length > 0) revalidatePosts();
  return { status: "success", message: "Image deleted.", data: undefined };
}
