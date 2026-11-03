import "server-only";

import { connection } from "next/server";

import { ADMIN_PER_PAGE } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Comment, CommentStatus } from "@/lib/types/database";

export type AdminComment = Comment & {
  post: { id: string; title: string; slug: string } | null;
};

export type CommentListQuery = {
  page?: number;
  perPage?: number;
  q?: string;
  status?: CommentStatus | "";
};

export type CommentListResult = {
  configured: boolean;
  error: string | null;
  items: AdminComment[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  counts: Record<CommentStatus | "all", number>;
};

const EMPTY_COUNTS: Record<CommentStatus | "all", number> = {
  all: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  spam: 0,
};

export function parseCommentStatus(value: string | undefined): CommentStatus | "" {
  if (value === "pending" || value === "approved" || value === "rejected" || value === "spam") {
    return value;
  }
  return "";
}

export async function listAdminComments(
  query: CommentListQuery = {},
): Promise<CommentListResult> {
  await connection();

  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.min(50, Math.max(1, query.perPage ?? ADMIN_PER_PAGE));
  const empty: CommentListResult = {
    configured: false,
    error: null,
    items: [],
    total: 0,
    page,
    perPage,
    pageCount: 0,
    counts: EMPTY_COUNTS,
  };

  if (!isSupabaseConfigured()) return empty;

  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let request = supabase
    .from("comments")
    .select(
      "*, post:posts!comments_post_id_fkey ( id, title, slug )",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query.status) request = request.eq("status", query.status);

  const q = query.q?.trim();
  if (q) {
    const escaped = q.replace(/[%*,.()\\]/g, " ").replace(/\s+/g, " ").trim();
    if (escaped) {
      request = request.or(
        `author_name.ilike.%${escaped}%,author_email.ilike.%${escaped}%,body.ilike.%${escaped}%`,
      );
    }
  }

  const [list, all, pending, approved, rejected, spam] = await Promise.all([
    request,
    supabase.from("comments").select("id", { count: "exact", head: true }),
    supabase.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("comments").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("comments").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("comments").select("id", { count: "exact", head: true }).eq("status", "spam"),
  ]);

  if (list.error) {
    return { ...empty, configured: true, error: list.error.message };
  }

  const total = list.count ?? 0;
  const items: AdminComment[] = (list.data ?? []).map((row) => {
    const record = row as unknown as Comment & {
      post: { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null;
    };
    const post = Array.isArray(record.post) ? record.post[0] ?? null : record.post;
    return { ...record, post };
  });

  return {
    configured: true,
    error: null,
    items,
    total,
    page,
    perPage,
    pageCount: Math.ceil(total / perPage),
    counts: {
      all: all.count ?? 0,
      pending: pending.count ?? 0,
      approved: approved.count ?? 0,
      rejected: rejected.count ?? 0,
      spam: spam.count ?? 0,
    },
  };
}
