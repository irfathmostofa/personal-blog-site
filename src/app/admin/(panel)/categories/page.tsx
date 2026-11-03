import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/admin-coming-soon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description: "Manage publication categories.",
  path: "/admin/categories",
  noIndex: true,
});

export default function AdminCategoriesPage() {
  return (
    <AdminComingSoon
      title="Categories"
      phase="9"
      description="Category create, edit, feature and delete tools are scheduled for later admin work."
    />
  );
}
