import type { Metadata } from "next";

import { PhaseNotice } from "@/components/layout/phase-notice";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search articles by title, content, excerpt, category or tag.",
  path: "/search",
  noIndex: true,
});

export default function SearchPage() {
  return (
    <PhaseNotice
      phase="Phase 4"
      title="Search runs on Postgres full-text search."
      description="Results, suggestions and highlighting are implemented against a generated tsvector column on posts, with rate-limited server actions. The interface is intentionally absent until then."
    />
  );
}
