import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/admin-coming-soon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Settings",
  description: "Publication settings.",
  path: "/admin/settings",
  noIndex: true,
});

export default function AdminSettingsPage() {
  return (
    <AdminComingSoon
      title="Settings"
      phase="9"
      description="Site identity, SEO defaults and comment switches are not editable yet."
    />
  );
}
