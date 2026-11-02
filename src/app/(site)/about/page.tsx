import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthorCard } from "@/components/content/author-card";
import { NewsletterCta } from "@/components/content/newsletter-cta";
import { QueryError } from "@/components/content/empty-state";
import { SITE } from "@/lib/constants";
import { getPrimaryAuthor } from "@/lib/queries/site";
import { getCategories } from "@/lib/queries/taxonomy";
import { buildMetadata } from "@/lib/seo";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Who writes here, what the publication covers, and why it exists.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="container-editorial py-12 sm:py-20">
      <div className="container-read mx-auto">
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">
          About
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          A small publication with a long horizon.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {SITE.name} is an independent editorial site for long-form writing on
          technology, design, engineering craft, and the culture of building
          software that lasts.
        </p>
        <div className="article-prose mt-10">
          <h2>Mission</h2>
          <p>
            Attention is scarce and most of the web treats it as a commodity. This
            publication takes the opposite bet: fewer pieces, written carefully,
            typeset for reading, and free of advertising machinery.
          </p>
          <h2>What you will find here</h2>
          <p>
            Essays on software craft, independent publishing, product design, and
            the quiet decisions that make systems hold up over years rather than
            weeks. The archive is organised by category so you can follow a
            thread rather than a feed.
          </p>
          <h2>How it is made</h2>
          <p>
            Articles are written in a structured editor, images are compressed
            before they are stored, and every public page reads from a Postgres
            database with row-level security. Nothing on the public site is a
            static mock of content that does not exist.
          </p>
        </div>
      </div>
      <Suspense fallback={<div className="mx-auto mt-12 max-w-2xl"><Skeleton className="h-40 w-full rounded-2xl" /></div>}>
        <AboutExtras />
      </Suspense>
    </div>
  );
}

async function AboutExtras() {
  const [author, categories] = await Promise.all([
    getPrimaryAuthor(),
    getCategories(),
  ]);

  return (
    <div className="mx-auto mt-12 max-w-2xl space-y-8">
      {author.error ? <QueryError message={author.error} /> : null}
      {author.data ? <AuthorCard author={author.data} /> : null}
      {categories.data.length > 0 ? (
        <section>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Topics covered
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {categories.data.map((category) => (
              <li
                key={category.id}
                className="rounded-full border border-border px-3 py-1 text-sm"
              >
                {category.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <NewsletterCta compact />
    </div>
  );
}
