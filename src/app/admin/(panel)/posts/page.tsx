import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/admin-coming-soon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Posts",
  description: "Manage articles in the newsroom.",
  path: "/admin/posts",
  noIndex: true,
});

export default function AdminPostsPage() {
  return (
    <AdminComingSoon
      title="Posts"
      phase="8"
      description="Article CRUD, filters, scheduling and publishing land with the editor."
    />
  );
}
