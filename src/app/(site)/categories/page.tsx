import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  EmptyState,
  QueryError,
  UnconfiguredNotice,
} from "@/components/content/empty-state";
import { ArticleGridSkeleton } from "@/components/content/article-skeleton";
import { getCategories } from "@/lib/queries/taxonomy";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description:
    "Browse every topic the publication covers, with article counts and featured pieces.",
  path: "/categories",
});

export default function CategoriesPage() {
  return (
    <div className="container-editorial py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">
          Taxonomy
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Categories
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Topics the publication covers. Counts reflect published articles only.
        </p>
      </header>
      <Suspense fallback={<div className="mt-10"><ArticleGridSkeleton count={6} /></div>}>
        <CategoryIndex />
      </Suspense>
    </div>
  );
}

async function CategoryIndex() {
  const result = await getCategories();

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
          title="No categories yet."
          description="Categories are created in the admin panel and appear here once they exist."
        />
      </div>
    );
  }

  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {result.data.map((category) => (
        <li key={category.id}>
          <Link
            href={`/category/${category.slug}`}
            className="block h-full rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/40"
          >
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {category.name}
            </h2>
            {category.description ? (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {category.description}
              </p>
            ) : null}
            <p className="mt-5 text-xs tracking-wide text-muted-foreground uppercase">
              {category.post_count} {category.post_count === 1 ? "article" : "articles"}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
