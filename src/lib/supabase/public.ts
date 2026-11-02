import "server-only";

import { connection } from "next/server";
import { createClient as createJsClient } from "@supabase/supabase-js";

import { isSupabaseConfigured, requireSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/types/database";

export type PublicSupabase = ReturnType<typeof createJsClient<Database>>;

/**
 * Cookie-less anon client for public reads and public inserts.
 * Awaits connection() so Phase 3 pages stay request-fresh; Phase 4 replaces
 * that with `use cache` and tagged revalidation.
 */
export function createPublicClient(): PublicSupabase {
  const { url, anonKey } = requireSupabaseEnv();

  return createJsClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function tryCreatePublicClient(): Promise<PublicSupabase | null> {
  if (!isSupabaseConfigured()) return null;
  await connection();
  return createPublicClient();
}
