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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteMessage, patchMessage } from "@/lib/actions/messages";
import type { MessageListResult } from "@/lib/admin/messages";
import { formatDate, formatRelativeDate } from "@/lib/format";
import type { ContactMessage } from "@/lib/types/database";

const FILTER_OPTIONS = [
  { value: "inbox", label: "Inbox" },
  { value: "unread", label: "Unread" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

export function MessageManager({
  result,
  hrefFor,
}: {
  result: MessageListResult;
  hrefFor: (page: number) => string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);

  function patch(item: ContactMessage, next: { is_read?: boolean; is_archived?: boolean }) {
    startTransition(async () => {
      const response = await patchMessage({ id: item.id, ...next });
      if (response.status === "error") {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      if (active?.id === item.id && response.data) setActive(response.data);
      router.refresh();
    });
  }

  function open(item: ContactMessage) {
    setActive(item);
    if (!item.is_read) patch(item, { is_read: true });
  }

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const response = await deleteMessage(deleting.id);
      if (response.status === "error") {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      if (active?.id === deleting.id) setActive(null);
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">{result.unread} unread in the inbox.</p>
      <AdminFilterBar
        placeholder="Search name, email, subject or body"
        selects={[
          {
            name: "filter",
            label: "Filter messages",
            fallback: "inbox",
            options: FILTER_OPTIONS,
          },
        ]}
      />

      {!result.configured ? (
        <EmptyState
          title="The inbox is waiting on a database."
          description="Contact form submissions appear here after Supabase is connected."
        />
      ) : null}

      {result.error ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          Messages could not be loaded. {result.error}
        </p>
      ) : null}

      {result.configured && !result.error && result.items.length === 0 ? (
        <EmptyState
          title="No messages in this view."
          description="The public contact form writes here. Nothing is invented."
        />
      ) : null}

      {result.items.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {result.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => open(item)}
                className="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.subject}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.name} · {item.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!item.is_read ? <StatusBadge value="unread" /> : null}
                  {item.is_archived ? <StatusBadge value="archived" /> : null}
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(item.created_at)}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Pagination page={result.page} pageCount={result.pageCount} hrefFor={hrefFor} />

      <Dialog open={Boolean(active)} onOpenChange={(next) => !next && setActive(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {active ? (
            <>
              <DialogHeader>
                <DialogTitle>{active.subject}</DialogTitle>
                <DialogDescription>
                  {active.name} · {active.email} · {formatDate(active.created_at)}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{active.message}</p>
              <DialogFooter className="flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => patch(active, { is_read: !active.is_read })}
                  disabled={pending}
                >
                  {active.is_read ? "Mark unread" : "Mark read"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => patch(active, { is_archived: !active.is_archived })}
                  disabled={pending}
                >
                  {active.is_archived ? "Restore" : "Archive"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleting(active)}
                  disabled={pending}
                >
                  Delete
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(next) => {
          if (!next) setDeleting(null);
        }}
        title="Delete message"
        description="This permanently removes the contact submission."
        confirmLabel="Delete"
        destructive
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
