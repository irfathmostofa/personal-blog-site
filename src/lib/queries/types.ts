import type { Json } from "@/lib/types/database";

export type QueryEnvelope<T> = {
  configured: boolean;
  error: string | null;
  data: T;
};

export type MediaRef = {
  public_url: string;
  alt_text: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
};

export type CategoryRef = {
  id: string;
  name: string;
  slug: string;
};

export type TagRef = {
  id: string;
  name: string;
  slug: string;
};

export type AuthorRef = {
  id: string;
  display_name: string;
  slug: string;
  bio: string | null;
  website_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  avatar: MediaRef | null;
};

export type PostCard = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  published_at: string | null;
  reading_time_minutes: number;
  view_count: number;
  like_count: number;
  featured: boolean;
  editors_pick: boolean;
  trending: boolean;
  cover: MediaRef | null;
  category: CategoryRef | null;
  author: AuthorRef | null;
};

export type PostDetail = PostCard & {
  content: Json;
  comments_enabled: boolean;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  updated_at: string;
  og_image: MediaRef | null;
  tags: TagRef[];
};

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  featured: boolean;
  sort_order: number;
  image: MediaRef | null;
  post_count: number;
};

export type TagRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  post_count: number;
};

export type PostSort = "newest" | "oldest" | "popular";
export type PostView = "grid" | "list";

export type PostListQuery = {
  page?: number;
  perPage?: number;
  sort?: PostSort;
  q?: string;
  categorySlug?: string;
  tagSlug?: string;
};

export type PostListResult = {
  items: PostCard[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

export type HomepageData = {
  featured: PostCard | null;
  latest: PostCard[];
  trending: PostCard[];
  popular: PostCard[];
  editorsPicks: PostCard[];
  categories: CategoryRecord[];
  author: AuthorRef | null;
};

export function emptyEnvelope<T>(data: T, configured = false): QueryEnvelope<T> {
  return { configured, error: null, data };
}

export function failedEnvelope<T>(data: T, error: string): QueryEnvelope<T> {
  return { configured: true, error, data };
}
