import "server-only";

import { connection } from "next/server";

import { ADMIN_PER_PAGE } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ContactMessage } from "@/lib/types/database";

export type MessageFilter = "inbox" | "unread" | "archived" | "all";

export type MessageListQuery = {
  page?: number;
  perPage?: number;
  q?: string;
  filter?: MessageFilter;
};

export type MessageListResult = {
  configured: boolean;
  error: string | null;
  items: ContactMessage[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  unread: number;
};

export function parseMessageFilter(value: string | undefined): MessageFilter {
  if (value === "unread" || value === "archived" || value === "all") return value;
  return "inbox";
}

export async function listAdminMessages(
  query: MessageListQuery = {},
): Promise<MessageListResult> {
  await connection();

  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.min(50, Math.max(1, query.perPage ?? ADMIN_PER_PAGE));
  const filter = query.filter ?? "inbox";
  const empty: MessageListResult = {
    configured: false,
    error: null,
    items: [],
    total: 0,
    page,
    perPage,
    pageCount: 0,
    unread: 0,
  };

  if (!isSupabaseConfigured()) return empty;

  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let request = supabase
    .from("contact_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filter === "inbox") request = request.eq("is_archived", false);
  if (filter === "unread") {
    request = request.eq("is_read", false).eq("is_archived", false);
  }
  if (filter === "archived") request = request.eq("is_archived", true);

  const q = query.q?.trim();
  if (q) {
    const escaped = q.replace(/[%*,.()\\]/g, " ").replace(/\s+/g, " ").trim();
    if (escaped) {
      request = request.or(
        `name.ilike.%${escaped}%,email.ilike.%${escaped}%,subject.ilike.%${escaped}%,message.ilike.%${escaped}%`,
      );
    }
  }

  const [list, unread] = await Promise.all([
    request,
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false)
      .eq("is_archived", false),
  ]);

  if (list.error) {
    return { ...empty, configured: true, error: list.error.message };
  }

  const total = list.count ?? 0;
  return {
    configured: true,
    error: null,
    items: (list.data ?? []) as ContactMessage[],
    total,
    page,
    perPage,
    pageCount: Math.ceil(total / perPage),
    unread: unread.count ?? 0,
  };
}
