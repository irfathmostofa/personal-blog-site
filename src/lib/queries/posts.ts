import "server-only";

import { POSTS_PER_PAGE } from "@/lib/constants";
import {
  asJson,
  mapMedia,
  mapPostCard,
  mapPostTags,
  one,
  POST_CARD_SELECT,
  POST_DETAIL_SELECT,
} from "@/lib/queries/mappers";
import {
  emptyEnvelope,
  failedEnvelope,
  type PostCard,
  type PostDetail,
  type PostListQuery,
  type PostListResult,
  type QueryEnvelope,
} from "@/lib/queries/types";
import { tryCreatePublicClient } from "@/lib/supabase/public";

function sortColumn(sort: PostListQuery["sort"]) {
  if (sort === "oldest") return { column: "published_at" as const, ascending: true };
  if (sort === "popular") return { column: "view_count" as const, ascending: false };
  return { column: "published_at" as const, ascending: false };
}

export async function getPublishedPosts(
  query: PostListQuery = {},
): Promise<QueryEnvelope<PostListResult>> {
  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.min(48, Math.max(1, query.perPage ?? POSTS_PER_PAGE));
  const empty: PostListResult = {
    items: [],
    total: 0,
    page,
    perPage,
    pageCount: 0,
  };

  const client = await tryCreatePublicClient();
  if (!client) return emptyEnvelope(empty);

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { column, ascending } = sortColumn(query.sort);
  const q = query.q?.trim();

  let builder = client
    .from("posts")
    .select(POST_CARD_SELECT, { count: "exact" })
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());

  if (q) {
    const safe = q.replace(/[%_,.()]/g, " ").trim();
    if (safe) {
      builder = builder.or(
        `title.ilike.%${safe}%,excerpt.ilike.%${safe}%,subtitle.ilike.%${safe}%`,
      );
    }
  }

  if (query.categorySlug) {
    const { data: category, error: categoryError } = await client
      .from("categories")
      .select("id")
      .eq("slug", query.categorySlug)
      .maybeSingle();

    if (categoryError) return failedEnvelope(empty, categoryError.message);
    if (!category) return { configured: true, error: null, data: empty };
    builder = builder.eq("category_id", category.id);
  }

  if (query.tagSlug) {
    const { data: tagRow, error: tagError } = await client
      .from("tags")
      .select("id")
      .eq("slug", query.tagSlug)
      .maybeSingle();

    if (tagError) return failedEnvelope(empty, tagError.message);
    if (!tagRow) return { configured: true, error: null, data: empty };

    const { data: links, error: linkError } = await client
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", tagRow.id);

    if (linkError) return failedEnvelope(empty, linkError.message);
    const ids = (links ?? []).map((row) => row.post_id);
    if (ids.length === 0) return { configured: true, error: null, data: empty };
    builder = builder.in("id", ids);
  }

  const { data, error, count } = await builder
    .order(column, { ascending, nullsFirst: false })
    .range(from, to);

  if (error) return failedEnvelope(empty, error.message);

  const items = (data ?? [])
    .map((row) => mapPostCard(row))
    .filter((row): row is PostCard => row !== null);
  const total = count ?? items.length;

  return {
    configured: true,
    error: null,
    data: {
      items,
      total,
      page,
      perPage,
      pageCount: Math.ceil(total / perPage),
    },
  };
}

export async function getPostBySlug(
  slug: string,
): Promise<QueryEnvelope<PostDetail | null>> {
  const client = await tryCreatePublicClient();
  if (!client) return emptyEnvelope(null);

  const { data, error } = await client
    .from("posts")
    .select(POST_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) return failedEnvelope(null, error.message);
  if (!data) return { configured: true, error: null, data: null };

  const card = mapPostCard(data);
  if (!card) return { configured: true, error: null, data: null };

  const row = data as unknown as Record<string, unknown>;

  return {
    configured: true,
    error: null,
    data: {
      ...card,
      content: asJson(row.content),
      comments_enabled: Boolean(row.comments_enabled),
      seo_title: typeof row.seo_title === "string" ? row.seo_title : null,
      seo_description:
        typeof row.seo_description === "string" ? row.seo_description : null,
      canonical_url: typeof row.canonical_url === "string" ? row.canonical_url : null,
      updated_at: typeof row.updated_at === "string" ? row.updated_at : card.published_at ?? "",
      og_image: mapMedia(one(row.og_image)) ?? card.cover,
      tags: mapPostTags(row.post_tags),
    },
  };
}

export async function getRelatedPosts(
  post: Pick<PostCard, "id" | "category">,
  limit = 3,
): Promise<QueryEnvelope<PostCard[]>> {
  const client = await tryCreatePublicClient();
  if (!client) return emptyEnvelope([]);

  let builder = client
    .from("posts")
    .select(POST_CARD_SELECT)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (post.category) {
    builder = builder.eq("category_id", post.category.id);
  }

  const { data, error } = await builder;
  if (error) return failedEnvelope([], error.message);

  const items = (data ?? [])
    .map((row) => mapPostCard(row))
    .filter((row): row is PostCard => row !== null);

  if (items.length < limit) {
    const { data: fallback } = await client
      .from("posts")
      .select(POST_CARD_SELECT)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .neq("id", post.id)
      .order("published_at", { ascending: false })
      .limit(limit);

    const extra = (fallback ?? [])
      .map((row) => mapPostCard(row))
      .filter((row): row is PostCard => row !== null);
    const seen = new Set(items.map((item) => item.id));
    const merged = [...items];
    for (const item of extra) {
      if (seen.has(item.id)) continue;
      merged.push(item);
      seen.add(item.id);
      if (merged.length >= limit) break;
    }
    return { configured: true, error: null, data: merged.slice(0, limit) };
  }

  return { configured: true, error: null, data: items.slice(0, limit) };
}

export async function getAdjacentPosts(publishedAt: string | null, id: string) {
  const empty = { previous: null as PostCard | null, next: null as PostCard | null };
  const client = await tryCreatePublicClient();
  if (!client || !publishedAt) return emptyEnvelope(empty);

  const now = new Date().toISOString();

  const [{ data: older }, { data: newer }] = await Promise.all([
    client
      .from("posts")
      .select(POST_CARD_SELECT)
      .eq("status", "published")
      .lte("published_at", now)
      .lt("published_at", publishedAt)
      .neq("id", id)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from("posts")
      .select(POST_CARD_SELECT)
      .eq("status", "published")
      .lte("published_at", now)
      .gt("published_at", publishedAt)
      .neq("id", id)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    configured: true,
    error: null,
    data: {
      previous: mapPostCard(older),
      next: mapPostCard(newer),
    },
  };
}

export async function getFeaturedPosts(limit = 6): Promise<QueryEnvelope<PostCard[]>> {
  return getFlaggedPosts("featured", limit);
}

export async function getTrendingPosts(limit = 4): Promise<QueryEnvelope<PostCard[]>> {
  return getFlaggedPosts("trending", limit);
}

export async function getEditorsPicks(limit = 3): Promise<QueryEnvelope<PostCard[]>> {
  return getFlaggedPosts("editors_pick", limit);
}

export async function getPopularPosts(limit = 5): Promise<QueryEnvelope<PostCard[]>> {
  const client = await tryCreatePublicClient();
  if (!client) return emptyEnvelope([]);

  const { data, error } = await client
    .from("posts")
    .select(POST_CARD_SELECT)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) return failedEnvelope([], error.message);
  return {
    configured: true,
    error: null,
    data: (data ?? [])
      .map((row) => mapPostCard(row))
      .filter((row): row is PostCard => row !== null),
  };
}

export async function getLatestPosts(limit = 6): Promise<QueryEnvelope<PostCard[]>> {
  const client = await tryCreatePublicClient();
  if (!client) return emptyEnvelope([]);

  const { data, error } = await client
    .from("posts")
    .select(POST_CARD_SELECT)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return failedEnvelope([], error.message);
  return {
    configured: true,
    error: null,
    data: (data ?? [])
      .map((row) => mapPostCard(row))
      .filter((row): row is PostCard => row !== null),
  };
}

async function getFlaggedPosts(
  flag: "featured" | "trending" | "editors_pick",
  limit: number,
): Promise<QueryEnvelope<PostCard[]>> {
  const client = await tryCreatePublicClient();
  if (!client) return emptyEnvelope([]);

  const { data, error } = await client
    .from("posts")
    .select(POST_CARD_SELECT)
    .eq("status", "published")
    .eq(flag, true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return failedEnvelope([], error.message);
  return {
    configured: true,
    error: null,
    data: (data ?? [])
      .map((row) => mapPostCard(row))
      .filter((row): row is PostCard => row !== null),
  };
}

export async function searchPosts(
  query: string,
  limit = 20,
  offset = 0,
): Promise<QueryEnvelope<PostCard[]>> {
  const client = await tryCreatePublicClient();
  if (!client) return emptyEnvelope([]);

  const trimmed = query.trim();
  if (!trimmed) return { configured: true, error: null, data: [] };

  const { data, error } = await client.rpc("search_posts", {
    query: trimmed,
    result_limit: limit,
    result_offset: offset,
  });

  if (error) {
    const fallback = await getPublishedPosts({ q: trimmed, perPage: limit, page: 1 });
    return {
      configured: true,
      error: fallback.error,
      data: fallback.data.items,
    };
  }

  const ids = (data ?? []).map((row) => row.id);
  if (ids.length === 0) return { configured: true, error: null, data: [] };

  const { data: hydrated, error: hydrateError } = await client
    .from("posts")
    .select(POST_CARD_SELECT)
    .in("id", ids);

  if (hydrateError) return failedEnvelope([], hydrateError.message);

  const byId = new Map(
    (hydrated ?? [])
      .map((row) => mapPostCard(row))
      .filter((row): row is PostCard => row !== null)
      .map((row) => [row.id, row]),
  );

  return {
    configured: true,
    error: null,
    data: ids.map((id) => byId.get(id)).filter((row): row is PostCard => Boolean(row)),
  };
}
