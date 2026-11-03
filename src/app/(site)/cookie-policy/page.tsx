import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/legal-page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cookie policy",
  description: "Which cookies this site sets and what they are used for.",
  path: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie policy"
      updated="2 November 2026"
      intro="This page documents every cookie the site sets. It is written against the actual implementation, which is why it currently lists only the strictly necessary cookies already introduced by the stack."
      sections={[
        {
          heading: "Strictly necessary",
          body: "Theme preference (light, dark, or follow system) is stored locally in the browser, not in a tracking cookie. Staff sessions use Supabase http-only auth cookies set at /admin. They are not used to track readers.",
        },
        {
          heading: "Analytics",
          body: "The planned viewer counts are stored server-side per article. No analytics cookie is required for that measurement, so none is set for readers.",
        },
        {
          heading: "Consent",
          body: "If a non-essential cookie is ever introduced, it will be gated behind the cookie consent banner described in Phase 10. Until then there is nothing optional to consent to.",
        },
      ]}
    />
  );
}
