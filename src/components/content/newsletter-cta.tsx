import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function NewsletterCta({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      className={cn(
        "rounded-2xl border border-border bg-surface",
        compact ? "p-6" : "p-8 sm:p-10",
      )}
    >
      <p className="text-xs font-semibold tracking-widest text-brand uppercase">
        Newsletter
      </p>
      <h2
        className={cn(
          "mt-2 font-heading font-semibold tracking-tight",
          compact ? "text-2xl" : "text-3xl sm:text-4xl",
        )}
      >
        Essays, not a feed.
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
        Occasional dispatches from {SITE.name}. Subscriptions are stored with
        explicit consent and double opt-in. The signup form ships with the
        subscriber system in Phase 10; until then, leave a note via contact.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/newsletter" className={cn(buttonVariants(), "h-9 px-4")}>
          Learn more
        </Link>
        <Link
          href="/contact"
          className={cn(buttonVariants({ variant: "outline" }), "h-9 px-4")}
        >
          Write to the editor
        </Link>
      </div>
    </aside>
  );
}
