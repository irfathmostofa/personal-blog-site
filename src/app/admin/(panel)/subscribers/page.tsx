import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { SubscriberManager } from "@/components/admin/subscriber-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { listAdminSubscribers, parseSubscriberStatus } from "@/lib/admin/subscribers";
import { requireStaff } from "@/lib/auth";
import { ADMIN_PER_PAGE } from "@/lib/constants";
import { firstParam, pageParam } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Subscribers",
  description: "Manage newsletter subscribers.",
  path: "/admin/subscribers",
  noIndex: true,
});

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function AdminSubscribersPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <AdminPageHeader
        eyebrow="Audience"
        title="Subscribers"
        description="Search, export, confirm, unsubscribe or remove addresses. Public signup still uses double opt-in in Phase 10."
      />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
          <SubscribersBody searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function SubscribersBody({ searchParams }: { searchParams: Search }) {
  await requireStaff("/admin/subscribers");
  const params = await searchParams;
  const q = firstParam(params.q);
  const status = parseSubscriberStatus(firstParam(params.status));
  const page = pageParam(params.page);

  const result = await listAdminSubscribers({
    page,
    perPage: ADMIN_PER_PAGE,
    q,
    status,
  });

  return <SubscriberManager result={result} status={status} />;
}
