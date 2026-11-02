"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGridIcon, ListIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategoryRecord, PostSort, PostView, TagRecord } from "@/lib/queries/types";
import { cn } from "@/lib/utils";

export function ListingToolbar({
  categories,
  tags,
}: {
  categories: CategoryRecord[];
  tags: TagRecord[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const tag = params.get("tag") ?? "";
  const sort = (params.get("sort") as PostSort) || "newest";
  const view = (params.get("view") as PostView) || "grid";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <form
      className="flex flex-col gap-3 border-b border-border pb-6"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setParam("q", String(form.get("q") ?? "").trim());
      }}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search titles and excerpts"
          aria-label="Search articles"
          className="h-10 flex-1"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by category"
            className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={category}
            onChange={(event) => setParam("category", event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by tag"
            className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={tag}
            onChange={(event) => setParam("tag", event.target.value)}
          >
            <option value="">All tags</option>
            {tags.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort articles"
            className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={sort}
            onChange={(event) => setParam("sort", event.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most popular</option>
          </select>
          <div className="flex rounded-lg border border-border">
            <Button
              type="button"
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setParam("view", "grid")}
            >
              <LayoutGridIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setParam("view", "list")}
            >
              <ListIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
      {q ? (
        <p className={cn("text-xs text-muted-foreground")}>
          Showing matches for “{q}”.
        </p>
      ) : null}
    </form>
  );
}
