import type { Metadata } from "next";

import { PhaseNotice } from "@/components/layout/phase-notice";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description:
    "Every published article on the publication, filtered by category and tag.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <PhaseNotice
      phase="Phase 3 / 4"
      title="The article listing lands with dynamic content."
      description="This route is wired into the public shell. Listing, search, filtering, sorting and pagination are built against the Supabase posts schema in Phase 4, which is why nothing is rendered here yet."
    />
  );
}
