import "server-only";

import { connection } from "next/server";

import { emptySpark, fillSpark, type SparkPoint } from "@/lib/admin/spark";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { PostStatus } from "@/lib/types/database";

export type AdminCounts = {
  posts: number;
  published: number;
  drafts: number;
  scheduled: number;
  archived: number;
  categories: number;
  tags: number;
  views: number;
  comments: number;
  pendingComments: number;
  subscribers: number;
  unreadMessages: number;
};

export type { SparkPoint };

export type PopularPostRow = {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  view_count: number;
  published_at: string | null;
};

export type RecentPostRow = {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  updated_at: string;
  published_at: string | null;
};

export type DashboardStats = {
  configured: boolean;
  error: string | null;
  counts: AdminCounts;
  publishing: SparkPoint[];
  views: SparkPoint[];
  popular: PopularPostRow[];
  recent: RecentPostRow[];
};

const EMPTY_COUNTS: AdminCounts = {
  posts: 0,
  published: 0,
  drafts: 0,
  scheduled: 0,
  archived: 0,
  categories: 0,
  tags: 0,
  views: 0,
  comments: 0,
  pendingComments: 0,
  subscribers: 0,
  unreadMessages: 0,
};

const DAY_MS = 86_400_000;
const SPARK_DAYS = 14;

async function countRows(
  query: PromiseLike<{ count: number | null; error: { message: string } | null }>,
): Promise<{ count: number; error: string | null }> {
  const { count, error } = await query;
  if (error) return { count: 0, error: error.message };
  return { count: count ?? 0, error: null };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connection();

  const empty: DashboardStats = {
    configured: false,
    error: null,
    counts: EMPTY_COUNTS,
    publishing: emptySpark(SPARK_DAYS),
    views: emptySpark(SPARK_DAYS),
    popular: [],
    recent: [],
  };

  if (!isSupabaseConfigured()) return empty;

  const supabase = await createClient();
  const since = new Date(Date.now() - (SPARK_DAYS - 1) * DAY_MS);
  since.setUTCHours(0, 0, 0, 0);
  const sinceIso = since.toISOString();

  const [
    posts,
    published,
    drafts,
    scheduled,
    archived,
    categories,
    tags,
    views,
    comments,
    pendingComments,
    subscribers,
    unreadMessages,
    viewRows,
    publishRows,
    popular,
    recent,
  ] = await Promise.all([
    countRows(supabase.from("posts").select("id", { count: "exact", head: true })),
    countRows(
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
    ),
    countRows(
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
    ),
    countRows(
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "scheduled"),
    ),
    countRows(
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "archived"),
    ),
    countRows(supabase.from("categories").select("id", { count: "exact", head: true })),
    countRows(supabase.from("tags").select("id", { count: "exact", head: true })),
    countRows(supabase.from("post_views").select("id", { count: "exact", head: true })),
    countRows(supabase.from("comments").select("id", { count: "exact", head: true })),
    countRows(
      supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ),
    countRows(
      supabase
        .from("subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", "confirmed"),
    ),
    countRows(
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false)
        .eq("is_archived", false),
    ),
    supabase
      .from("post_views")
      .select("viewed_at")
      .gte("viewed_at", sinceIso)
      .order("viewed_at", { ascending: true })
      .limit(4000),
    supabase
      .from("posts")
      .select("published_at")
      .eq("status", "published")
      .not("published_at", "is", null)
      .gte("published_at", sinceIso)
      .order("published_at", { ascending: true })
      .limit(500),
    supabase
      .from("posts")
      .select("id, title, slug, status, view_count, published_at")
      .order("view_count", { ascending: false })
      .limit(5),
    supabase
      .from("posts")
      .select("id, title, slug, status, updated_at, published_at")
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  const firstError =
    [
      posts,
      published,
      drafts,
      scheduled,
      archived,
      categories,
      tags,
      views,
      comments,
      pendingComments,
      subscribers,
      unreadMessages,
    ].find((row) => row.error)?.error ??
    viewRows.error?.message ??
    publishRows.error?.message ??
    popular.error?.message ??
    recent.error?.message ??
    null;

  return {
    configured: true,
    error: firstError,
    counts: {
      posts: posts.count,
      published: published.count,
      drafts: drafts.count,
      scheduled: scheduled.count,
      archived: archived.count,
      categories: categories.count,
      tags: tags.count,
      views: views.count,
      comments: comments.count,
      pendingComments: pendingComments.count,
      subscribers: subscribers.count,
      unreadMessages: unreadMessages.count,
    },
    publishing: fillSpark(
      SPARK_DAYS,
      (publishRows.data ?? [])
        .map((row) => row.published_at)
        .filter((value): value is string => Boolean(value)),
    ),
    views: fillSpark(
      SPARK_DAYS,
      (viewRows.data ?? []).map((row) => row.viewed_at),
    ),
    popular: popular.data ?? [],
    recent: recent.data ?? [],
  };
}
