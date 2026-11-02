import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/**
 * Service-role client. Bypasses RLS, so it must never be imported into a
 * client component, a route handler response body, or any shared module that
 * can reach the browser bundle.
 *
 * Used for privileged server-side operations (admin provisioning, scheduled
 * post promotion, media cleanup) that cannot be expressed safely through
 * user-scoped RLS.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. This is required for privileged server-side operations.",
    );
  }

  const { url } = requireSupabaseEnv();

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
