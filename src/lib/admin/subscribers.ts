import "server-only";

import { connection } from "next/server";

import { ADMIN_PER_PAGE } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Subscriber, SubscriberStatus } from "@/lib/types/database";

export type SubscriberListQuery = {
  page?: number;
  perPage?: number;
  q?: string;
  status?: SubscriberStatus | "";
};

export type SubscriberListResult = {
  configured: boolean;
  error: string | null;
  items: Subscriber[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  counts: Record<SubscriberStatus | "all", number>;
};

const EMPTY_COUNTS: Record<SubscriberStatus | "all", number> = {
  all: 0,
  pending: 0,
  confirmed: 0,
  unsubscribed: 0,
};

export function parseSubscriberStatus(
  value: string | undefined,
): SubscriberStatus | "" {
  if (value === "pending" || value === "confirmed" || value === "unsubscribed") {
    return value;
  }
  return "";
}

export async function listAdminSubscribers(
  query: SubscriberListQuery = {},
): Promise<SubscriberListResult> {
  await connection();

  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.min(100, Math.max(1, query.perPage ?? ADMIN_PER_PAGE));
  const empty: SubscriberListResult = {
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
    .from("subscribers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query.status) request = request.eq("status", query.status);

  const q = query.q?.trim();
  if (q) {
    const escaped = q.replace(/[%*,.()\\]/g, " ").replace(/\s+/g, " ").trim();
    if (escaped) {
      request = request.or(`email.ilike.%${escaped}%,name.ilike.%${escaped}%`);
    }
  }

  const [list, all, pending, confirmed, unsubscribed] = await Promise.all([
    request,
    supabase.from("subscribers").select("id", { count: "exact", head: true }),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "unsubscribed"),
  ]);

  if (list.error) {
    return { ...empty, configured: true, error: list.error.message };
  }

  const total = list.count ?? 0;
  return {
    configured: true,
    error: null,
    items: (list.data ?? []) as Subscriber[],
    total,
    page,
    perPage,
    pageCount: Math.ceil(total / perPage),
    counts: {
      all: all.count ?? 0,
      pending: pending.count ?? 0,
      confirmed: confirmed.count ?? 0,
      unsubscribed: unsubscribed.count ?? 0,
    },
  };
}

export async function listExportSubscribers(
  status: SubscriberStatus | "",
): Promise<{ configured: boolean; error: string | null; items: Subscriber[] }> {
  await connection();
  if (!isSupabaseConfigured()) {
    return { configured: false, error: null, items: [] };
  }

  const supabase = await createClient();
  let request = supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (status) request = request.eq("status", status);

  const { data, error } = await request;
  if (error) return { configured: true, error: error.message, items: [] };
  return { configured: true, error: null, items: (data ?? []) as Subscriber[] };
}
