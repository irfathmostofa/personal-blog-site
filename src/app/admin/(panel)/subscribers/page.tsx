import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/admin-coming-soon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Subscribers",
  description: "Manage newsletter subscribers.",
  path: "/admin/subscribers",
  noIndex: true,
});

export default function AdminSubscribersPage() {
  return (
    <AdminComingSoon
      title="Subscribers"
      phase="9"
      description="Subscriber lists and export are not implemented yet."
    />
  );
}
