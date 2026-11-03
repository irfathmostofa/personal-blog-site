"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminFilterBar } from "@/components/admin/filter-bar";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/content/empty-state";
import { Pagination } from "@/components/content/pagination";
import { Button } from "@/components/ui/button";
import { deleteComment, moderateComment } from "@/lib/actions/comments";
import type { AdminComment, CommentListResult } from "@/lib/admin/comments";
import { formatRelativeDate } from "@/lib/format";
import type { CommentStatus } from "@/lib/types/database";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "spam", label: "Spam" },
];

export function CommentManager({
  result,
}: {
  result: CommentListResult;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<AdminComment | null>(null);

  function setStatus(item: AdminComment, status: CommentStatus) {
    startTransition(async () => {
      const response = await moderateComment({ id: item.id, status });
      if (response.status === "error") {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const response = await deleteComment(deleting.id);
      if (response.status === "error") {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>{result.counts.all} total</span>
        <span>{result.counts.pending} pending</span>
        <span>{result.counts.approved} approved</span>
        <span>{result.counts.spam} spam</span>
      </div>

      <AdminFilterBar
        placeholder="Search name, email or body"
        selects={[{ name: "status", label: "Filter by status", options: STATUS_OPTIONS }]}
      />

      {!result.configured ? (
        <EmptyState
          title="Comments are waiting on a database."
          description="Connect Supabase to moderate reader comments."
        />
      ) : null}

      {result.error ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          Comments could not be loaded. {result.error}
        </p>
      ) : null}

      {result.configured && !result.error && result.items.length === 0 ? (
        <EmptyState
          title="No comments in this view."
          description="Approved comments appear on the article. Pending items wait here until you review them."
        />
      ) : null}

      {result.items.length > 0 ? (
        <ul className="space-y-3">
          {result.items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{item.author_name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.author_email} · {formatRelativeDate(item.created_at)}
                    {item.post ? ` · ${item.post.title}` : ""}
                    {item.parent_id ? " · reply" : ""}
                  </p>
                </div>
                <StatusBadge value={item.status} />
              </div>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{item.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status !== "approved" ? (
                  <Button type="button" size="sm" disabled={pending} onClick={() => setStatus(item, "approved")}>
                    Approve
                  </Button>
                ) : null}
                {item.status !== "rejected" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => setStatus(item, "rejected")}
                  >
                    Reject
                  </Button>
                ) : null}
                {item.status !== "spam" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => setStatus(item, "spam")}
                  >
                    Spam
                  </Button>
                ) : null}
                {item.status !== "pending" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => setStatus(item, "pending")}
                  >
                    Pending
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => setDeleting(item)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <Pagination page={result.page} pageCount={result.pageCount} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(next) => {
          if (!next) setDeleting(null);
        }}
        title="Delete comment"
        description="This removes the comment and any nested replies. This cannot be undone."
        confirmLabel="Delete"
        destructive
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
