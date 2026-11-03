import "server-only";

import { connection } from "next/server";

import { ADMIN_POSTS_PER_PAGE } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Json,
  MediaAsset,
  Post,
  PostStatus,
  Profile,
  Tag,
} from "@/lib/types/database";
import type { AdminPostSort } from "@/lib/validations/post";

export { ADMIN_POSTS_PER_PAGE } from "@/lib/constants";

export type AdminPostListItem = {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  featured: boolean;
  published_at: string | null;
  scheduled_for: string | null;
  updated_at: string;
  view_count: number;
  word_count: number;
  category: { id: string; name: string; slug: string } | null;
  author: { id: string; display_name: string } | null;
};

export type AdminPostDetail = Post & {
  cover: MediaAsset | null;
  og_image: MediaAsset | null;
  tags: Pick<Tag, "id" | "name" | "slug">[];
};

export type AdminTaxonomyOption = {
  id: string;
  name: string;
  slug: string;
};

export type AdminAuthorOption = {
  id: string;
  display_name: string;
  slug: string;
  role: Profile["role"];
};

export type AdminPostListQuery = {
  page?: number;
  perPage?: number;
  q?: string;
  status?: PostStatus | "";
  sort?: AdminPostSort;
};

export type AdminPostListResult = {
  items: AdminPostListItem[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

export type AdminQueryResult<T> = {
  configured: boolean;
  error: string | null;
  data: T;
};

const EMPTY_LIST: AdminPostListResult = {
  items: [],
  total: 0,
  page: 1,
  perPage: ADMIN_POSTS_PER_PAGE,
  pageCount: 0,
};

const LIST_SELECT = `
  id, title, slug, status, featured, published_at, scheduled_for, updated_at, view_count, word_count,
  category:categories ( id, name, slug ),
  author:profiles!posts_author_id_fkey ( id, display_name )
`;

const DETAIL_SELECT = `
  *,
  cover:media_assets!posts_cover_id_fkey (*),
  og_image:media_assets!posts_og_image_id_fkey (*),
  post_tags ( tag_id, tags ( id, name, slug ) )
`;

function one<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function sortSpec(sort: AdminPostSort | undefined) {
  if (sort === "oldest") return { column: "created_at" as const, ascending: true };
  if (sort === "newest") return { column: "created_at" as const, ascending: false };
  if (sort === "title") return { column: "title" as const, ascending: true };
  if (sort === "views") return { column: "view_count" as const, ascending: false };
  return { column: "updated_at" as const, ascending: false };
}

function mapListItem(row: Record<string, unknown>): AdminPostListItem | null {
  const id = typeof row.id === "string" ? row.id : null;
  const title = typeof row.title === "string" ? row.title : null;
  const slug = typeof row.slug === "string" ? row.slug : null;
  if (!id || !title || !slug) return null;
  const category = one(row.category as AdminPostListItem["category"] | AdminPostListItem["category"][]);
  const author = one(row.author as AdminPostListItem["author"] | AdminPostListItem["author"][]);
  return {
    id,
    title,
    slug,
    status: row.status as PostStatus,
    featured: Boolean(row.featured),
    published_at: typeof row.published_at === "string" ? row.published_at : null,
    scheduled_for: typeof row.scheduled_for === "string" ? row.scheduled_for : null,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : "",
    view_count: typeof row.view_count === "number" ? row.view_count : 0,
    word_count: typeof row.word_count === "number" ? row.word_count : 0,
    category,
    author,
  };
}

export function parsePostStatus(value: string | undefined): PostStatus | "" {
  if (
    value === "draft" ||
    value === "published" ||
    value === "scheduled" ||
    value === "archived"
  ) {
    return value;
  }
  return "";
}

export function parsePostSort(value: string | undefined): AdminPostSort {
  if (
    value === "newest" ||
    value === "oldest" ||
    value === "title" ||
    value === "views"
  ) {
    return value;
  }
  return "updated";
}

export async function listAdminPosts(
  query: AdminPostListQuery = {},
): Promise<AdminQueryResult<AdminPostListResult>> {
  await connection();

  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.min(50, Math.max(1, query.perPage ?? ADMIN_POSTS_PER_PAGE));
  const empty = { ...EMPTY_LIST, page, perPage };

  if (!isSupabaseConfigured()) {
    return { configured: false, error: null, data: empty };
  }

  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { column, ascending } = sortSpec(query.sort);

  let request = supabase
    .from("posts")
    .select(LIST_SELECT, { count: "exact" })
    .order(column, { ascending })
    .range(from, to);

  if (query.status) request = request.eq("status", query.status);

  const q = query.q?.trim();
  if (q) {
    const safe = q.replace(/[%_,.()]/g, " ").trim();
    if (safe) {
      request = request.or(
        `title.ilike.%${safe}%,slug.ilike.%${safe}%,subtitle.ilike.%${safe}%`,
      );
    }
  }

  const { data, error, count } = await request;
  if (error) {
    return { configured: true, error: error.message, data: empty };
  }

  const items = ((data ?? []) as unknown as Record<string, unknown>[])
    .map(mapListItem)
    .filter((row): row is AdminPostListItem => row !== null);
  const total = count ?? 0;

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

export async function getAdminPost(
  id: string,
): Promise<AdminQueryResult<AdminPostDetail | null>> {
  await connection();

  if (!isSupabaseConfigured()) {
    return { configured: false, error: null, data: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) return { configured: true, error: error.message, data: null };
  if (!data) return { configured: true, error: null, data: null };

  const row = data as unknown as Record<string, unknown>;
  const post = data as unknown as Post;
  const tags = Array.isArray(row.post_tags)
    ? row.post_tags
        .map((entry) => {
          const record = entry as { tags?: Tag | Tag[] | null };
          return one(record.tags);
        })
        .filter((tag): tag is Tag => Boolean(tag?.id && tag?.name && tag?.slug))
        .map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug }))
    : [];

  return {
    configured: true,
    error: null,
    data: {
      ...post,
      content: (post.content ?? { type: "doc", content: [] }) as Json,
      cover: one(row.cover as MediaAsset | MediaAsset[] | null),
      og_image: one(row.og_image as MediaAsset | MediaAsset[] | null),
      tags,
    },
  };
}

export async function listEditorTaxonomy(): Promise<
  AdminQueryResult<{
    categories: AdminTaxonomyOption[];
    tags: AdminTaxonomyOption[];
    authors: AdminAuthorOption[];
  }>
> {
  await connection();
  const empty = { categories: [], tags: [], authors: [] };

  if (!isSupabaseConfigured()) {
    return { configured: false, error: null, data: empty };
  }

  const supabase = await createClient();
  const [categories, tags, authors] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("tags").select("id, name, slug").order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, display_name, slug, role")
      .in("role", ["admin", "editor"])
      .order("display_name", { ascending: true }),
  ]);

  const error =
    categories.error?.message || tags.error?.message || authors.error?.message;
  if (error) {
    return { configured: true, error, data: empty };
  }

  return {
    configured: true,
    error: null,
    data: {
      categories: (categories.data ?? []) as AdminTaxonomyOption[],
      tags: (tags.data ?? []) as AdminTaxonomyOption[],
      authors: (authors.data ?? []) as AdminAuthorOption[],
    },
  };
}

export async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = await createClient();
  let request = supabase.from("posts").select("id").eq("slug", slug).limit(1);
  if (excludeId) request = request.neq("id", excludeId);
  const { data } = await request.maybeSingle();
  return Boolean(data);
}
