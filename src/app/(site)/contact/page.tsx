import type { Metadata } from "next";

import { PhaseNotice } from "@/components/layout/phase-notice";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Send a message to the editor.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PhaseNotice
      phase="Phase 3"
      title="The contact form writes to the database first."
      description="Messages are validated with Zod, rate limited, stored in contact_messages, and only then optionally forwarded by email. The form is withheld until that path exists end to end."
    />
  );
}
