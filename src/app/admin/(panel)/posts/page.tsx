import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PostList } from "@/components/editor/post-list";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ADMIN_POSTS_PER_PAGE,
  listAdminPosts,
  parsePostSort,
  parsePostStatus,
} from "@/lib/admin/posts";
import { requireStaff } from "@/lib/auth";
import { firstParam, pageParam } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Posts",
  description: "Manage articles in the newsroom.",
  path: "/admin/posts",
  noIndex: true,
});

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function AdminPostsPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest text-brand uppercase">
            Newsroom
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Posts
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Drafts autosave. Published articles appear on the public site only
            when their publication time has passed.
          </p>
        </div>
        <Link href="/admin/posts/new" className={cn(buttonVariants(), "h-9 px-3")}>
          New post
        </Link>
      </header>
      <div className="mt-8">
        <Suspense fallback={<PostListSkeleton />}>
          <PostsBody searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function PostsBody({ searchParams }: { searchParams: Search }) {
  await requireStaff("/admin/posts");
  const params = await searchParams;
  const q = firstParam(params.q);
  const status = parsePostStatus(firstParam(params.status));
  const sort = parsePostSort(firstParam(params.sort));
  const page = pageParam(params.page);

  const result = await listAdminPosts({
    page,
    perPage: ADMIN_POSTS_PER_PAGE,
    q,
    status,
    sort,
  });

  return (
    <PostList
      result={result.data}
      configured={result.configured}
      error={result.error}
    />
  );
}

function PostListSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
