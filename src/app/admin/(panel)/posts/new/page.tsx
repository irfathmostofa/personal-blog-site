import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/admin-coming-soon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "New post",
  description: "Compose a new article.",
  path: "/admin/posts/new",
  noIndex: true,
});

export default function AdminNewPostPage() {
  return (
    <AdminComingSoon
      title="New post"
      phase="8"
      description="The Tiptap editor, autosave and publishing workflow are not built yet."
    />
  );
}
