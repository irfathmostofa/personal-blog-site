import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { MessageManager } from "@/components/admin/message-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { listAdminMessages, parseMessageFilter } from "@/lib/admin/messages";
import { requireStaff } from "@/lib/auth";
import { ADMIN_PER_PAGE } from "@/lib/constants";
import { firstParam, pageParam } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Messages",
  description: "Read contact form submissions.",
  path: "/admin/messages",
  noIndex: true,
});

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function AdminMessagesPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <AdminPageHeader
        eyebrow="Inbox"
        title="Contact messages"
        description="Read submissions from the public contact form. Mark read, archive or delete."
      />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
          <MessagesBody searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function MessagesBody({ searchParams }: { searchParams: Search }) {
  await requireStaff("/admin/messages");
  const params = await searchParams;
  const q = firstParam(params.q);
  const filter = parseMessageFilter(firstParam(params.filter));
  const page = pageParam(params.page);

  const result = await listAdminMessages({
    page,
    perPage: ADMIN_PER_PAGE,
    q,
    filter,
  });

  function hrefFor(nextPage: number) {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (filter !== "inbox") next.set("filter", filter);
    if (nextPage > 1) next.set("page", String(nextPage));
    const query = next.toString();
    return query ? `/admin/messages?${query}` : "/admin/messages";
  }

  return <MessageManager result={result} hrefFor={hrefFor} />;
}
