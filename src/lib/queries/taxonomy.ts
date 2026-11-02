import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache/tags";
import { mapMedia, one } from "@/lib/queries/mappers";
import {
  emptyEnvelope,
  failedEnvelope,
  type CategoryRecord,
  type QueryEnvelope,
  type TagRecord,
} from "@/lib/queries/types";
import { tryCreatePublicClient } from "@/lib/supabase/public";

export async function getCategories(): Promise<QueryEnvelope<CategoryRecord[]>> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.categories, CACHE_TAGS.posts);

  const client = await tryCreatePublicClient();
  if (!client) return emptyEnvelope([]);

  const [{ data, error }, { data: counts, error: countError }] = await Promise.all([
    client
      .from("categories")
      .select(
        "id, name, slug, description, featured, sort_order, image:media_assets!categories_image_id_fkey ( public_url, alt_text, caption, width, height )",
      )
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    client.from("posts").select("category_id").eq("status", "published"),
  ]);

  if (error) return failedEnvelope([], error.message);
  if (countError) return failedEnvelope([], countError.message);

  const tally = new Map<string, number>();
  for (const row of counts ?? []) {
    if (!row.category_id) continue;
    tally.set(row.category_id, (tally.get(row.category_id) ?? 0) + 1);
  }

  const items: CategoryRecord[] = (data ?? []).map((row) => {
    const record = row as unknown as Record<string, unknown>;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      featured: row.featured,
      sort_order: row.sort_order,
      image: mapMedia(one(record.image)),
      post_count: tally.get(row.id) ?? 0,
    };
  });

  return { configured: true, error: null, data: items };
}

export async function getFeaturedCategories(
  limit = 6,
): Promise<QueryEnvelope<CategoryRecord[]>> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.categories, CACHE_TAGS.posts);

  const all = await getCategories();
  if (!all.configured || all.error) return all;
  const featured = all.data.filter((item) => item.featured).slice(0, limit);
  return {
    ...all,
    data: featured.length > 0 ? featured : all.data.slice(0, limit),
  };
}

export async function getCategoryBySlug(
  slug: string,
): Promise<QueryEnvelope<CategoryRecord | null>> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.categories, CACHE_TAGS.category(slug), CACHE_TAGS.posts);

  const all = await getCategories();
  if (!all.configured) return emptyEnvelope(null);
  if (all.error) return failedEnvelope(null, all.error);
  return {
    configured: true,
    error: null,
    data: all.data.find((item) => item.slug === slug) ?? null,
  };
}

export async function getTags(): Promise<QueryEnvelope<TagRecord[]>> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.tags, CACHE_TAGS.posts);

  const client = await tryCreatePublicClient();
  if (!client) return emptyEnvelope([]);

  const [{ data, error }, { data: links, error: linkError }] = await Promise.all([
    client.from("tags").select("id, name, slug, description").order("name"),
    client.from("post_tags").select("tag_id, post_id"),
  ]);

  if (error) return failedEnvelope([], error.message);
  if (linkError) return failedEnvelope([], linkError.message);

  const published = await client
    .from("posts")
    .select("id")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());

  const publishedIds = new Set((published.data ?? []).map((row) => row.id));
  const tally = new Map<string, number>();
  for (const link of links ?? []) {
    if (!publishedIds.has(link.post_id)) continue;
    tally.set(link.tag_id, (tally.get(link.tag_id) ?? 0) + 1);
  }

  return {
    configured: true,
    error: null,
    data: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      post_count: tally.get(row.id) ?? 0,
    })),
  };
}

export async function getTagBySlug(
  slug: string,
): Promise<QueryEnvelope<TagRecord | null>> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.tags, CACHE_TAGS.tag(slug), CACHE_TAGS.posts);

  const all = await getTags();
  if (!all.configured) return emptyEnvelope(null);
  if (all.error) return failedEnvelope(null, all.error);
  return {
    configured: true,
    error: null,
    data: all.data.find((item) => item.slug === slug) ?? null,
  };
}
