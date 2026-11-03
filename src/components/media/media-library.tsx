"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/content/empty-state";
import { Pagination } from "@/components/content/pagination";
import { DeleteMediaDialog } from "@/components/media/delete-media-dialog";
import { ImageUploader } from "@/components/media/image-uploader";
import { MediaCard } from "@/components/media/media-card";
import { MediaDetail } from "@/components/media/media-detail";
import { MediaToolbar } from "@/components/media/media-toolbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MediaListResult } from "@/lib/media/types";
import type { MediaAsset } from "@/lib/types/database";
import { pluralize } from "@/lib/format";

export function MediaLibrary({
  result,
  configured,
  error,
  queryLabel,
}: {
  result: MediaListResult;
  configured: boolean;
  error: string | null;
  queryLabel?: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState<MediaAsset | null>(null);
  const items = useMemo(() => result.items, [result.items]);

  function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <ImageUploader onUploaded={refresh} />

      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {configured
              ? `${pluralize(result.total, "image")} in the library${queryLabel ? ` · ${queryLabel}` : ""}.`
              : "Connect Supabase to load the library."}
          </p>
        </div>
        <MediaToolbar />
      </div>

      {!configured ? (
        <EmptyState
          title="The library is waiting on a database."
          description="Copy .env.example to .env.local, apply the migrations, and uploaded images will appear here. Nothing here is invented."
        />
      ) : null}

      {error ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          The library could not be loaded. {error}
        </p>
      ) : null}

      {configured && !error && items.length === 0 ? (
        <EmptyState
          title="No images yet."
          description="Drop files onto the uploader. Each one is compressed in the browser, stored in the blog-media bucket, and listed here with real file sizes."
        />
      ) : null}

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((asset) => (
            <MediaCard key={asset.id} asset={asset} onSelect={setActive} />
          ))}
        </div>
      ) : null}

      <Pagination page={result.page} pageCount={result.pageCount} />

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image details</DialogTitle>
            <DialogDescription>
              Compression numbers come from the original file and the stored object.
            </DialogDescription>
          </DialogHeader>
          {active ? (
            <MediaDetail
              key={active.id}
              asset={active}
              onUpdated={(next) => {
                setActive(next);
                refresh();
              }}
              onRequestDelete={(asset) => setDeleting(asset)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteMediaDialog
        asset={deleting}
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={() => {
          setActive(null);
          refresh();
        }}
      />
    </div>
  );
}
