import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < pageCount ? page + 1 : null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6"
    >
      {prev ? (
        <Link
          href={hrefFor(prev)}
          className={cn(buttonVariants({ variant: "outline" }), "h-9 px-4")}
        >
          Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </p>
      {next ? (
        <Link
          href={hrefFor(next)}
          className={cn(buttonVariants({ variant: "outline" }), "h-9 px-4")}
        >
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
