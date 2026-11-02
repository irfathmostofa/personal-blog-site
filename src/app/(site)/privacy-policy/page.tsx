import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/legal-page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy policy",
  description:
    "What data this publication collects, why it collects it, and how to have it removed.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="Phase 3"
      intro="This is the structural placeholder for the privacy policy. The final text is written once the data flows below are implemented, so the policy describes what the software actually does rather than what we intend it to do."
      sections={[
        {
          heading: "What will be collected",
          body: "Page views for published articles (aggregated, not per-visitor profiles), newsletter email addresses with explicit consent, contact form submissions, and comments when enabled. Reader accounts are not part of the initial scope.",
        },
        {
          heading: "What will never be collected",
          body: "No third-party advertising trackers, no cross-site behavioural profiling, no selling of subscriber or contact data. Analytics are limited to first-party counts stored in Supabase.",
        },
        {
          heading: "Retention and removal",
          body: "Contact messages and comments are removable from the admin panel. Newsletter removal is available through an unsubscribe link in every message and from the subscriber dashboard.",
        },
        {
          heading: "Open question: analytics granularity",
          body: "Article view counts cannot distinguish unique visitors without additional infrastructure. The analytics dashboard will label these numbers as view counts, not unique visitors.",
        },
      ]}
    />
  );
}
