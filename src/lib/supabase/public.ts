import "server-only";

import { createClient as createJsClient } from "@supabase/supabase-js";

import { isSupabaseConfigured, requireSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/types/database";

export type PublicSupabase = ReturnType<typeof createJsClient<Database>>;

/**
 * Cookie-less anon client for public reads and public inserts.
 * Safe to call from `"use cache"` scopes because it never reads cookies()
 * or headers(). Writes (contact) stay in Server Actions and are uncached.
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
  return createPublicClient();
}
