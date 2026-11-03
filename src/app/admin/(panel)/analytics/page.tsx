import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/admin-coming-soon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Analytics",
  description: "Content performance for staff.",
  path: "/admin/analytics",
  noIndex: true,
});

export default function AdminAnalyticsPage() {
  return (
    <AdminComingSoon
      title="Analytics"
      phase="9"
      description="The dedicated analytics view expands the dashboard charts. Headline counts already live on the dashboard."
    />
  );
}
