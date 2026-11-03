import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/admin-coming-soon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Media library",
  description: "Browse and manage uploaded images.",
  path: "/admin/media",
  noIndex: true,
});

export default function AdminMediaPage() {
  return (
    <AdminComingSoon
      title="Media library"
      phase="7"
      description="Uploads, compression statistics and the image picker arrive next."
    />
  );
}
