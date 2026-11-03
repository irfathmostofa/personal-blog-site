"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ImagePlusIcon, UploadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { checkDuplicateMedia, recordMediaAsset } from "@/lib/actions/media";
import {
  MEDIA_ACCEPT,
  MEDIA_BUCKET,
  MEDIA_FOLDER_LABEL,
  MEDIA_FOLDERS,
} from "@/lib/media/constants";
import { buildStoragePath } from "@/lib/media/filename";
import { revokeOptimized } from "@/lib/media/optimize";
import { createClient } from "@/lib/supabase/client";
import type { MediaAsset, MediaFolder } from "@/lib/types/database";
import { isSupabaseConfigured } from "@/lib/env";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

import { createUploadItems, runOptimize, type UploadItem } from "@/components/media/upload-queue";

type ImageUploaderProps = {
  defaultFolder?: MediaFolder;
  compact?: boolean;
  onUploaded?: (assets: MediaAsset[]) => void;
};

export function ImageUploader({
  defaultFolder = "general",
  compact = false,
  onUploaded,
}: ImageUploaderProps) {
  const inputId = useId();
  const [folder, setFolder] = useState<MediaFolder>(defaultFolder);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const itemsRef = useRef<UploadItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        item.controller.abort();
        if (item.optimized) revokeOptimized(item.optimized);
      }
    };
  }, []);

  const enqueue = useCallback((files: File[]) => {
    const queued = itemsRef.current.length;
    const { items: next, rejected } = createUploadItems(files, queued);
    for (const message of rejected) toast.error(message);
    if (next.length === 0) return;

    setItems((current) => [...current, ...next]);

    void (async () => {
      for (const item of next) {
        const optimized = await runOptimize(item);
        setItems((current) => current.map((row) => (row.id === item.id ? optimized : row)));
      }
    })();
  }, []);

  function onDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const files = Array.from(event.dataTransfer.files);
    void enqueue(files);
  }

  function removeItem(id: string) {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      target?.controller.abort();
      if (target?.optimized) revokeOptimized(target.optimized);
      return current.filter((item) => item.id !== id);
    });
  }

  async function uploadAll() {
    const ready = items.filter((item) => item.status === "ready" && item.optimized);
    if (ready.length === 0) return;

    if (!isSupabaseConfigured()) {
      toast.error("Supabase is not configured. Set the public URL and anon key first.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const uploaded: MediaAsset[] = [];

    for (const item of ready) {
      setItems((current) =>
        current.map((row) => (row.id === item.id ? { ...row, status: "uploading", progress: 55 } : row)),
      );

      const optimized = item.optimized;
      if (!optimized) continue;

      const duplicate = await checkDuplicateMedia({
        originalFilename: item.original.name,
        originalFileSize: item.original.size,
      });

      const existing = duplicate.status === "success" ? duplicate.data : null;
      if (existing) {
        setItems((current) =>
          current.map((row) =>
            row.id === item.id
              ? {
                  ...row,
                  status: "done",
                  progress: 100,
                  duplicateOf: {
                    id: existing.id,
                    public_url: existing.public_url,
                  },
                }
              : row,
          ),
        );
        uploaded.push(existing);
        continue;
      }

      const path = buildStoragePath(folder, optimized.file.type, item.original.name);
      const { error: storageError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, optimized.file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: optimized.file.type,
      });

      if (storageError) {
        setItems((current) =>
          current.map((row) =>
            row.id === item.id
              ? { ...row, status: "error", error: storageError.message }
              : row,
          ),
        );
        toast.error(`${item.original.name}: ${storageError.message}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

      const recorded = await recordMediaAsset({
        filename: optimized.file.name,
        original_filename: item.original.name,
        storage_path: path,
        public_url: publicUrl,
        mime_type: optimized.file.type,
        file_size: optimized.file.size,
        original_file_size: item.original.size,
        width: optimized.stats.width || null,
        height: optimized.stats.height || null,
        format: optimized.stats.format,
        folder,
      });

      if (recorded.status === "error" || !recorded.data) {
        setItems((current) =>
          current.map((row) =>
            row.id === item.id
              ? { ...row, status: "error", error: recorded.message }
              : row,
          ),
        );
        toast.error(`${item.original.name}: ${recorded.message}`);
        continue;
      }

      uploaded.push(recorded.data);
      setItems((current) =>
        current.map((row) => (row.id === item.id ? { ...row, status: "done", progress: 100 } : row)),
      );
    }

    setBusy(false);
    if (uploaded.length > 0) {
      toast.success(
        uploaded.length === 1 ? "Image added to the library." : `${uploaded.length} images added to the library.`,
      );
      onUploaded?.(uploaded);
    }
  }

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${inputId}-folder`}>Folder</Label>
          <select
            id={`${inputId}-folder`}
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={folder}
            onChange={(event) => setFolder(event.target.value as MediaFolder)}
          >
            {MEDIA_FOLDERS.map((value) => (
              <option key={value} value={value}>
                {MEDIA_FOLDER_LABEL[value]}
              </option>
            ))}
          </select>
        </div>
        {items.some((item) => item.status === "ready") ? (
          <Button type="button" onClick={() => void uploadAll()} disabled={busy} className="h-9 px-3">
            <UploadIcon />
            {busy ? "Uploading…" : "Upload optimized files"}
          </Button>
        ) : null}
      </div>

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors",
          dragging
            ? "border-brand bg-brand-muted/40"
            : "border-border bg-surface hover:border-brand/40 hover:bg-brand-muted/20",
          compact && "py-8",
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-brand-muted text-brand">
          <ImagePlusIcon className="size-4" />
        </span>
        <p className="mt-4 text-sm font-medium">Drop images here, or click to browse</p>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
          JPEG, PNG, WebP, AVIF or GIF. Max 10 MB each. Files are resized to 1920px and encoded as WebP in the browser before they leave this machine. GIFs keep their original frames.
        </p>
        <input
          id={inputId}
          type="file"
          accept={MEDIA_ACCEPT}
          multiple
          className="sr-only"
          onChange={(event) => {
            void enqueue(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </label>

      {items.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="grid grid-cols-2 gap-px bg-border">
                <Preview
                  src={item.optimized?.originalPreviewUrl}
                  label="Original"
                  bytes={item.original.size}
                />
                <Preview
                  src={item.optimized?.previewUrl}
                  label="Optimized"
                  bytes={item.optimized?.stats.optimizedBytes}
                />
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium">{item.original.name}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${item.original.name}`}
                    onClick={() => removeItem(item.id)}
                  >
                    <XIcon />
                  </Button>
                </div>
                <StatsLine item={item} />
                <ProgressBar item={item} />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Preview({
  src,
  label,
  bytes,
}: {
  src?: string;
  label: string;
  bytes?: number;
}) {
  return (
    <div className="relative aspect-[4/3] bg-muted">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
          Preparing
        </div>
      )}
      <span className="absolute bottom-1.5 left-1.5 rounded bg-background/85 px-1.5 py-0.5 text-[0.65rem] font-medium">
        {label}
        {typeof bytes === "number" ? ` · ${formatBytes(bytes)}` : ""}
      </span>
    </div>
  );
}

function StatsLine({ item }: { item: UploadItem }) {
  if (item.status === "error") {
    return <p className="text-xs text-destructive">{item.error}</p>;
  }
  if (item.duplicateOf) {
    return <p className="text-xs text-muted-foreground">Already in the library. Reused the existing file.</p>;
  }
  const stats = item.optimized?.stats;
  if (!stats) {
    return <p className="text-xs text-muted-foreground">Measuring and encoding…</p>;
  }
  const dims =
    stats.width && stats.height
      ? `${stats.originalWidth}×${stats.originalHeight} → ${stats.width}×${stats.height}`
      : null;
  return (
    <p className="text-xs text-muted-foreground">
      {formatBytes(stats.originalBytes)} → {formatBytes(stats.optimizedBytes)}
      {stats.savedPercent > 0 ? ` · ${stats.savedPercent.toFixed(1)}% saved` : " · no extra saving"}
      {` · ${stats.format.toUpperCase()}`}
      {dims ? ` · ${dims}` : ""}
      {stats.skipped && stats.skipReason ? ` · ${stats.skipReason}` : ""}
    </p>
  );
}

function ProgressBar({ item }: { item: UploadItem }) {
  const value =
    item.status === "done"
      ? 100
      : item.status === "uploading"
        ? 80
        : item.status === "ready"
          ? 45
          : item.status === "optimizing" || item.status === "queued"
            ? 20
            : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1 overflow-hidden rounded-full bg-muted"
    >
      <div
        className={cn(
          "h-full rounded-full bg-brand transition-[width]",
          item.status === "error" && "bg-destructive",
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
