import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ArticleCard, FeaturedHero } from "@/components/content/article-card";
import { AuthorCard } from "@/components/content/author-card";
import {
  EmptyState,
  QueryError,
  UnconfiguredNotice,
} from "@/components/content/empty-state";
import { HomepageSkeleton } from "@/components/content/article-skeleton";
import { NewsletterCta } from "@/components/content/newsletter-cta";
import { SectionHeader } from "@/components/content/section-header";
import { SITE } from "@/lib/constants";
import { getHomepageData } from "@/lib/queries/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  description: SITE.description,
  path: "/",
});

export default function HomePage() {
  return (
    <Suspense fallback={<HomepageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const { configured, error, data } = await getHomepageData();

  if (!configured) {
    return (
      <div className="pb-8">
        <section className="container-editorial pt-16 pb-12 sm:pt-24">
          <p className="text-xs font-semibold tracking-widest text-brand uppercase">
            {SITE.name}
          </p>
          <h1 className="mt-4 max-w-3xl font-heading text-5xl leading-[1.02] font-semibold tracking-tightest text-balance sm:text-6xl lg:text-7xl">
            A publication built to be{" "}
            <span className="italic text-brand">read slowly</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {SITE.description}
          </p>
        </section>
        <div className="container-editorial pb-20">
          <UnconfiguredNotice />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <section className="container-editorial pt-12 pb-16 sm:pt-16 sm:pb-24">
        {error ? <QueryError message={error} /> : null}
        {data.featured ? (
          <FeaturedHero post={data.featured} />
        ) : (
          <EmptyState
            title="Nothing published yet."
            description="The homepage reads featured and latest articles from Supabase. Once the first post is published, it will appear here."
            actionHref="/blog"
            actionLabel="Open the archive"
          />
        )}
      </section>

      {data.latest.length > 0 ? (
        <section className="container-editorial pb-20">
          <SectionHeader title="Latest" href="/blog" hrefLabel="All articles" />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {data.latest.map((post, index) => (
              <ArticleCard key={post.id} post={post} priority={index < 2} />
            ))}
          </div>
        </section>
      ) : null}

      {data.trending.length > 0 ? (
        <section className="border-y border-border bg-surface">
          <div className="container-editorial py-16 sm:py-20">
            <SectionHeader title="Trending" />
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {data.trending.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-editorial py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
          <div>
            {data.editorsPicks.length > 0 ? (
              <>
                <SectionHeader title="Editor’s picks" />
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {data.editorsPicks.map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
              </>
            ) : (
              <SectionHeader title="From the desk" />
            )}
          </div>
          {data.popular.length > 0 ? (
            <aside>
              <SectionHeader title="Popular" />
              <ol className="space-y-5">
                {data.popular.map((post, index) => (
                  <li key={post.id} className="flex gap-4 border-b border-border pb-5">
                    <span className="font-heading text-2xl font-semibold text-brand/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="font-heading text-lg font-semibold tracking-tight hover:text-brand"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground uppercase">
                        {post.reading_time_minutes} min read
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          ) : null}
        </div>
      </section>

      {data.categories.length > 0 ? (
        <section className="border-y border-border bg-surface">
          <div className="container-editorial py-16 sm:py-20">
            <SectionHeader
              title="Topics"
              href="/categories"
              hrefLabel="All categories"
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="block rounded-2xl border border-border bg-background p-6 transition-colors hover:border-brand/40"
                  >
                    <p className="font-heading text-xl font-semibold tracking-tight">
                      {category.name}
                    </p>
                    {category.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    ) : null}
                    <p className="mt-4 text-xs tracking-wide text-muted-foreground uppercase">
                      {category.post_count}{" "}
                      {category.post_count === 1 ? "article" : "articles"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="container-editorial py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {data.author ? <AuthorCard author={data.author} /> : null}
          <NewsletterCta />
        </div>
      </section>
    </div>
  );
}
