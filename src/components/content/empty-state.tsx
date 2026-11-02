import Link from "next/link";
import { FileTextIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-start rounded-2xl border border-dashed border-border bg-surface px-6 py-10 sm:px-10">
      <span className="flex size-10 items-center justify-center rounded-full bg-brand-muted text-brand">
        <FileTextIcon className="size-4" aria-hidden />
      </span>
      <h2 className="mt-5 font-heading text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className={cn(buttonVariants({ variant: "outline" }), "mt-6 h-9 px-4")}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function QueryError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive"
    >
      The publication could not be loaded. {message}
    </div>
  );
}

export function UnconfiguredNotice() {
  return (
    <EmptyState
      title="The archive is waiting on a database."
      description="Copy .env.example to .env.local, apply the migrations in supabase/migrations, and this page will read published articles from Supabase. Nothing here is invented."
    />
  );
}
