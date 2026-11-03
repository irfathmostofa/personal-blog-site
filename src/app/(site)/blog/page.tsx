import type { Metadata } from "next";
import { Suspense } from "react";

import { ArticleCard } from "@/components/content/article-card";
import { ArticleGridSkeleton } from "@/components/content/article-skeleton";
import {
  EmptyState,
  QueryError,
  UnconfiguredNotice,
} from "@/components/content/empty-state";
import { ListingToolbar } from "@/components/content/listing-toolbar";
import { Pagination } from "@/components/content/pagination";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { getPublishedPosts } from "@/lib/queries/posts";
import { getCategories, getTags } from "@/lib/queries/taxonomy";
import type { PostSort, PostView } from "@/lib/queries/types";
import { firstParam, pageParam } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description:
    "Every published article on the publication, filtered by category and tag.",
  path: "/blog",
});

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function BlogPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="container-editorial py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">
          Archive
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          All articles
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Long-form writing on technology, craft, and the slow web. Filter, sort,
          and search the published archive.
        </p>
      </header>
      <Suspense fallback={<ArticleGridSkeleton />}>
        <BlogListing searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function BlogListing({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const q = firstParam(params.q);
  const categorySlug = firstParam(params.category);
  const tagSlug = firstParam(params.tag);
  const sort = (firstParam(params.sort) as PostSort) || "newest";
  const view = (firstParam(params.view) as PostView) || "grid";
  const page = pageParam(params.page);

  const [posts, categories, tags] = await Promise.all([
    getPublishedPosts({
      page,
      perPage: POSTS_PER_PAGE,
      sort,
      q,
      categorySlug,
      tagSlug,
    }),
    getCategories(),
    getTags(),
  ]);

  if (!posts.configured) return <div className="mt-10"><UnconfiguredNotice /></div>;

  return (
    <div className="mt-10">
      <ListingToolbar
        categories={categories.data}
        tags={tags.data.filter((tag) => tag.post_count > 0)}
      />
      {posts.error ? (
        <div className="mt-8">
          <QueryError message={posts.error} />
        </div>
      ) : null}
      {posts.data.items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No articles match these filters."
            description="Try a different category, tag, or search term. If the archive is empty, nothing has been published yet."
            actionHref="/blog"
            actionLabel="Clear filters"
          />
        </div>
      ) : view === "list" ? (
        <div className="mt-4">
          {posts.data.items.map((post) => (
            <ArticleCard key={post.id} post={post} layout="list" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.data.items.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <Pagination
        page={posts.data.page}
        pageCount={posts.data.pageCount}
      />
    </div>
  );
}


