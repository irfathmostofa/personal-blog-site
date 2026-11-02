import Image from "next/image";

import type { MediaRef } from "@/lib/queries/types";
import { cn } from "@/lib/utils";

export function ArticleCover({
  cover,
  title,
  priority = false,
  className,
  sizes = "(min-width: 1024px) 960px, 100vw",
}: {
  cover: MediaRef | null;
  title: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  if (!cover) {
    return (
      <div
        className={cn(
          "flex aspect-[16/9] items-end bg-linear-to-br from-brand-muted via-surface to-muted p-6",
          className,
        )}
        aria-hidden
      >
        <span className="font-heading text-2xl font-semibold tracking-tight text-brand/70">
          {title}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <Image
        src={cover.public_url}
        alt={cover.alt_text || title}
        width={cover.width ?? 1600}
        height={cover.height ?? 900}
        priority={priority}
        sizes={sizes}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
