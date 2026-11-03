import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleCard } from "@/components/content/article-card";
import { ArticleGridSkeleton } from "@/components/content/article-skeleton";
import { ArticleCover } from "@/components/content/article-cover";
import {
  EmptyState,
  QueryError,
  UnconfiguredNotice,
} from "@/components/content/empty-state";
import { Pagination } from "@/components/content/pagination";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { getPublishedPosts } from "@/lib/queries/posts";
import { getCategoryBySlug } from "@/lib/queries/taxonomy";
import type { PostSort } from "@/lib/queries/types";
import { firstParam, pageParam } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo";

type Params = Promise<{ slug: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category.data) {
    return buildMetadata({ title: "Category", path: `/category/${slug}`, noIndex: true });
  }
  return buildMetadata({
    title: category.data.name,
    description: category.data.description || `Articles in ${category.data.name}.`,
    path: `/category/${slug}`,
  });
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  return (
    <Suspense fallback={<div className="container-editorial py-16"><ArticleGridSkeleton /></div>}>
      <CategoryContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryContent({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const page = pageParam(search.page);
  const sort = (firstParam(search.sort) as PostSort) || "newest";

  const category = await getCategoryBySlug(slug);
  if (!category.configured) {
    return (
      <div className="container-editorial py-16">
        <UnconfiguredNotice />
      </div>
    );
  }
  if (category.error) {
    return (
      <div className="container-editorial py-16">
        <QueryError message={category.error} />
      </div>
    );
  }
  if (!category.data) notFound();

  const posts = await getPublishedPosts({
    page,
    perPage: POSTS_PER_PAGE,
    sort,
    categorySlug: slug,
  });

  const featured = posts.data.items[0] ?? null;

  return (
    <div className="container-editorial py-12 sm:py-16">
      <header className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div>
          <p className="text-xs font-semibold tracking-widest text-brand uppercase">
            Category
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {category.data.name}
          </h1>
          {category.data.description ? (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {category.data.description}
            </p>
          ) : null}
          <p className="mt-4 text-sm text-muted-foreground">
            {posts.data.total} {posts.data.total === 1 ? "article" : "articles"}
          </p>
        </div>
        {category.data.image ? (
          <div className="overflow-hidden rounded-2xl border border-border">
            <ArticleCover
              cover={category.data.image}
              title={category.data.name}
              className="aspect-[16/10]"
            />
          </div>
        ) : null}
      </header>

      {featured ? (
        <div className="mt-12 border-t border-border pt-12">
          <p className="text-xs font-semibold tracking-widest text-brand uppercase">
            Featured in this topic
          </p>
          <div className="mt-6 max-w-xl">
            <ArticleCard post={featured} />
          </div>
        </div>
      ) : null}

      {posts.data.items.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            title="No published articles in this category."
            description="When essays are filed here they will appear in this list."
            actionHref="/blog"
            actionLabel="Browse all articles"
          />
        </div>
      ) : (
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.data.items
            .filter((post) => post.id !== featured?.id)
            .map((post) => (
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


