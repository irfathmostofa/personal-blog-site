import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache/tags";
import {
  emptyEnvelope,
  failedEnvelope,
  type QueryEnvelope,
} from "@/lib/queries/types";
import { tryCreatePublicClient } from "@/lib/supabase/public";

export type PublicComment = {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
};

export async function getApprovedComments(
  postId: string,
  postSlug: string,
): Promise<QueryEnvelope<PublicComment[]>> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.comments, CACHE_TAGS.post(postSlug));

  const client = await tryCreatePublicClient();
  if (!client) return emptyEnvelope([]);

  const { data, error } = await client
    .from("comments")
    .select("id, post_id, parent_id, author_name, body, created_at")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) return failedEnvelope([], error.message);
  return { configured: true, error: null, data: data ?? [] };
}
