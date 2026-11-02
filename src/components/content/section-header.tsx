import Link from "next/link";

import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  href,
  hrefLabel = "View all",
  className,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-widest text-brand uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {hrefLabel}
        </Link>
      ) : null}
    </div>
  );
}
