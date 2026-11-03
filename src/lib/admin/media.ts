import "server-only";

import { connection } from "next/server";

import { MEDIA_PER_PAGE } from "@/lib/constants";
import { isMediaFolder } from "@/lib/media/filename";
import type {
  MediaListQuery,
  MediaListResult,
  MediaSort,
  MediaUsage,
  MediaUsageRef,
} from "@/lib/media/types";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { MediaAsset, MediaFolder } from "@/lib/types/database";

export type MediaLibraryResult = {
  configured: boolean;
  error: string | null;
  data: MediaListResult;
};

const EMPTY: MediaListResult = {
  items: [],
  total: 0,
  page: 1,
  perPage: MEDIA_PER_PAGE,
  pageCount: 0,
};

function sortSpec(sort: MediaSort | undefined) {
  if (sort === "oldest") return { column: "created_at" as const, ascending: true };
  if (sort === "largest") return { column: "file_size" as const, ascending: false };
  if (sort === "smallest") return { column: "file_size" as const, ascending: true };
  if (sort === "name") return { column: "original_filename" as const, ascending: true };
  return { column: "created_at" as const, ascending: false };
}

export function parseMediaFolder(value: string | undefined): MediaFolder | "" {
  if (!value) return "";
  return isMediaFolder(value) ? value : "";
}

export function parseMediaSort(value: string | undefined): MediaSort {
  if (
    value === "oldest" ||
    value === "largest" ||
    value === "smallest" ||
    value === "name"
  ) {
    return value;
  }
  return "newest";
}

export async function listMediaAssets(
  query: MediaListQuery = {},
): Promise<MediaLibraryResult> {
  await connection();

  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.min(48, Math.max(1, query.perPage ?? MEDIA_PER_PAGE));
  const empty: MediaListResult = { ...EMPTY, page, perPage };

  if (!isSupabaseConfigured()) {
    return { configured: false, error: null, data: empty };
  }

  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { column, ascending } = sortSpec(query.sort);

  let request = supabase
    .from("media_assets")
    .select("*", { count: "exact" })
    .order(column, { ascending })
    .range(from, to);

  if (query.folder) {
    request = request.eq("folder", query.folder);
  }

  const q = query.q?.trim();
  if (q) {
    const escaped = q.replace(/[%*,.()\\]/g, " ").replace(/\s+/g, " ").trim();
    if (escaped) {
      request = request.or(
        `original_filename.ilike.%${escaped}%,filename.ilike.%${escaped}%,alt_text.ilike.%${escaped}%,caption.ilike.%${escaped}%`,
      );
    }
  }

  const { data, error, count } = await request;
  if (error) {
    return { configured: true, error: error.message, data: empty };
  }

  const total = count ?? 0;
  return {
    configured: true,
    error: null,
    data: {
      items: (data ?? []) as MediaAsset[],
      total,
      page,
      perPage,
      pageCount: Math.ceil(total / perPage),
    },
  };
}

function contentReferencesAsset(content: unknown, asset: MediaAsset): boolean {
  if (content == null) return false;
  const haystack = JSON.stringify(content);
  return haystack.includes(asset.public_url) || haystack.includes(asset.storage_path);
}

function settingMediaId(value: unknown, key: string): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = (value as Record<string, unknown>)[key];
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

export async function getMediaUsage(asset: MediaAsset): Promise<MediaUsage> {
  await connection();
  const refs: MediaUsageRef[] = [];

  if (!isSupabaseConfigured()) return { assetId: asset.id, refs };

  const supabase = await createClient();

  const [posts, categories, profiles, settings] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, slug, status, content, cover_id, og_image_id"),
    supabase.from("categories").select("id, name, slug").eq("image_id", asset.id),
    supabase
      .from("profiles")
      .select("id, display_name, slug")
      .eq("avatar_id", asset.id),
    supabase.from("site_settings").select("key, value"),
  ]);

  const queryError =
    posts.error?.message ||
    categories.error?.message ||
    profiles.error?.message ||
    settings.error?.message;
  if (queryError) {
    throw new Error(queryError);
  }

  for (const row of posts.data ?? []) {
    if (row.cover_id === asset.id) {
      refs.push({
        kind: "post-cover",
        id: row.id,
        label: row.title,
        extra: `${row.status} cover`,
        href: `/blog/${row.slug}`,
      });
    }
    if (row.og_image_id === asset.id) {
      refs.push({
        kind: "post-og",
        id: row.id,
        label: row.title,
        extra: `${row.status} Open Graph image`,
        href: `/blog/${row.slug}`,
      });
    }
    if (contentReferencesAsset(row.content, asset)) {
      refs.push({
        kind: "post-body",
        id: row.id,
        label: row.title,
        extra: `${row.status} article body`,
        href: `/blog/${row.slug}`,
      });
    }
  }

  for (const row of categories.data ?? []) {
    refs.push({
      kind: "category",
      id: row.id,
      label: row.name,
      extra: "category image",
      href: `/category/${row.slug}`,
    });
  }

  for (const row of profiles.data ?? []) {
    refs.push({
      kind: "profile",
      id: row.id,
      label: row.display_name,
      extra: "author avatar",
    });
  }

  for (const row of settings.data ?? []) {
    const logo = settingMediaId(row.value, "logo_media_id");
    const favicon = settingMediaId(row.value, "favicon_media_id");
    const og = settingMediaId(row.value, "og_image_id");
    if (logo === asset.id || favicon === asset.id || og === asset.id) {
      refs.push({
        kind: "settings",
        id: row.key,
        label: "Site settings",
        extra: row.key,
      });
    }
  }

  return { assetId: asset.id, refs };
}

export async function findDuplicateMedia(input: {
  originalFilename: string;
  originalFileSize: number;
}): Promise<MediaAsset | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("media_assets")
    .select("*")
    .eq("original_filename", input.originalFilename)
    .eq("original_file_size", input.originalFileSize)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}
