import type { Metadata } from "next";

import { PhaseNotice } from "@/components/layout/phase-notice";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Newsletter",
  description: "Subscribe to new essays from the publication.",
  path: "/newsletter",
});

export default function NewsletterPage() {
  return (
    <PhaseNotice
      phase="Phase 10"
      title="Newsletter subscriptions arrive with the subscriber system."
      description="Double opt-in confirmation, consent tracking, unsubscribe tokens and CSV export are part of the subscriber phase. No fake form is shown before the backend can honour it."
    />
  );
}
