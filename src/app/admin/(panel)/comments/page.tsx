import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { CommentManager } from "@/components/admin/comment-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { listAdminComments, parseCommentStatus } from "@/lib/admin/comments";
import { requireStaff } from "@/lib/auth";
import { COMMENTS_PER_PAGE } from "@/lib/constants";
import { firstParam, pageParam } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Comments",
  description: "Moderate reader comments.",
  path: "/admin/comments",
  noIndex: true,
});

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function AdminCommentsPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <AdminPageHeader
        eyebrow="Moderation"
        title="Comments"
        description="Approve, reject, mark as spam or delete. Only approved comments appear on public articles."
      />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
          <CommentsBody searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function CommentsBody({ searchParams }: { searchParams: Search }) {
  await requireStaff("/admin/comments");
  const params = await searchParams;
  const q = firstParam(params.q);
  const status = parseCommentStatus(firstParam(params.status));
  const page = pageParam(params.page);

  const result = await listAdminComments({
    page,
    perPage: COMMENTS_PER_PAGE,
    q,
    status,
  });

  function hrefFor(nextPage: number) {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (status) next.set("status", status);
    if (nextPage > 1) next.set("page", String(nextPage));
    const query = next.toString();
    return query ? `/admin/comments?${query}` : "/admin/comments";
  }

  return <CommentManager result={result} hrefFor={hrefFor} />;
}
