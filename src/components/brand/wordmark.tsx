import Link from "next/link";

import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-baseline gap-2.5 rounded-sm transition-opacity hover:opacity-80",
        className,
      )}
      aria-label={`${SITE.name} home`}
    >
      <span
        aria-hidden
        className="mt-0.5 size-2.5 shrink-0 rounded-[2px] bg-brand transition-transform duration-300 group-hover:rotate-45"
      />
      <span className="flex flex-col">
        <span className="font-heading text-[1.35rem] leading-none font-semibold tracking-tight">
          {SITE.name}
        </span>
        {showTagline ? (
          <span className="mt-1 font-sans text-[0.7rem] tracking-wide text-muted-foreground uppercase">
            {SITE.tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
