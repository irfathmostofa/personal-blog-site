"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteMediaAsset, inspectMediaUsage } from "@/lib/actions/media";
import type { MediaUsageRef } from "@/lib/media/types";
import type { MediaAsset } from "@/lib/types/database";

export function DeleteMediaDialog({
  asset,
  open,
  onOpenChange,
  onDeleted,
}: {
  asset: MediaAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (id: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [refs, setRefs] = useState<MediaUsageRef[] | null>(null);
  const [checked, setChecked] = useState(false);

  function handleOpen(next: boolean) {
    if (!next) {
      setRefs(null);
      setChecked(false);
    }
    onOpenChange(next);
    if (next && asset) {
      startTransition(async () => {
        const result = await inspectMediaUsage(asset.id);
        if (result.status === "error" || !result.data) {
          toast.error(result.message);
          setRefs([]);
          return;
        }
        setRefs(result.data.refs);
      });
    }
  }

  function confirm() {
    if (!asset) return;
    const inUse = (refs?.length ?? 0) > 0;
    if (inUse && !checked) {
      toast.error("Confirm that you understand this image is in use.");
      return;
    }
    startTransition(async () => {
      const result = await deleteMediaAsset(asset.id, inUse);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      onDeleted?.(asset.id);
      handleOpen(false);
    });
  }

  const inUse = (refs?.length ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete image</DialogTitle>
          <DialogDescription>
            {asset
              ? `Remove ${asset.original_filename} from storage and the library.`
              : "Remove this image from storage and the library."}
          </DialogDescription>
        </DialogHeader>
        {refs === null ? (
          <p className="text-sm text-muted-foreground">Checking where this image is used…</p>
        ) : inUse ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">
              This image is referenced {refs.length === 1 ? "once" : `${refs.length} times`}. Deleting it can leave broken covers, avatars or article figures.
            </p>
            <ul className="max-h-40 space-y-1 overflow-auto text-sm">
              {refs.map((ref) => (
                <li key={`${ref.kind}-${ref.id}`}>
                  <span className="font-medium">{ref.label}</span>
                  {ref.extra ? (
                    <span className="text-muted-foreground"> · {ref.extra}</span>
                  ) : null}
                </li>
              ))}
            </ul>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={checked}
                onChange={(event) => setChecked(event.target.checked)}
              />
              <span>I understand references will point at a missing file.</span>
            </label>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No posts, categories, profiles or settings currently point at this file.
          </p>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending || refs === null || (inUse && !checked)}
            onClick={confirm}
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
