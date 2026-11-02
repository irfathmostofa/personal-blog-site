import Link from "next/link";
import { ArrowLeftIcon, ConstructionIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PhaseNotice({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description: string;
}) {
  return (
    <div className="container-editorial flex min-h-[60vh] flex-col justify-center py-20">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-8 sm:p-10">
        <Badge
          variant="outline"
          className="h-auto gap-2 rounded-full border-brand/30 bg-brand-muted/40 px-3 py-1 text-brand"
        >
          <ConstructionIcon className="size-3" aria-hidden />
          {phase}
        </Badge>

        <h1 className="mt-6 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "mt-8 h-10 px-4",
          )}
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          Back to overview
        </Link>
      </div>
    </div>
  );
}
