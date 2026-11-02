import "server-only";

import { isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Promotes due scheduled posts (`status = 'scheduled'` and `scheduled_for <= now()`)
 * via the service-role RPC. Returns 0 when credentials are missing or the call fails
 * so public pages never crash on an optional maintenance step.
 *
 * Intended to run on cache fill and from `/api/cron/promote`. There is no pg_cron.
 */
export async function promoteDuePosts(): Promise<number> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return 0;
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("promote_scheduled_posts");
    if (error) return 0;
    return typeof data === "number" ? data : 0;
  } catch {
    return 0;
  }
}
