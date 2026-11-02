import type { Metadata } from "next";

import { PhaseNotice } from "@/components/layout/phase-notice";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Who writes here, what the publication covers, and why it exists.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PhaseNotice
      phase="Phase 3"
      title="The author page is content-managed."
      description="Biography, topics covered, mission and social links are stored in site_settings and profiles so they can be edited from the admin panel rather than hardcoded into a component."
    />
  );
}
