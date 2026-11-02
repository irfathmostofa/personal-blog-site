import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container-editorial flex h-16 items-center">
        <Wordmark />
      </div>

      <main
        id="main"
        className="container-editorial flex flex-1 flex-col justify-center pb-24"
      >
        <div className="container-read mx-auto">
          <p className="font-mono text-xs tracking-[0.2em] text-brand uppercase">
            Error 404
          </p>
          <h1 className="mt-4 font-heading text-5xl leading-tight font-semibold tracking-tightest sm:text-6xl">
            This page is not in the archive.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            The link may be out of date, or the article may have been moved or
            unpublished. The publication index is the fastest way back to
            something worth reading.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/blog" className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}>
              Browse all articles
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-10 px-4",
              )}
            >
              Return home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
