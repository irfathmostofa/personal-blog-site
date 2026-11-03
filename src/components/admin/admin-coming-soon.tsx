import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminComingSoon({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description: string;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <Badge
        variant="outline"
        className="h-auto rounded-full border-brand/30 bg-brand-muted/40 px-3 py-1 text-brand"
      >
        Phase {phase}
      </Badge>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {description} This route is protected and reachable so the newsroom
        navigation is real; the tools themselves are not invented.
      </p>
      <Link
        href="/admin/dashboard"
        className={cn(buttonVariants({ variant: "outline" }), "mt-8 h-9 px-4")}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
