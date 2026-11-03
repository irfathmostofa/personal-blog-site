"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Pagination } from "@/components/content/pagination";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deletePost, duplicatePost } from "@/lib/actions/posts";
import type { AdminPostListItem, AdminPostListResult } from "@/lib/admin/posts";
import { formatRelativeDate, pluralize } from "@/lib/format";
import type { PostStatus } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<PostStatus, string> = {
  draft: "Draft",
  published: "Published",
  scheduled: "Scheduled",
  archived: "Archived",
};

export function PostList({
  result,
  configured,
  error,
  hrefFor,
}: {
  result: AdminPostListResult;
  configured: boolean;
  error: string | null;
  hrefFor: (page: number) => string;
}) {
  return (
    <div className="space-y-6">
      <PostFilters />
      {!configured ? (
        <p className="rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Supabase is not configured. Copy `.env.example` to `.env.local` to manage articles.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {configured && !error && result.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-heading text-xl font-semibold">No articles yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Start a draft. Autosave will keep it until you publish.
          </p>
          <Link
            href="/admin/posts/new"
            className={cn(buttonVariants(), "mt-5 inline-flex h-9 px-3")}
          >
            New post
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {result.items.map((item) => (
            <PostRow key={item.id} item={item} />
          ))}
        </ul>
      )}
      <Pagination page={result.page} pageCount={result.pageCount} hrefFor={hrefFor} />
    </div>
  );
}

function PostFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const status = params.get("status") ?? "";
  const sort = params.get("sort") ?? "updated";

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
      className="flex flex-col gap-3 lg:flex-row lg:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setParam("q", String(form.get("q") ?? "").trim());
      }}
    >
      <Input
        name="q"
        defaultValue={q}
        placeholder="Search titles"
        aria-label="Search posts"
        className="h-9 flex-1"
      />
      <select
        aria-label="Filter by status"
        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={status}
        onChange={(event) => setParam("status", event.target.value)}
      >
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="scheduled">Scheduled</option>
        <option value="archived">Archived</option>
      </select>
      <select
        aria-label="Sort posts"
        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={sort}
        onChange={(event) => setParam("sort", event.target.value)}
      >
        <option value="updated">Recently updated</option>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="title">Title</option>
        <option value="views">Views</option>
      </select>
    </form>
  );
}

function PostRow({ item }: { item: AdminPostListItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/posts/${item.id}`}
            className="truncate font-medium hover:text-brand"
          >
            {item.title}
          </Link>
          <Badge variant="outline">{STATUS_LABEL[item.status]}</Badge>
          {item.featured ? <Badge variant="secondary">Featured</Badge> : null}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          /{item.slug}
          {item.category ? ` · ${item.category.name}` : ""}
          {item.author ? ` · ${item.author.display_name}` : ""}
          {" · "}
          {formatRelativeDate(item.updated_at)}
          {" · "}
          {pluralize(item.view_count, "view")}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-1.5">
        <Link
          href={`/admin/posts/${item.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 px-2.5")}
        >
          Edit
        </Link>
        {item.status === "published" ? (
          <Link
            href={`/blog/${item.slug}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 px-2.5")}
          >
            View
          </Link>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2.5"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await duplicatePost(item.id);
              if (result.status === "error") {
                toast.error(result.message);
                return;
              }
              toast.success("Draft copy created.");
              router.push(`/admin/posts/${result.data.id}`);
            })
          }
        >
          Duplicate
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2.5 text-destructive"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
            startTransition(async () => {
              const result = await deletePost(item.id);
              if (result.status === "error") {
                toast.error(result.message);
                return;
              }
              toast.success("Article deleted.");
              router.refresh();
            });
          }}
        >
          Delete
        </Button>
      </div>
    </li>
  );
}
