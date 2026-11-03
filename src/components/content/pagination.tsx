"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  return (
    <Suspense fallback={null}>
      <PaginationLinks page={page} pageCount={pageCount} />
    </Suspense>
  );
}

function PaginationLinks({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  const pathname = usePathname();
  const params = useSearchParams();

  function hrefFor(nextPage: number) {
    const next = new URLSearchParams(params.toString());
    if (nextPage > 1) next.set("page", String(nextPage));
    else next.delete("page");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

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
