import type { Metadata } from "next";
import { Suspense } from "react";

import Link from "next/link";

import { ArticleGridSkeleton } from "@/components/content/article-skeleton";
import {
  EmptyState,
  QueryError,
  UnconfiguredNotice,
} from "@/components/content/empty-state";
import { SearchForm } from "@/components/content/search-form";
import { highlightMatches } from "@/lib/article/highlight";
import { searchPosts } from "@/lib/queries/posts";
import { firstParam } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search articles by title, content, excerpt, category or tag.",
  path: "/search",
  noIndex: true,
});

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function SearchPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="container-editorial py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">
          Search
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Find an essay
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Full-text search across titles, excerpts and article bodies.
        </p>
      </header>
      <div className="mt-8 max-w-2xl">
        <Suspense>
          <SearchForm />
        </Suspense>
      </div>
      <Suspense fallback={<div className="mt-10"><ArticleGridSkeleton count={3} /></div>}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchResults({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const query = firstParam(params.q)?.trim() ?? "";

  if (!query) {
    return (
      <p className="mt-10 text-sm text-muted-foreground">
        Type a phrase to search the archive.
      </p>
    );
  }

  const result = await searchPosts(query, 24, 0);
  if (!result.configured) {
    return <div className="mt-10"><UnconfiguredNotice /></div>;
  }
  if (result.error) {
    return <div className="mt-10"><QueryError message={result.error} /></div>;
  }
  if (result.data.length === 0) {
    return (
      <div className="mt-10">
        <EmptyState
          title={`No results for “${query}”.`}
          description="Try a shorter phrase, a title fragment, or browse the archive instead."
          actionHref="/blog"
          actionLabel="Browse all articles"
        />
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-10">
      <p className="text-sm text-muted-foreground">
        {result.data.length} {result.data.length === 1 ? "result" : "results"}
      </p>
      {result.data.map((post) => (
        <article key={post.id} className="border-b border-border pb-8 last:border-b-0">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            <Link href={`/blog/${post.slug}`} className="hover:text-brand">
              <span
                dangerouslySetInnerHTML={{
                  __html: highlightMatches(post.title, query),
                }}
              />
            </Link>
          </h2>
          {post.excerpt ? (
            <p
              className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: highlightMatches(post.excerpt, query),
              }}
            />
          ) : null}
          {post.category ? (
            <p className="mt-3 text-xs tracking-wide text-muted-foreground uppercase">
              {post.category.name}
              {post.reading_time_minutes
                ? ` · ${post.reading_time_minutes} min read`
                : ""}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
