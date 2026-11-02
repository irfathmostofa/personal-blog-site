import type { Metadata } from "next";

import { NewsletterCta } from "@/components/content/newsletter-cta";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Newsletter",
  description: "Subscribe to new essays from the publication.",
  path: "/newsletter",
});

export default function NewsletterPage() {
  return (
    <div className="container-editorial py-12 sm:py-20">
      <div className="container-read mx-auto">
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">
          Newsletter
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Occasional, not constant.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          New essays, and nothing else. Subscriptions use double opt-in,
          explicit consent, and an unsubscribe token in every message. The
          signup form is withheld until that path exists end to end in Phase 10.
        </p>
        <div className="mt-10">
          <NewsletterCta />
        </div>
      </div>
    </div>
  );
}
