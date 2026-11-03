import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { TagManager } from "@/components/admin/tag-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { listAdminTags } from "@/lib/admin/taxonomy";
import { requireStaff } from "@/lib/auth";
import { firstParam } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Tags",
  description: "Manage publication tags.",
  path: "/admin/tags",
  noIndex: true,
});

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function AdminTagsPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <AdminPageHeader
        eyebrow="Taxonomy"
        title="Tags"
        description="Create, rename and remove tags. Counts include every linked article. Deletion unlinks first."
      />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
          <TagsBody searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function TagsBody({ searchParams }: { searchParams: Search }) {
  await requireStaff("/admin/tags");
  const params = await searchParams;
  const result = await listAdminTags(firstParam(params.q));
  return (
    <TagManager
      items={result.data}
      configured={result.configured}
      error={result.error}
    />
  );
}
