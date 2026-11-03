import type { Metadata } from "next";
import { Suspense } from "react";

import { MediaLibrary } from "@/components/media/media-library";
import { MediaGridSkeleton } from "@/components/media/media-skeleton";
import { listMediaAssets, parseMediaFolder, parseMediaSort } from "@/lib/admin/media";
import { requireStaff } from "@/lib/auth";
import { MEDIA_PER_PAGE } from "@/lib/constants";
import { firstParam, pageParam } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Media library",
  description: "Browse, upload and manage images.",
  path: "/admin/media",
  noIndex: true,
});

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function AdminMediaPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">
          Library
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Media
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Images are compressed in the browser, then stored in the blog-media
          bucket. Sizes and savings are measured from the actual files.
        </p>
      </header>
      <div className="mt-8">
        <Suspense fallback={<MediaGridSkeleton />}>
          <MediaBody searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function MediaBody({ searchParams }: { searchParams: Search }) {
  await requireStaff("/admin/media");
  const params = await searchParams;
  const q = firstParam(params.q);
  const folder = parseMediaFolder(firstParam(params.folder));
  const sort = parseMediaSort(firstParam(params.sort));
  const page = pageParam(params.page);

  const result = await listMediaAssets({
    page,
    perPage: MEDIA_PER_PAGE,
    q,
    folder,
    sort,
  });

  const filters = [
    q ? `“${q}”` : null,
    folder || null,
    sort !== "newest" ? sort : null,
  ].filter(Boolean);

  return (
    <MediaLibrary
      result={result.data}
      configured={result.configured}
      error={result.error}
      queryLabel={filters.length ? filters.join(" · ") : undefined}
    />
  );
}
