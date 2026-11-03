export const CACHE_TAGS = {
  posts: "posts",
  categories: "categories",
  tags: "tags",
  authors: "authors",
  comments: "comments",
  settings: "settings",
  post: (slug: string) => `post:${slug}`,
  category: (slug: string) => `category:${slug}`,
  tag: (slug: string) => `tag:${slug}`,
} as const;
