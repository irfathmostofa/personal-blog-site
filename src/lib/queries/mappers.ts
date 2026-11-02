import type { Json } from "@/lib/types/database";

import type { AuthorRef, CategoryRef, MediaRef, PostCard, TagRef } from "@/lib/queries/types";

export function one<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function mapMedia(value: unknown): MediaRef | null {
  const row = asRecord(value);
  if (!row) return null;
  const url = asString(row.public_url);
  if (!url) return null;
  return {
    public_url: url,
    alt_text: asString(row.alt_text),
    caption: asString(row.caption),
    width: asNumber(row.width),
    height: asNumber(row.height),
  };
}

export function mapCategory(value: unknown): CategoryRef | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = asString(row.id);
  const name = asString(row.name);
  const slug = asString(row.slug);
  if (!id || !name || !slug) return null;
  return { id, name, slug };
}

export function mapAuthor(value: unknown): AuthorRef | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = asString(row.id);
  const display_name = asString(row.display_name);
  const slug = asString(row.slug);
  if (!id || !display_name || !slug) return null;
  return {
    id,
    display_name,
    slug,
    bio: asString(row.bio),
    website_url: asString(row.website_url),
    twitter_url: asString(row.twitter_url),
    github_url: asString(row.github_url),
    linkedin_url: asString(row.linkedin_url),
    avatar: mapMedia(one(row.avatar)),
  };
}

export function mapTag(value: unknown): TagRef | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = asString(row.id);
  const name = asString(row.name);
  const slug = asString(row.slug);
  if (!id || !name || !slug) return null;
  return { id, name, slug };
}

const POST_CARD_FIELDS =
  "id, title, slug, subtitle, excerpt, published_at, reading_time_minutes, view_count, like_count, featured, editors_pick, trending";

export const POST_CARD_SELECT = `
  ${POST_CARD_FIELDS},
  cover:media_assets!posts_cover_id_fkey ( public_url, alt_text, caption, width, height ),
  category:categories ( id, name, slug ),
  author:profiles!posts_author_id_fkey (
    id, display_name, slug, bio, website_url, twitter_url, github_url, linkedin_url,
    avatar:media_assets!profiles_avatar_id_fkey ( public_url, alt_text, caption, width, height )
  )
`;

export const POST_DETAIL_SELECT = `
  ${POST_CARD_SELECT},
  content,
  comments_enabled,
  seo_title,
  seo_description,
  canonical_url,
  updated_at,
  og_image:media_assets!posts_og_image_id_fkey ( public_url, alt_text, caption, width, height ),
  post_tags ( tags ( id, name, slug ) )
`;

export function mapPostCard(value: unknown): PostCard | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = asString(row.id);
  const title = asString(row.title);
  const slug = asString(row.slug);
  if (!id || !title || !slug) return null;

  return {
    id,
    title,
    slug,
    subtitle: asString(row.subtitle),
    excerpt: asString(row.excerpt),
    published_at: asString(row.published_at),
    reading_time_minutes: asNumber(row.reading_time_minutes) ?? 1,
    view_count: asNumber(row.view_count) ?? 0,
    like_count: asNumber(row.like_count) ?? 0,
    featured: Boolean(row.featured),
    editors_pick: Boolean(row.editors_pick),
    trending: Boolean(row.trending),
    cover: mapMedia(one(row.cover)),
    category: mapCategory(one(row.category)),
    author: mapAuthor(one(row.author)),
  };
}

export function mapPostTags(value: unknown): TagRef[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const row = asRecord(entry);
      if (!row) return null;
      return mapTag(one(row.tags));
    })
    .filter((tag): tag is TagRef => tag !== null);
}

export function asJson(value: unknown): Json {
  if (value == null) return { type: "doc", content: [] };
  return value as Json;
}
