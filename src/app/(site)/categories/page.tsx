import type { Metadata } from "next";

import { PhaseNotice } from "@/components/layout/phase-notice";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description:
    "Browse every topic the publication covers, with article counts and featured pieces.",
  path: "/categories",
});

export default function CategoriesPage() {
  return (
    <PhaseNotice
      phase="Phase 4"
      title="Categories are driven by the database."
      description="The category index reads from the categories table, including article counts and cover images managed in the admin panel. It ships together with the dynamic content layer."
    />
  );
}
