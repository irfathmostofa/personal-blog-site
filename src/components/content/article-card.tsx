import Link from "next/link";

import { ArticleCover } from "@/components/content/article-cover";
import { formatDate, formatShortDate, pluralize } from "@/lib/format";
import type { PostCard } from "@/lib/queries/types";
import { cn } from "@/lib/utils";

export function ArticleMeta({
  post,
  compact = false,
}: {
  post: PostCard;
  compact?: boolean;
}) {
  const date = post.published_at
    ? compact
      ? formatShortDate(post.published_at)
      : formatDate(post.published_at)
    : null;

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tracking-wide text-muted-foreground uppercase">
      {post.category ? (
        <Link
          href={`/category/${post.category.slug}`}
          className="font-medium text-brand hover:underline"
        >
          {post.category.name}
        </Link>
      ) : null}
      {date ? <span>{date}</span> : null}
      <span>{pluralize(post.reading_time_minutes, "min read", "min read")}</span>
    </p>
  );
}

export function ArticleCard({
  post,
  layout = "grid",
  priority = false,
}: {
  post: PostCard;
  layout?: "grid" | "list";
  priority?: boolean;
}) {
  if (layout === "list") {
    return (
      <article className="group grid gap-5 border-b border-border py-7 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-8">
        <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-xl">
          <ArticleCover
            cover={post.cover}
            title={post.title}
            priority={priority}
            className="aspect-[16/10] rounded-xl"
            sizes="(min-width: 640px) 176px, 100vw"
          />
        </Link>
        <div className="min-w-0">
          <ArticleMeta post={post} compact />
          <h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-balance">
            <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-brand">
              {post.title}
            </Link>
          </h3>
          {post.excerpt ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/blog/${post.slug}`}
        className="overflow-hidden rounded-xl border border-border"
      >
        <ArticleCover
          cover={post.cover}
          title={post.title}
          priority={priority}
          className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <ArticleMeta post={post} compact />
        <h3 className="mt-2 font-heading text-xl font-semibold tracking-tight text-balance sm:text-[1.35rem]">
          <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-brand">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function FeaturedHero({ post }: { post: PostCard }) {
  return (
    <article className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
      <div>
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">
          Featured
        </p>
        <ArticleMeta post={post} />
        <h1 className="mt-4 font-heading text-4xl leading-[1.05] font-semibold tracking-tightest text-balance sm:text-5xl lg:text-6xl">
          <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-brand">
            {post.title}
          </Link>
        </h1>
        {post.subtitle ? (
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {post.subtitle}
          </p>
        ) : post.excerpt ? (
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}
      </div>
      <Link
        href={`/blog/${post.slug}`}
        className={cn("overflow-hidden rounded-2xl border border-border")}
      >
        <ArticleCover
          cover={post.cover}
          title={post.title}
          priority
          className="aspect-[4/3] sm:aspect-[16/11]"
        />
      </Link>
    </article>
  );
}
