"use client";

import { useState } from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";

import { ImagePicker } from "@/components/media/image-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { MediaAsset, MediaFolder } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export function CoverImageField({
  label = "Cover image",
  value,
  folder = "covers",
  onChange,
}: {
  label?: string;
  value: MediaAsset | null;
  folder?: MediaFolder;
  onChange: (asset: MediaAsset | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="relative aspect-[16/9] bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.public_url}
              alt={value.alt_text || value.original_filename}
              className="size-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <p className="truncate text-sm">{value.original_filename}</p>
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove image"
                onClick={() => onChange(null)}
              >
                <XIcon />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center transition-colors hover:border-brand/40 hover:bg-brand-muted/20",
          )}
        >
          <ImagePlusIcon className="size-5 text-brand" />
          <span className="mt-2 text-sm font-medium">Select from the library</span>
          <span className="mt-1 text-xs text-muted-foreground">
            Upload a new file or reuse one that is already optimized.
          </span>
        </button>
      )}
      <ImagePicker
        open={open}
        onOpenChange={setOpen}
        folder={folder}
        title={label}
        onConfirm={(selection) => {
          const asset = Array.isArray(selection) ? selection[0] : selection;
          if (asset) onChange(asset);
        }}
      />
    </div>
  );
}
