import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache/tags";
import {
  emptyEnvelope,
  failedEnvelope,
  type QueryEnvelope,
} from "@/lib/queries/types";
import { parseSiteSettings, type SiteSettings } from "@/lib/settings";
import { tryCreatePublicClient } from "@/lib/supabase/public";

export async function getSiteSettings(): Promise<QueryEnvelope<SiteSettings>> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.settings);

  const fallback = parseSiteSettings([]);
  const client = await tryCreatePublicClient();
  if (!client) return emptyEnvelope(fallback);

  const { data, error } = await client.from("site_settings").select("key, value");
  if (error) return failedEnvelope(fallback, error.message);

  return {
    configured: true,
    error: null,
    data: parseSiteSettings(data ?? []),
  };
}
