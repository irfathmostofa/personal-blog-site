import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { CategoryManager } from "@/components/admin/category-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { listAdminCategories } from "@/lib/admin/taxonomy";
import { requireStaff } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description: "Manage publication categories.",
  path: "/admin/categories",
  noIndex: true,
});

export default function AdminCategoriesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <AdminPageHeader
        eyebrow="Taxonomy"
        title="Categories"
        description="Create, feature and remove topics. Deleting a used category unlinks articles instead of deleting them."
      />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
          <CategoriesBody />
        </Suspense>
      </div>
    </div>
  );
}

async function CategoriesBody() {
  await requireStaff("/admin/categories");
  const result = await listAdminCategories();
  return (
    <CategoryManager
      items={result.data}
      configured={result.configured}
      error={result.error}
    />
  );
}
