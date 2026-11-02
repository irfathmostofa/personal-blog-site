import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleCard } from "@/components/content/article-card";
import { ArticleGridSkeleton } from "@/components/content/article-skeleton";
import {
  EmptyState,
  QueryError,
  UnconfiguredNotice,
} from "@/components/content/empty-state";
import { Pagination } from "@/components/content/pagination";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { getPublishedPosts } from "@/lib/queries/posts";
import { getTagBySlug } from "@/lib/queries/taxonomy";
import { pageParam } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo";

type Params = Promise<{ slug: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag.data) {
    return buildMetadata({ title: "Tag", path: `/tag/${slug}`, noIndex: true });
  }
  return buildMetadata({
    title: tag.data.name,
    description: tag.data.description || `Articles tagged ${tag.data.name}.`,
    path: `/tag/${slug}`,
  });
}

export default function TagPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  return (
    <Suspense fallback={<div className="container-editorial py-16"><ArticleGridSkeleton /></div>}>
      <TagContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function TagContent({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const page = pageParam(search.page);

  const tag = await getTagBySlug(slug);
  if (!tag.configured) {
    return (
      <div className="container-editorial py-16">
        <UnconfiguredNotice />
      </div>
    );
  }
  if (tag.error) {
    return (
      <div className="container-editorial py-16">
        <QueryError message={tag.error} />
      </div>
    );
  }
  if (!tag.data) notFound();

  const posts = await getPublishedPosts({
    page,
    perPage: POSTS_PER_PAGE,
    tagSlug: slug,
  });

  return (
    <div className="container-editorial py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">
          Tag
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {tag.data.name}
        </h1>
        {tag.data.description ? (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {tag.data.description}
          </p>
        ) : null}
      </header>

      {posts.data.items.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            title="No published articles with this tag."
            description="When essays are tagged here they will appear in this list."
            actionHref="/blog"
            actionLabel="Browse all articles"
          />
        </div>
      ) : (
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.data.items.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <Pagination
        page={posts.data.page}
        pageCount={posts.data.pageCount}
        hrefFor={(next) => (next > 1 ? `/tag/${slug}?page=${next}` : `/tag/${slug}`)}
      />
    </div>
  );
}


