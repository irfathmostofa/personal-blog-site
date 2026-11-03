import "server-only";

import { connection } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Category, MediaAsset, Tag } from "@/lib/types/database";

export type AdminCategory = Category & {
  image: MediaAsset | null;
  post_count: number;
};

export type AdminTag = Tag & {
  post_count: number;
};

export type TaxonomyListResult<T> = {
  configured: boolean;
  error: string | null;
  data: T[];
};

export async function listAdminCategories(): Promise<TaxonomyListResult<AdminCategory>> {
  await connection();

  if (!isSupabaseConfigured()) {
    return { configured: false, error: null, data: [] };
  }

  const supabase = await createClient();
  const [{ data, error }, { data: posts, error: postError }] = await Promise.all([
    supabase
      .from("categories")
      .select(
        "*, image:media_assets!categories_image_id_fkey (*)",
      )
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("posts").select("category_id"),
  ]);

  if (error) return { configured: true, error: error.message, data: [] };
  if (postError) return { configured: true, error: postError.message, data: [] };

  const tally = new Map<string, number>();
  for (const row of posts ?? []) {
    if (!row.category_id) continue;
    tally.set(row.category_id, (tally.get(row.category_id) ?? 0) + 1);
  }

  const items: AdminCategory[] = (data ?? []).map((row) => {
    const record = row as unknown as Category & { image: MediaAsset | MediaAsset[] | null };
    const image = Array.isArray(record.image) ? record.image[0] ?? null : record.image;
    return {
      ...record,
      image,
      post_count: tally.get(record.id) ?? 0,
    };
  });

  return { configured: true, error: null, data: items };
}

export async function listAdminTags(
  q?: string,
): Promise<TaxonomyListResult<AdminTag>> {
  await connection();

  if (!isSupabaseConfigured()) {
    return { configured: false, error: null, data: [] };
  }

  const supabase = await createClient();
  let request = supabase.from("tags").select("*").order("name", { ascending: true });
  const query = q?.trim();
  if (query) {
    const escaped = query.replace(/[%*,.()\\]/g, " ").replace(/\s+/g, " ").trim();
    if (escaped) {
      request = request.or(
        `name.ilike.%${escaped}%,slug.ilike.%${escaped}%,description.ilike.%${escaped}%`,
      );
    }
  }

  const [{ data, error }, { data: links, error: linkError }] = await Promise.all([
    request,
    supabase.from("post_tags").select("tag_id"),
  ]);

  if (error) return { configured: true, error: error.message, data: [] };
  if (linkError) return { configured: true, error: linkError.message, data: [] };

  const tally = new Map<string, number>();
  for (const row of links ?? []) {
    tally.set(row.tag_id, (tally.get(row.tag_id) ?? 0) + 1);
  }

  return {
    configured: true,
    error: null,
    data: (data ?? []).map((row) => ({
      ...row,
      post_count: tally.get(row.id) ?? 0,
    })),
  };
}

export async function countCategoryPosts(id: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const supabase = await createClient();
  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  return count ?? 0;
}

export async function countTagPosts(id: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const supabase = await createClient();
  const { count } = await supabase
    .from("post_tags")
    .select("post_id", { count: "exact", head: true })
    .eq("tag_id", id);
  return count ?? 0;
}
