import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleBody } from "@/components/content/article-body";
import { ArticleCard, ArticleMeta } from "@/components/content/article-card";
import { ArticleCover } from "@/components/content/article-cover";
import { AuthorCard } from "@/components/content/author-card";
import { CommentForm } from "@/components/content/comment-form";
import { CommentThread } from "@/components/content/comment-thread";
import { NewsletterCta } from "@/components/content/newsletter-cta";
import { QueryError } from "@/components/content/empty-state";
import { ReadingProgress } from "@/components/content/reading-progress";
import { ShareBar } from "@/components/content/share-bar";
import { TableOfContents } from "@/components/content/table-of-contents";
import { asTiptapDoc, extractToc } from "@/lib/article/tiptap";
import { formatDate } from "@/lib/format";
import { SITE } from "@/lib/constants";
import { getApprovedComments } from "@/lib/queries/comments";
import {
  getAdjacentPosts,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/queries/posts";
import { getSiteSettings } from "@/lib/queries/settings";
import { absoluteUrl, buildMetadata, jsonLdScript } from "@/lib/seo";
import { Skeleton } from "@/components/ui/skeleton";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPostBySlug(slug);
  const post = result.data;
  if (!post) {
    return buildMetadata({ title: "Article", path: `/blog/${slug}`, noIndex: true });
  }

  return buildMetadata({
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || SITE.description,
    path: post.canonical_url || `/blog/${post.slug}`,
    image: post.og_image?.public_url ?? post.cover?.public_url,
    type: "article",
    publishedTime: post.published_at ?? undefined,
    modifiedTime: post.updated_at,
    authors: post.author ? [post.author.display_name] : [SITE.author.name],
  });
}

export default function ArticlePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ArticleFallback />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}

async function ArticleContent({ params }: { params: Params }) {
  const { slug } = await params;
  const result = await getPostBySlug(slug);

  if (!result.configured) notFound();
  if (result.error) {
    return (
      <div className="container-editorial py-16">
        <QueryError message={result.error} />
      </div>
    );
  }
  if (!result.data) notFound();

  const post = result.data;
  const [related, adjacent, comments, siteSettings] = await Promise.all([
    getRelatedPosts(post, 3),
    getAdjacentPosts(post.published_at, post.id),
    getApprovedComments(post.id, post.slug),
    getSiteSettings(),
  ]);
  const commentsOpen =
    post.comments_enabled && siteSettings.data.content.comments_enabled;

  const toc = extractToc(asTiptapDoc(post.content));
  const url = absoluteUrl(`/blog/${post.slug}`);
  const jsonLd = jsonLdScript({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: post.author?.display_name ?? SITE.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
    },
    image: post.cover?.public_url,
    mainEntityOfPage: url,
  });

  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <article className="pb-16">
        <header className="container-editorial pt-10 sm:pt-16">
          <div className="container-read mx-auto">
            <ArticleMeta post={post} />
            <h1 className="mt-4 font-heading text-4xl leading-[1.08] font-semibold tracking-tightest text-balance sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            {post.subtitle ? (
              <p className="mt-5 text-xl leading-relaxed text-muted-foreground">
                {post.subtitle}
              </p>
            ) : null}
            <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {post.author ? (
                <div>
                  <dt className="sr-only">Author</dt>
                  <dd>{post.author.display_name}</dd>
                </div>
              ) : null}
              {post.published_at ? (
                <div>
                  <dt className="sr-only">Published</dt>
                  <dd>{formatDate(post.published_at)}</dd>
                </div>
              ) : null}
              {post.updated_at && post.updated_at !== post.published_at ? (
                <div>
                  <dt className="sr-only">Updated</dt>
                  <dd>Updated {formatDate(post.updated_at)}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          {post.cover ? (
            <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border border-border">
              <ArticleCover
                cover={post.cover}
                title={post.title}
                priority
                className="aspect-[16/9]"
              />
              {post.cover.caption ? (
                <p className="px-4 py-3 text-center text-sm text-muted-foreground">
                  {post.cover.caption}
                </p>
              ) : null}
            </div>
          ) : null}
        </header>

        <div className="container-editorial mt-12">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,42rem)_minmax(0,16rem)] lg:justify-center">
            <div>
              <div id="article-body">
                <ArticleBody content={post.content} />
              </div>
              {post.tags.length > 0 ? (
                <ul className="mt-10 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <li key={tag.id}>
                      <Link
                        href={`/tag/${tag.slug}`}
                        className="rounded-full border border-border px-3 py-1 text-xs tracking-wide uppercase hover:border-brand/40"
                      >
                        {tag.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-8">
                <ShareBar title={post.title} url={url} />
              </div>
            </div>
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <TableOfContents items={toc} />
              </div>
            </aside>
          </div>
        </div>
      </article>

      <div className="container-editorial space-y-10 pb-16">
        {post.author ? <AuthorCard author={post.author} /> : null}
        {(adjacent.data.previous || adjacent.data.next) ? (
          <nav
            aria-label="Adjacent articles"
            className="grid gap-4 border-y border-border py-8 sm:grid-cols-2"
          >
            {adjacent.data.previous ? (
              <Link href={`/blog/${adjacent.data.previous.slug}`} className="group">
                <p className="text-xs tracking-widest text-muted-foreground uppercase">
                  Previous
                </p>
                <p className="mt-1 font-heading text-lg font-semibold group-hover:text-brand">
                  {adjacent.data.previous.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
            {adjacent.data.next ? (
              <Link
                href={`/blog/${adjacent.data.next.slug}`}
                className="group sm:text-right"
              >
                <p className="text-xs tracking-widest text-muted-foreground uppercase">
                  Next
                </p>
                <p className="mt-1 font-heading text-lg font-semibold group-hover:text-brand">
                  {adjacent.data.next.title}
                </p>
              </Link>
            ) : null}
          </nav>
        ) : null}
        {related.data.length > 0 ? (
          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Related
            </h2>
            <div className="mt-6 grid gap-8 sm:grid-cols-3">
              {related.data.map((item) => (
                <ArticleCard key={item.id} post={item} />
              ))}
            </div>
          </section>
        ) : null}
        <NewsletterCta compact />
        <section className="container-read mx-auto space-y-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Comments
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {commentsOpen
                ? "Notes are reviewed before they appear. Email is never shown publicly."
                : "Comments are closed on this article."}
            </p>
          </div>
          {comments.error ? (
            <QueryError message={comments.error} />
          ) : (
            <CommentThread comments={comments.data} />
          )}
          {commentsOpen ? <CommentForm postId={post.id} /> : null}
        </section>
      </div>
    </>
  );
}

function ArticleFallback() {
  return (
    <div className="container-editorial py-16">
      <div className="container-read mx-auto space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-8 w-2/3" />
      </div>
      <Skeleton className="mx-auto mt-10 aspect-[16/9] max-w-5xl rounded-2xl" />
    </div>
  );
}
