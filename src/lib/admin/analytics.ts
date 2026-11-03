import "server-only";

import { connection } from "next/server";

import { emptySpark, fillSpark, type SparkPoint } from "@/lib/admin/spark";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { PostStatus } from "@/lib/types/database";

export type AnalyticsPostRow = {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  view_count: number;
  like_count: number;
  published_at: string | null;
  category_id: string | null;
};

export type CategoryPerf = {
  id: string;
  name: string;
  slug: string;
  posts: number;
  views: number;
};

export type AnalyticsStats = {
  configured: boolean;
  error: string | null;
  views: SparkPoint[];
  publishing: SparkPoint[];
  popular: AnalyticsPostRow[];
  categories: CategoryPerf[];
  totals: {
    views: number;
    likes: number;
    comments: number;
    bookmarks: number;
    published: number;
  };
};

const SPARK_DAYS = 30;
const DAY_MS = 86_400_000;

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  await connection();

  const empty: AnalyticsStats = {
    configured: false,
    error: null,
    views: emptySpark(SPARK_DAYS),
    publishing: emptySpark(SPARK_DAYS),
    popular: [],
    categories: [],
    totals: { views: 0, likes: 0, comments: 0, bookmarks: 0, published: 0 },
  };

  if (!isSupabaseConfigured()) return empty;

  const supabase = await createClient();
  const since = new Date(Date.now() - (SPARK_DAYS - 1) * DAY_MS);
  since.setUTCHours(0, 0, 0, 0);
  const sinceIso = since.toISOString();

  const [
    viewRows,
    publishRows,
    popular,
    categories,
    posts,
    views,
    likes,
    comments,
    bookmarks,
    published,
  ] = await Promise.all([
    supabase
      .from("post_views")
      .select("viewed_at")
      .gte("viewed_at", sinceIso)
      .order("viewed_at", { ascending: true })
      .limit(8000),
    supabase
      .from("posts")
      .select("published_at")
      .eq("status", "published")
      .not("published_at", "is", null)
      .gte("published_at", sinceIso)
      .order("published_at", { ascending: true })
      .limit(1000),
    supabase
      .from("posts")
      .select("id, title, slug, status, view_count, like_count, published_at, category_id")
      .order("view_count", { ascending: false })
      .limit(12),
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("posts").select("category_id, view_count").eq("status", "published"),
    supabase.from("post_views").select("id", { count: "exact", head: true }),
    supabase.from("post_likes").select("id", { count: "exact", head: true }),
    supabase.from("comments").select("id", { count: "exact", head: true }),
    supabase.from("bookmarks").select("id", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  const firstError =
    viewRows.error?.message ??
    publishRows.error?.message ??
    popular.error?.message ??
    categories.error?.message ??
    posts.error?.message ??
    views.error?.message ??
    likes.error?.message ??
    comments.error?.message ??
    bookmarks.error?.message ??
    published.error?.message ??
    null;

  const tally = new Map<string, { posts: number; views: number }>();
  for (const row of posts.data ?? []) {
    if (!row.category_id) continue;
    const current = tally.get(row.category_id) ?? { posts: 0, views: 0 };
    current.posts += 1;
    current.views += row.view_count ?? 0;
    tally.set(row.category_id, current);
  }

  const categoryPerf: CategoryPerf[] = (categories.data ?? [])
    .map((row) => {
      const stats = tally.get(row.id) ?? { posts: 0, views: 0 };
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        posts: stats.posts,
        views: stats.views,
      };
    })
    .sort((a, b) => b.views - a.views || b.posts - a.posts);

  return {
    configured: true,
    error: firstError,
    views: fillSpark(
      SPARK_DAYS,
      (viewRows.data ?? []).map((row) => row.viewed_at),
    ),
    publishing: fillSpark(
      SPARK_DAYS,
      (publishRows.data ?? [])
        .map((row) => row.published_at)
        .filter((value): value is string => Boolean(value)),
    ),
    popular: (popular.data ?? []) as AnalyticsPostRow[],
    categories: categoryPerf,
    totals: {
      views: views.count ?? 0,
      likes: likes.count ?? 0,
      comments: comments.count ?? 0,
      bookmarks: bookmarks.count ?? 0,
      published: published.count ?? 0,
    },
  };
}
