import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, CircleDashedIcon } from "lucide-react";

import { Wordmark } from "@/components/brand/wordmark";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Editorial publishing platform",
  description: SITE.description,
  path: "/",
});

const FOUNDATION = [
  {
    title: "App Router + Server Components",
    detail:
      "Route groups separate the public publication from the admin panel. Server Components fetch by default; client components are opt-in and colocated.",
  },
  {
    title: "Supabase as the data layer",
    detail:
      "Cookie-based sessions via @supabase/ssr, a request-scoped server client, and a service-role client isolated behind server-only.",
  },
  {
    title: "One editorial design system",
    detail:
      "Warm paper and ink palette, Newsreader for long-form, Inter for UI, JetBrains Mono for code. Tokens live in globals.css and drive both themes.",
  },
  {
    title: "Typed, validated configuration",
    detail:
      "Zod-validated environment access fails fast with an actionable message instead of a runtime mystery in production.",
  },
];

const ROADMAP = [
  { phase: "Phase 1", label: "Architecture and setup", state: "done" },
  { phase: "Phase 2", label: "Database, RLS and storage", state: "next" },
  { phase: "Phase 3", label: "Public website", state: "queued" },
  { phase: "Phase 4", label: "Dynamic content and caching", state: "queued" },
  { phase: "Phase 5", label: "Admin authentication", state: "queued" },
  { phase: "Phase 6", label: "Admin dashboard", state: "queued" },
  { phase: "Phase 7", label: "Image pipeline and media library", state: "queued" },
  { phase: "Phase 8", label: "Tiptap article editor", state: "queued" },
  { phase: "Phase 9", label: "Taxonomy, comments, subscribers", state: "queued" },
  { phase: "Phase 10", label: "Interactions and SEO", state: "queued" },
  { phase: "Phase 11", label: "Testing and optimization", state: "queued" },
  { phase: "Phase 12", label: "Deployment", state: "queued" },
] as const;

export default function HomePage() {
  return (
    <div className="pb-8">
      <section className="container-editorial pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div>
            <Badge
              variant="outline"
              className="mb-6 h-auto gap-2 rounded-full border-brand/30 bg-brand-muted/40 px-3 py-1 text-brand"
            >
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              Phase 1 complete — architecture ready
            </Badge>

            <h1 className="font-heading text-5xl leading-[1.02] font-semibold tracking-tightest text-balance sm:text-6xl lg:text-7xl">
              A publication built to be{" "}
              <span className="italic text-brand">read slowly</span>.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {SITE.name} is a dynamic editorial platform for long-form writing:
              a typography-first reading experience, a full publishing
              dashboard, and a media pipeline that optimises every image before
              it ships.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/blog"
                className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
              >
                Browse the publication
                <ArrowRightIcon className="size-4" aria-hidden />
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-11 px-5",
                )}
              >
                Get in touch
              </Link>
            </div>
          </div>

          <aside
            aria-label="Publication details"
            className="rounded-2xl border border-border bg-surface p-7"
          >
            <Wordmark showTagline />
            <dl className="mt-7 grid grid-cols-2 gap-6 border-t border-border pt-6 text-sm">
              <div>
                <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                  Editor
                </dt>
                <dd className="mt-1 font-medium">{SITE.author.name}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                  Language
                </dt>
                <dd className="mt-1 font-medium">English</dd>
              </div>
              <div>
                <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                  Stack
                </dt>
                <dd className="mt-1 font-medium">Next.js · Supabase</dd>
              </div>
              <div>
                <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                  Hosting
                </dt>
                <dd className="mt-1 font-medium">Vercel free tier</dd>
              </div>
            </dl>
            <p className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
              No article content is rendered yet. Public pages read from
              Supabase once the schema lands in Phase 2, so nothing here is
              placeholder copy pretending to be live data.
            </p>
          </aside>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="container-editorial py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase">
                Foundation
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                What Phase 1 put in place
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Everything below is implemented, not planned. Later phases build on
              these seams without reshaping them.
            </p>
          </div>

          <ul className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {FOUNDATION.map((item) => (
              <li key={item.title} className="bg-background p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand">
                    <CheckIcon className="size-3" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-sans text-base font-semibold tracking-normal">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-editorial py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <p className="text-xs font-semibold tracking-widest text-brand uppercase">
              Reading experience
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Typography is the product
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Article body copy runs on Newsreader at a comfortable measure, with
              a 1.75 line height and hanging punctuation. Interface text uses
              Inter so controls stay legible at small sizes.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Newsreader", "Inter", "JetBrains Mono"].map((font) => (
                <Badge key={font} variant="secondary" className="h-6">
                  {font}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-10">
            <p className="font-sans text-xs tracking-widest text-muted-foreground uppercase">
              Specimen
            </p>
            <div className="article-prose mt-5 text-[1.0625rem]">
              <h3 className="mt-0! text-2xl">
                The quiet economics of writing on the open web
              </h3>
              <p>
                A publication is a promise about attention. It says: if you give
                me twenty minutes, I will not waste them. Everything else — the
                type, the width of the column, the restraint in the palette — is
                in service of that promise.
              </p>
              <blockquote>
                Good editorial design is mostly the discipline of removing things
                that compete with the sentence.
              </blockquote>
              <p>
                Inline code such as{" "}
                <code>revalidateTag(&quot;posts&quot;)</code> keeps the reading
                surface fast without turning the whole site into a static build.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="container-editorial py-16 sm:py-20">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Delivery roadmap
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Each phase ships working software. Nothing is marked complete until
            it is implemented and verified against real data.
          </p>

          <ol className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ROADMAP.map((item) => {
              const done = item.state === "done";
              const next = item.state === "next";
              return (
                <li
                  key={item.phase}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4",
                    done
                      ? "border-brand/30 bg-brand-muted/30"
                      : "border-border bg-background",
                  )}
                >
                  {done ? (
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand" />
                  ) : (
                    <CircleDashedIcon
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        next ? "text-brand" : "text-muted-foreground/50",
                      )}
                    />
                  )}
                  <div>
                    <p className="font-mono text-[0.7rem] tracking-wider text-muted-foreground uppercase">
                      {item.phase}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-sm font-medium",
                        !done && !next && "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </p>
                  </div>
                  {next ? (
                    <Badge
                      variant="outline"
                      className="ml-auto h-5 border-brand/40 text-[0.65rem] text-brand"
                    >
                      Awaiting approval
                    </Badge>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
