import type { TocItem } from "@/lib/article/tiptap";
import { cn } from "@/lib/utils";

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        In this essay
      </p>
      <ol className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id} className={cn(item.level === 3 && "pl-3")}>
            <a
              href={`#${item.id}`}
              className="text-sm leading-snug text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
