"use client";

import { useState, useTransition } from "react";
import { CopyIcon, ExternalLinkIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MEDIA_FOLDER_LABEL } from "@/lib/media/constants";
import { updateMediaAsset } from "@/lib/actions/media";
import type { MediaAsset } from "@/lib/types/database";
import { formatBytes, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MediaDetail({
  asset,
  onUpdated,
  onRequestDelete,
  onSelect,
  selectLabel = "Use this image",
}: {
  asset: MediaAsset;
  onUpdated?: (asset: MediaAsset) => void;
  onRequestDelete?: (asset: MediaAsset) => void;
  onSelect?: (asset: MediaAsset) => void;
  selectLabel?: string;
}) {
  const [alt, setAlt] = useState(asset.alt_text ?? "");
  const [caption, setCaption] = useState(asset.caption ?? "");
  const [pending, startTransition] = useTransition();
  const saved = Math.max(0, asset.original_file_size - asset.file_size);
  const savedPercent =
    asset.original_file_size > 0 ? (saved / asset.original_file_size) * 100 : 0;

  function save() {
    startTransition(async () => {
      const result = await updateMediaAsset({
        id: asset.id,
        alt_text: alt.trim() || null,
        caption: caption.trim() || null,
      });
      if (result.status === "error" || !result.data) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      onUpdated?.(result.data);
    });
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(asset.public_url);
      toast.success("Image URL copied.");
    } catch {
      toast.error("The URL could not be copied.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="overflow-hidden rounded-xl border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.public_url}
          alt={asset.alt_text || asset.original_filename}
          className="mx-auto max-h-[28rem] w-full object-contain"
        />
      </div>
      <div className="space-y-5">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            {asset.original_filename}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {MEDIA_FOLDER_LABEL[asset.folder]} · {asset.format.toUpperCase()} ·{" "}
            {asset.width && asset.height ? `${asset.width}×${asset.height}` : "unknown size"} ·{" "}
            {formatDate(asset.created_at)}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Original" value={formatBytes(asset.original_file_size)} />
          <Stat label="Stored" value={formatBytes(asset.file_size)} />
          <Stat
            label="Saved"
            value={savedPercent > 0 ? `${savedPercent.toFixed(1)}%` : "none"}
          />
          <Stat label="Type" value={asset.mime_type} />
        </dl>

        <div className="space-y-2">
          <Label htmlFor="media-alt">Alternative text</Label>
          <Input
            id="media-alt"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            maxLength={300}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="media-caption">Caption</Label>
          <Textarea
            id="media-caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={500}
            rows={3}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={save} disabled={pending} className="h-9 px-3">
            {pending ? "Saving…" : "Save details"}
          </Button>
          {onSelect ? (
            <Button type="button" variant="secondary" className="h-9 px-3" onClick={() => onSelect(asset)}>
              {selectLabel}
            </Button>
          ) : null}
          <Button type="button" variant="outline" className="h-9 px-3" onClick={() => void copyUrl()}>
            <CopyIcon />
            Copy URL
          </Button>
          <a
            href={asset.public_url}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline" }), "h-9 px-3")}
          >
            <ExternalLinkIcon />
            Open
          </a>
          {onRequestDelete ? (
            <Button
              type="button"
              variant="destructive"
              className="h-9 px-3"
              onClick={() => onRequestDelete(asset)}
            >
              <Trash2Icon />
              Delete
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <dt className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 truncate">{value}</dd>
    </div>
  );
}
