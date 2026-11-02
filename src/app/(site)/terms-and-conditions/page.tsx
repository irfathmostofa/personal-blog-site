import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/legal-page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms and conditions",
  description: "The terms that govern use of this publication.",
  path: "/terms-and-conditions",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and conditions"
      updated="Phase 3"
      intro="Placeholder structure for the publication terms. The copy is finalised in Phase 3 alongside the public pages so it reflects the shipped comment, newsletter and contact features."
      sections={[
        {
          heading: "Content ownership",
          body: "Articles, photography and illustrations published here remain the property of the publication and its contributors unless a piece states otherwise. Quoting with attribution and a link is welcome; wholesale republication is not.",
        },
        {
          heading: "Acceptable use",
          body: "Comments and contact forms must not be used for spam, harassment, or the distribution of malware. Submissions are subject to moderation and rate limiting.",
        },
        {
          heading: "No warranty",
          body: "Technical writing describes software at a point in time. Code samples are provided as-is, and you are responsible for evaluating them in your own environment.",
        },
      ]}
    />
  );
}
