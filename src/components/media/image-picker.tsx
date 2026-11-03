"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ImagesIcon } from "lucide-react";

import { ImageUploader } from "@/components/media/image-uploader";
import { MediaCard } from "@/components/media/media-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchMediaLibrary } from "@/lib/actions/media";
import { MEDIA_FOLDER_LABEL, MEDIA_FOLDERS } from "@/lib/media/constants";
import type { MediaFolder } from "@/lib/types/database";
import type { MediaAsset } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export type ImagePickerSelection = MediaAsset | MediaAsset[];

type ImagePickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  multiple?: boolean;
  folder?: MediaFolder | "";
  title?: string;
  description?: string;
  onConfirm: (selection: ImagePickerSelection) => void;
  initialItems?: MediaAsset[];
};

export function ImagePicker({
  open,
  onOpenChange,
  multiple = false,
  folder = "",
  title = "Select image",
  description = "Choose an existing file or upload a new one. New uploads use the same optimization pipeline as the library.",
  onConfirm,
  initialItems = [],
}: ImagePickerProps) {
  const [items, setItems] = useState<MediaAsset[]>(initialItems);
  const [selected, setSelected] = useState<MediaAsset[]>([]);
  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState<MediaFolder | "">(folder || "");
  const [pending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(initialItems.length > 0);

  function load(nextQuery = query, nextFolder = folderFilter) {
    startTransition(async () => {
      const result = await searchMediaLibrary({
        page: 1,
        perPage: 48,
        q: nextQuery,
        folder: nextFolder,
        sort: "newest",
      });
      setItems(result.data.items);
      setLoaded(true);
    });
  }

  useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      const result = await searchMediaLibrary({
        page: 1,
        perPage: 48,
        q: "",
        folder,
        sort: "newest",
      });
      setItems(result.data.items);
      setLoaded(true);
    });
  }, [open, folder]);

  function handleOpen(next: boolean) {
    if (!next) setSelected([]);
    onOpenChange(next);
  }

  function toggle(asset: MediaAsset) {
    setSelected((current) => {
      const exists = current.some((item) => item.id === asset.id);
      if (multiple) {
        return exists ? current.filter((item) => item.id !== asset.id) : [...current, asset];
      }
      return exists ? [] : [asset];
    });
  }

  const selectedIds = useMemo(() => new Set(selected.map((item) => item.id)), [selected]);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ImageUploader
          compact
          defaultFolder={folderFilter || "articles"}
          onUploaded={(assets) => {
            setItems((current) => [...assets, ...current]);
            setSelected((current) =>
              multiple ? [...current, ...assets] : assets.slice(0, 1),
            );
          }}
        />

        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            load();
          }}
        >
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the library"
            aria-label="Search the library"
            className="h-9 flex-1"
          />
          <select
            aria-label="Filter by folder"
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={folderFilter}
            onChange={(event) => setFolderFilter(event.target.value as MediaFolder | "")}
          >
            <option value="">All folders</option>
            {MEDIA_FOLDERS.map((value) => (
              <option key={value} value={value}>
                {MEDIA_FOLDER_LABEL[value]}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline" className="h-9 px-3" disabled={pending}>
            {pending ? "Searching…" : "Search"}
          </Button>
        </form>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <ImagesIcon className="size-5 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                {loaded ? "No matching images." : "Open the picker to load the library."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((asset) => (
                <MediaCard
                  key={asset.id}
                  asset={asset}
                  selected={selectedIds.has(asset.id)}
                  onSelect={toggle}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter className={cn("mt-2")}>
          <Button type="button" variant="outline" onClick={() => handleOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={selected.length === 0}
            onClick={() => {
              if (selected.length === 0) return;
              onConfirm(multiple ? selected : selected[0]);
              handleOpen(false);
            }}
          >
            {multiple
              ? `Use ${selected.length || ""} ${selected.length === 1 ? "image" : "images"}`.trim()
              : "Use selected image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ImagePickerTrigger({
  onConfirm,
  multiple = false,
  folder = "",
  label = "Select image",
}: {
  onConfirm: (selection: ImagePickerSelection) => void;
  multiple?: boolean;
  folder?: MediaFolder | "";
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" className="h-9 px-3" onClick={() => setOpen(true)}>
        <ImagesIcon />
        {label}
      </Button>
      <ImagePicker
        open={open}
        onOpenChange={setOpen}
        multiple={multiple}
        folder={folder}
        onConfirm={onConfirm}
      />
    </>
  );
}
