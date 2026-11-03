import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/admin-coming-soon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Messages",
  description: "Read contact form submissions.",
  path: "/admin/messages",
  noIndex: true,
});

export default function AdminMessagesPage() {
  return (
    <AdminComingSoon
      title="Contact messages"
      phase="9"
      description="The inbox for contact form submissions is not built yet."
    />
  );
}
