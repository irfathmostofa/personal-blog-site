import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { AnalyticsView } from "@/components/admin/analytics-view";
import { Skeleton } from "@/components/ui/skeleton";
import { getAnalyticsStats } from "@/lib/admin/analytics";
import { requireStaff } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Analytics",
  description: "Content performance for staff.",
  path: "/admin/analytics",
  noIndex: true,
});

export default function AdminAnalyticsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <AdminPageHeader
        eyebrow="Performance"
        title="Analytics"
        description="First-party counts from stored rows. View events are hits, not unique visitors."
      />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
          <AnalyticsBody />
        </Suspense>
      </div>
    </div>
  );
}

async function AnalyticsBody() {
  await requireStaff("/admin/analytics");
  const stats = await getAnalyticsStats();
  return <AnalyticsView stats={stats} />;
}
