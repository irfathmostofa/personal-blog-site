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
  deleteSubscriber,
  exportSubscribersCsv,
  updateSubscriber,
} from "@/lib/actions/subscribers";
import type { SubscriberListResult } from "@/lib/admin/subscribers";
import { formatRelativeDate } from "@/lib/format";
import type { Subscriber, SubscriberStatus } from "@/lib/types/database";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "unsubscribed", label: "Unsubscribed" },
];

function downloadCsv(csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function SubscriberManager({
  result,
  status,
}: {
  result: SubscriberListResult;
  status: SubscriberStatus | "";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [removing, setRemoving] = useState<Subscriber | null>(null);

  function setStatus(item: Subscriber, next: SubscriberStatus) {
    startTransition(async () => {
      const response = await updateSubscriber({ id: item.id, status: next });
      if (response.status === "error") {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      router.refresh();
    });
  }

  function exportList() {
    startTransition(async () => {
      const response = await exportSubscribersCsv(status);
      if (response.status === "error" || !response.data) {
        toast.error(response.message);
        return;
      }
      downloadCsv(response.data);
      toast.success(response.message);
    });
  }

  function confirmDelete() {
    if (!removing) return;
    startTransition(async () => {
      const response = await deleteSubscriber(removing.id);
      if (response.status === "error") {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      setRemoving(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <AdminFilterBar
            placeholder="Search email or name"
            selects={[{ name: "status", label: "Filter by status", options: STATUS_OPTIONS }]}
          />
        </div>
        <Button type="button" variant="outline" className="h-10 px-3" onClick={exportList} disabled={pending}>
          Export CSV
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {result.counts.confirmed} confirmed · {result.counts.pending} pending · {result.counts.unsubscribed} unsubscribed.
        Public signup still uses double opt-in in Phase 10.
      </p>

      {!result.configured ? (
        <EmptyState
          title="Subscribers are waiting on a database."
          description="Connect Supabase to list, export and update newsletter addresses."
        />
      ) : null}

      {result.error ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          Subscribers could not be loaded. {result.error}
        </p>
      ) : null}

      {result.configured && !result.error && result.items.length === 0 ? (
        <EmptyState
          title="No subscribers in this view."
          description="Addresses appear here after a reader consents. Export writes a CSV of the current filter."
        />
      ) : null}

      {result.items.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Consent</th>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.email}</p>
                    {item.name ? (
                      <p className="text-xs text-muted-foreground">{item.name}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={item.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {item.consent_given ? "Given" : "Missing"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatRelativeDate(item.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.status !== "confirmed" ? (
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          disabled={pending}
                          onClick={() => setStatus(item, "confirmed")}
                        >
                          Confirm
                        </Button>
                      ) : null}
                      {item.status !== "unsubscribed" ? (
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          disabled={pending}
                          onClick={() => setStatus(item, "unsubscribed")}
                        >
                          Unsubscribe
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        disabled={pending}
                        onClick={() => setRemoving(item)}
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Pagination page={result.page} pageCount={result.pageCount} />

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(next) => {
          if (!next) setRemoving(null);
        }}
        title="Remove subscriber"
        description={`Delete ${removing?.email ?? "this address"} from the list? Prefer unsubscribe if they asked to stop mail.`}
        confirmLabel="Remove"
        destructive
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
