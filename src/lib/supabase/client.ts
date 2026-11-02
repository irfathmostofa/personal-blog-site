"use client";

import { createBrowserClient } from "@supabase/ssr";

import { requireSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/types/database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null =
  null;

export function createClient() {
  if (browserClient) return browserClient;

  const { url, anonKey } = requireSupabaseEnv();

  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}
