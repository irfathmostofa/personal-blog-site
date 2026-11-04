"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { fail, type ActionResult } from "@/lib/admin/result";
import { requireStaff } from "@/lib/auth";
import { revalidateComments } from "@/lib/cache/revalidate";
import { isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { tryCreatePublicClient } from "@/lib/supabase/public";
import type { Comment, CommentStatus } from "@/lib/types/database";
import {
  commentIdSchema,
  moderateCommentSchema,
  publicCommentSchema,
} from "@/lib/validations/comment";

function refreshComments(slug?: string) {
  revalidateComments(slug);
  revalidatePath("/admin/comments");
  revalidatePath("/admin/dashboard");
}

type PendingCommentInsert = {
  post_id: string;
  parent_id?: string;
  author_name: string;
  author_email: string;
  body: string;
  status: "pending";
  ip_hash: string | null;
  user_agent: string | null;
};

async function insertPendingComment(
  client: NonNullable<Awaited<ReturnType<typeof tryCreatePublicClient>>>,
  payload: PendingCommentInsert,
): Promise<boolean> {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient();
      const { error: adminError } = await admin.from("comments").insert(payload);
      if (!adminError) return true;
    } catch {
      // Fall through to the anon insert path.
    }
  }

  const { error } = await client.from("comments").insert(payload);
  return !error;
}

async function hashIp(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 64);
}

export type PublicCommentState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function submitComment(
  _prev: PublicCommentState,
  formData: FormData,
): Promise<PublicCommentState> {
  const parsed = publicCommentSchema.safeParse({
    post_id: formData.get("post_id"),
    parent_id: formData.get("parent_id") || null,
    author_name: formData.get("author_name"),
    author_email: formData.get("author_email"),
    body: formData.get("body"),
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  if (parsed.data.company) {
    return { status: "success", message: "Thanks. Your comment is awaiting review." };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "Comments are not connected yet.",
    };
  }

  const client = await tryCreatePublicClient();
  if (!client) {
    return { status: "error", message: "Comments are not connected yet." };
  }

  const { data: post, error: postError } = await client
    .from("posts")
    .select("id, slug, comments_enabled, status, published_at")
    .eq("id", parsed.data.post_id)
    .maybeSingle();

  if (postError || !post) {
    return { status: "error", message: "That article is not accepting comments." };
  }

  if (!post.comments_enabled) {
    return { status: "error", message: "Comments are closed on this article." };
  }

  const { data: contentSettings } = await client
    .from("site_settings")
    .select("value")
    .eq("key", "content")
    .maybeSingle();
  const contentValue = contentSettings?.value;
  if (
    contentValue &&
    typeof contentValue === "object" &&
    !Array.isArray(contentValue) &&
    contentValue.comments_enabled === false
  ) {
    return { status: "error", message: "Comments are closed on this publication." };
  }

  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for") ?? headerStore.get("x-real-ip") ?? "";
  const ip = forwarded.split(",")[0]?.trim() ?? "";
  const userAgent = headerStore.get("user-agent")?.slice(0, 300) ?? null;

  const parentId = parsed.data.parent_id ?? null;
  if (parentId) {
    const { data: parent } = await client
      .from("comments")
      .select("id, post_id, status")
      .eq("id", parentId)
      .maybeSingle();
    if (!parent || parent.post_id !== post.id || parent.status !== "approved") {
      return { status: "error", message: "That reply target is not available." };
    }
  }

  const ipHash = ip ? await hashIp(ip) : null;
  const payload: PendingCommentInsert = {
    post_id: post.id,
    author_name: parsed.data.author_name,
    author_email: parsed.data.author_email,
    body: parsed.data.body,
    status: "pending",
    ip_hash: ipHash,
    user_agent: userAgent,
  };
  if (parentId) payload.parent_id = parentId;

  const inserted = await insertPendingComment(client, payload);
  if (!inserted) {
    return {
      status: "error",
      message: "The comment could not be stored. Please try again in a moment.",
    };
  }

  refreshComments(post.slug);
  return {
    status: "success",
    message: "Thanks. Your comment is awaiting review.",
  };
}

export async function moderateComment(
  input: unknown,
): Promise<ActionResult<Comment>> {
  await requireStaff("/admin/comments");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const parsed = moderateCommentSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid moderation request.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("*, post:posts!comments_post_id_fkey ( slug )")
    .single();

  if (error || !data) {
    return fail(error?.message ?? "The comment could not be updated.");
  }

  const post = (data as unknown as { post?: { slug?: string } | { slug?: string }[] }).post;
  const slug = Array.isArray(post) ? post[0]?.slug : post?.slug;
  refreshComments(slug);
  return {
    status: "success",
    message: `Marked as ${parsed.data.status}.`,
    data: data as Comment,
  };
}

export async function deleteComment(id: string): Promise<ActionResult> {
  await requireStaff("/admin/comments");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const parsed = commentIdSchema.safeParse(id);
  if (!parsed.success) return fail("Invalid comment id.");

  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select("id, post:posts!comments_post_id_fkey ( slug )")
    .eq("id", parsed.data)
    .maybeSingle();

  const { error } = await supabase.from("comments").delete().eq("id", parsed.data);
  if (error) return fail(error.message);

  const post = (data as unknown as { post?: { slug?: string } | { slug?: string }[] } | null)?.post;
  const slug = Array.isArray(post) ? post[0]?.slug : post?.slug;
  refreshComments(slug);
  return { status: "success", message: "Comment deleted.", data: undefined };
}

export async function bulkModerateComments(
  ids: string[],
  status: CommentStatus,
): Promise<ActionResult> {
  await requireStaff("/admin/comments");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");
  if (ids.length === 0) return fail("No comments selected.");

  const supabase = await createClient();
  const { error } = await supabase.from("comments").update({ status }).in("id", ids);
  if (error) return fail(error.message);

  refreshComments();
  return {
    status: "success",
    message: `${ids.length} ${ids.length === 1 ? "comment" : "comments"} marked as ${status}.`,
    data: undefined,
  };
}
