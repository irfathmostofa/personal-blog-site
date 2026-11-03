import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/admin-coming-soon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Tags",
  description: "Manage publication tags.",
  path: "/admin/tags",
  noIndex: true,
});

export default function AdminTagsPage() {
  return (
    <AdminComingSoon
      title="Tags"
      phase="9"
      description="Tag management is not implemented yet."
    />
  );
}
