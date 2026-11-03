import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/admin-coming-soon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Comments",
  description: "Moderate reader comments.",
  path: "/admin/comments",
  noIndex: true,
});

export default function AdminCommentsPage() {
  return (
    <AdminComingSoon
      title="Comments"
      phase="9"
      description="Moderation queues and comment status changes are not built yet."
    />
  );
}
