"use client";

import { CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MEDIA_FOLDER_LABEL } from "@/lib/media/constants";
import type { MediaAsset } from "@/lib/types/database";
import { formatBytes, formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MediaCard({
  asset,
  selected = false,
  onSelect,
}: {
  asset: MediaAsset;
  selected?: boolean;
  onSelect?: (asset: MediaAsset) => void;
}) {
  const alt = asset.alt_text || asset.original_filename;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(asset)}
      aria-pressed={selected}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card text-left ring-offset-background transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
        selected ? "border-brand ring-2 ring-brand/30" : "border-border hover:border-brand/40",
      )}
    >
      <div className="relative aspect-[4/3] bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.public_url}
          alt={alt}
          width={asset.width ?? 800}
          height={asset.height ?? 600}
          className="size-full object-cover"
          loading="lazy"
        />
        {selected ? (
          <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-brand text-brand-foreground">
            <CheckIcon className="size-3.5" />
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-3">
        <p className="truncate text-sm font-medium">{asset.original_filename}</p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(asset.file_size)}
          {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
          {` · ${asset.format.toUpperCase()}`}
        </p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Badge variant="outline" className="h-5 px-1.5 text-[0.65rem] uppercase">
            {MEDIA_FOLDER_LABEL[asset.folder]}
          </Badge>
          <span className="text-[0.65rem] text-muted-foreground">
            {formatRelativeDate(asset.created_at)}
          </span>
        </div>
      </div>
    </button>
  );
}
