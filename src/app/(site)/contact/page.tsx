import type { Metadata } from "next";

import { ContactForm } from "@/components/content/contact-form";
import { SITE } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Send a message to the editor.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container-editorial py-12 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <p className="text-xs font-semibold tracking-widest text-brand uppercase">
            Contact
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Write to the editor.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Corrections, pitches, and questions for {SITE.author.name} land in
            the same inbox. Messages are stored in the publication database
            first; email is only a courtesy copy when EmailJS is configured.
          </p>
          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                Response time
              </dt>
              <dd className="mt-1">Usually within a few working days.</dd>
            </div>
            <div>
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                What not to send
              </dt>
              <dd className="mt-1">
                Unsolicited guest posts written by a model, SEO link requests,
                or anything that belongs in a press release.
              </dd>
            </div>
          </dl>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
