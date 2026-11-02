import { revalidatePath, revalidateTag, updateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache/tags";

const STALE_WHILE_REVALIDATE = "max" as const;

export function revalidatePosts() {
  revalidateTag(CACHE_TAGS.posts, STALE_WHILE_REVALIDATE);
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/categories");
  revalidatePath("/search");
}

export function revalidatePost(slug: string) {
  revalidateTag(CACHE_TAGS.post(slug), STALE_WHILE_REVALIDATE);
  revalidateTag(CACHE_TAGS.posts, STALE_WHILE_REVALIDATE);
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
  revalidatePath("/blog");
}

export function revalidateTaxonomy() {
  revalidateTag(CACHE_TAGS.categories, STALE_WHILE_REVALIDATE);
  revalidateTag(CACHE_TAGS.tags, STALE_WHILE_REVALIDATE);
  revalidateTag(CACHE_TAGS.posts, STALE_WHILE_REVALIDATE);
  revalidatePath("/categories");
  revalidatePath("/");
  revalidatePath("/blog");
}

export function revalidateAuthors() {
  revalidateTag(CACHE_TAGS.authors, STALE_WHILE_REVALIDATE);
  revalidatePath("/");
  revalidatePath("/about");
}

export function refreshPosts() {
  updateTag(CACHE_TAGS.posts);
}

export function refreshPost(slug: string) {
  updateTag(CACHE_TAGS.post(slug));
  updateTag(CACHE_TAGS.posts);
}

export function refreshTaxonomy() {
  updateTag(CACHE_TAGS.categories);
  updateTag(CACHE_TAGS.tags);
  updateTag(CACHE_TAGS.posts);
}

export function refreshAuthors() {
  updateTag(CACHE_TAGS.authors);
}
