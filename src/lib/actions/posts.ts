"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminPost, slugTaken } from "@/lib/admin/posts";
import { asTiptapDoc, contentStats, EMPTY_DOC, isEmptyDoc } from "@/lib/article/tiptap";
import { requireStaff } from "@/lib/auth";
import { revalidatePost, revalidatePosts } from "@/lib/cache/revalidate";
import { isSupabaseConfigured } from "@/lib/env";
import { slugify } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Json, Post, PostStatus } from "@/lib/types/database";
import {
  postIdSchema,
  postWriteSchema,
  type PostIntent,
  type PostWriteInput,
} from "@/lib/validations/post";

export type PostActionResult<T = Post> =
  | { status: "success"; message: string; data: T }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

function fail(message: string, fieldErrors?: Record<string, string>): PostActionResult<never> {
  return { status: "error", message, fieldErrors };
}

function refreshAdmin() {
  revalidatePath("/admin/posts");
  revalidatePath("/admin/dashboard");
}

function uniqueSlugBase(title: string, slug: string) {
  const fromSlug = slugify(slug);
  const fromTitle = slugify(title);
  return fromSlug || fromTitle || "untitled";
}

async function nextAvailableSlug(base: string, excludeId?: string) {
  let candidate = base;
  let n = 2;
  while (await slugTaken(candidate, excludeId)) {
    candidate = `${base}-${n}`;
    n += 1;
    if (n > 50) {
      candidate = `${base}-${crypto.randomUUID().slice(0, 8)}`;
      break;
    }
  }
  return candidate;
}

function resolveStatus(
  intent: PostIntent,
  current: PostStatus | undefined,
  scheduledFor: string | null,
): { status: PostStatus; published_at: string | null | undefined; scheduled_for: string | null } {
  const now = new Date().toISOString();

  if (intent === "publish") {
    return { status: "published", published_at: now, scheduled_for: null };
  }
  if (intent === "schedule") {
    return { status: "scheduled", published_at: null, scheduled_for: scheduledFor };
  }
  if (intent === "unpublish") {
    return { status: "draft", published_at: undefined, scheduled_for: null };
  }
  if (intent === "archive") {
    return { status: "archived", published_at: undefined, scheduled_for: null };
  }
  if (intent === "autosave" || intent === "save") {
    if (current === "scheduled" && scheduledFor) {
      return { status: "scheduled", published_at: undefined, scheduled_for: scheduledFor };
    }
    return {
      status: current ?? "draft",
      published_at: undefined,
      scheduled_for: current === "scheduled" ? scheduledFor : null,
    };
  }
  return { status: "draft", published_at: undefined, scheduled_for: null };
}

function payloadFromInput(
  input: PostWriteInput,
  authorId: string,
  slug: string,
  status: PostStatus,
  publishedAt: string | null | undefined,
  scheduledFor: string | null,
) {
  const stats = contentStats(asTiptapDoc(input.content as Json));
  return {
    title: input.title,
    slug,
    subtitle: input.subtitle,
    excerpt: input.excerpt,
    content: input.content as Json,
    cover_id: input.cover_id,
    og_image_id: input.og_image_id,
    category_id: input.category_id,
    author_id: authorId,
    status,
    featured: input.featured,
    editors_pick: input.editors_pick,
    trending: input.trending,
    comments_enabled: input.comments_enabled,
    seo_title: input.seo_title,
    seo_description: input.seo_description,
    canonical_url: input.canonical_url,
    reading_time_minutes: stats.reading_time_minutes,
    word_count: stats.word_count,
    scheduled_for: scheduledFor,
    ...(publishedAt !== undefined ? { published_at: publishedAt } : {}),
  };
}

async function replaceTags(
  postId: string,
  tagIds: string[],
): Promise<string | null> {
  const supabase = await createClient();
  const { error: delError } = await supabase
    .from("post_tags")
    .delete()
    .eq("post_id", postId);
  if (delError) return delError.message;
  if (tagIds.length === 0) return null;
  const { error: insError } = await supabase.from("post_tags").insert(
    tagIds.map((tag_id) => ({ post_id: postId, tag_id })),
  );
  return insError?.message ?? null;
}

export async function savePost(input: unknown): Promise<PostActionResult> {
  const session = await requireStaff("/admin/posts");

  if (!isSupabaseConfigured()) {
    return fail("Supabase is not configured.");
  }

  const parsed = postWriteSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fail(parsed.error.issues[0]?.message ?? "Invalid article fields.", fieldErrors);
  }

  const data = parsed.data;
  const intent = data.intent;

  if (intent === "schedule") {
    if (!data.scheduled_for) {
      return fail("Choose a publication time to schedule this article.", {
        scheduled_for: "A future date is required.",
      });
    }
    if (new Date(data.scheduled_for).getTime() <= Date.now()) {
      return fail("Scheduled time must be in the future.", {
        scheduled_for: "Pick a time after now.",
      });
    }
  }

  if (intent === "publish" && isEmptyDoc(asTiptapDoc(data.content as Json))) {
    return fail("Write some article content before publishing.");
  }

  const supabase = await createClient();
  const base = uniqueSlugBase(data.title, data.slug);
  let existing: Post | null = null;

  if (data.id) {
    const { data: row, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row) {
      return fail(error?.message ?? "Article not found.");
    }
    existing = row;
  }

  const slug = await nextAvailableSlug(base, existing?.id);
  const resolved = resolveStatus(intent, existing?.status, data.scheduled_for);
  const authorId = existing ? data.author_id : session.userId;
  const payload = payloadFromInput(
    data,
    authorId,
    slug,
    resolved.status,
    resolved.published_at,
    resolved.scheduled_for,
  );

  if (!existing) {
    const { data: created, error } = await supabase
      .from("posts")
      .insert({ ...payload, author_id: session.userId })
      .select("*")
      .single();

    if (error || !created) {
      return fail(error?.message ?? "The article could not be created.");
    }

    if (authorId !== session.userId) {
      await supabase.from("posts").update({ author_id: authorId }).eq("id", created.id);
    }

    const tagError = await replaceTags(created.id, data.tag_ids);
    if (tagError) {
      return fail(`Article saved, but tags could not be updated. ${tagError}`);
    }

    refreshAdmin();
    if (created.status === "published") revalidatePost(created.slug);
    return {
      status: "success",
      message: messageFor(intent, created.status),
      data: created,
    };
  }

  const previousSlug = existing.slug;
  const { data: updated, error } = await supabase
    .from("posts")
    .update(payload)
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error || !updated) {
    return fail(error?.message ?? "The article could not be saved.");
  }

  const tagError = await replaceTags(updated.id, data.tag_ids);
  if (tagError) {
    return fail(`Article saved, but tags could not be updated. ${tagError}`);
  }

  refreshAdmin();
  revalidatePath(`/admin/posts/${updated.id}`);
  if (updated.status === "published" || existing.status === "published") {
    revalidatePost(updated.slug);
    if (previousSlug !== updated.slug) revalidatePost(previousSlug);
  } else {
    revalidatePosts();
  }

  return {
    status: "success",
    message: messageFor(intent, updated.status),
    data: updated,
  };
}

function messageFor(intent: PostIntent, status: PostStatus) {
  if (intent === "autosave") return "Draft saved.";
  if (intent === "publish") return "Article published.";
  if (intent === "schedule") return "Article scheduled.";
  if (intent === "unpublish") return "Article moved back to draft.";
  if (intent === "archive") return "Article archived.";
  if (status === "published") return "Published article updated.";
  if (status === "scheduled") return "Scheduled article updated.";
  return "Draft saved.";
}

export async function deletePost(id: string): Promise<PostActionResult<{ id: string }>> {
  await requireStaff("/admin/posts");

  const parsed = postIdSchema.safeParse(id);
  if (!parsed.success) return fail("Invalid article id.");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const loaded = await getAdminPost(parsed.data);
  if (!loaded.data) return fail(loaded.error ?? "Article not found.");

  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", parsed.data);
  if (error) return fail(error.message);

  refreshAdmin();
  revalidatePost(loaded.data.slug);
  return { status: "success", message: "Article deleted.", data: { id: parsed.data } };
}

export async function duplicatePost(id: string): Promise<PostActionResult> {
  const session = await requireStaff("/admin/posts");
  const parsed = postIdSchema.safeParse(id);
  if (!parsed.success) return fail("Invalid article id.");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const loaded = await getAdminPost(parsed.data);
  if (!loaded.data) return fail(loaded.error ?? "Article not found.");

  const source = loaded.data;
  const slug = await nextAvailableSlug(`${source.slug}-copy`);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: `${source.title} (copy)`,
      slug,
      subtitle: source.subtitle,
      excerpt: source.excerpt,
      content: source.content ?? (EMPTY_DOC as Json),
      cover_id: source.cover_id,
      og_image_id: source.og_image_id,
      category_id: source.category_id,
      author_id: session.userId,
      status: "draft",
      featured: false,
      editors_pick: false,
      trending: false,
      comments_enabled: source.comments_enabled,
      seo_title: source.seo_title,
      seo_description: source.seo_description,
      canonical_url: null,
      reading_time_minutes: source.reading_time_minutes,
      word_count: source.word_count,
      published_at: null,
      scheduled_for: null,
    })
    .select("*")
    .single();

  if (error || !data) return fail(error?.message ?? "The copy could not be created.");

  const tagError = await replaceTags(
    data.id,
    source.tags.map((tag) => tag.id),
  );
  if (tagError) {
    return fail(`Copy created, but tags could not be copied. ${tagError}`);
  }

  refreshAdmin();
  return { status: "success", message: "Draft copy created.", data };
}

export async function deletePostAndRedirect(id: string): Promise<void> {
  const result = await deletePost(id);
  if (result.status === "error") {
    redirect(`/admin/posts/${id}?error=${encodeURIComponent(result.message)}`);
  }
  redirect("/admin/posts");
}
