import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache/tags";
import { SITE } from "@/lib/constants";
import { mapAuthor, one } from "@/lib/queries/mappers";
import {
  emptyEnvelope,
  failedEnvelope,
  type AuthorRef,
  type HomepageData,
  type QueryEnvelope,
} from "@/lib/queries/types";
import {
  getEditorsPicks,
  getFeaturedPosts,
  getLatestPosts,
  getPopularPosts,
  getTrendingPosts,
} from "@/lib/queries/posts";
import { getFeaturedCategories } from "@/lib/queries/taxonomy";
import { tryCreatePublicClient } from "@/lib/supabase/public";

export async function getPrimaryAuthor(): Promise<QueryEnvelope<AuthorRef | null>> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.authors);

  const client = await tryCreatePublicClient();
  if (!client) {
    return emptyEnvelope({
      id: "local",
      display_name: SITE.author.name,
      slug: "editor",
      bio: SITE.author.bio,
      website_url: null,
      twitter_url: null,
      github_url: null,
      linkedin_url: null,
      avatar: null,
    });
  }

  const { data, error } = await client
    .from("profiles")
    .select(
      "id, display_name, slug, bio, website_url, twitter_url, github_url, linkedin_url, avatar:media_assets!profiles_avatar_id_fkey ( public_url, alt_text, caption, width, height )",
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return failedEnvelope(null, error.message);
  if (!data) {
    return {
      configured: true,
      error: null,
      data: {
        id: "local",
        display_name: SITE.author.name,
        slug: "editor",
        bio: SITE.author.bio,
        website_url: null,
        twitter_url: null,
        github_url: null,
        linkedin_url: null,
        avatar: null,
      },
    };
  }

  return {
    configured: true,
    error: null,
    data: mapAuthor({
      ...(data as unknown as Record<string, unknown>),
      avatar: one((data as unknown as Record<string, unknown>).avatar),
    }),
  };
}

export async function getHomepageData(): Promise<QueryEnvelope<HomepageData>> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.posts, CACHE_TAGS.categories, CACHE_TAGS.authors);

  const [featured, latest, trending, popular, editorsPicks, categories, author] =
    await Promise.all([
      getFeaturedPosts(1),
      getLatestPosts(6),
      getTrendingPosts(4),
      getPopularPosts(5),
      getEditorsPicks(3),
      getFeaturedCategories(6),
      getPrimaryAuthor(),
    ]);

  const configured = featured.configured;
  const error =
    featured.error ??
    latest.error ??
    trending.error ??
    popular.error ??
    editorsPicks.error ??
    categories.error ??
    author.error ??
    null;

  const featuredPost = featured.data[0] ?? latest.data[0] ?? null;
  const featuredId = featuredPost?.id;

  return {
    configured,
    error,
    data: {
      featured: featuredPost,
      latest: latest.data.filter((post) => post.id !== featuredId).slice(0, 6),
      trending: trending.data,
      popular: popular.data,
      editorsPicks: editorsPicks.data,
      categories: categories.data,
      author: author.data,
    },
  };
}
