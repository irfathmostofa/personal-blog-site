export const CACHE_TAGS = {
  posts: "posts",
  categories: "categories",
  tags: "tags",
  authors: "authors",
  post: (slug: string) => `post:${slug}`,
  category: (slug: string) => `category:${slug}`,
  tag: (slug: string) => `tag:${slug}`,
} as const;
