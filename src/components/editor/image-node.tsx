"use client";

import { useState, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ImageIcon,
  Trash2Icon,
} from "lucide-react";

import { ImagePicker } from "@/components/media/image-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MediaAsset } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export function attrsFromAsset(asset: MediaAsset) {
  return {
    src: asset.public_url,
    alt: asset.alt_text ?? "",
    title: asset.original_filename,
    caption: asset.caption ?? "",
    width: asset.width ?? 1200,
    height: asset.height ?? 675,
    align: "center",
    mediaId: asset.id,
  };
}

export function insertAssets(editor: Editor, assets: MediaAsset[]) {
  if (assets.length === 0) return;
  editor
    .chain()
    .focus()
    .insertContent(assets.map((asset) => ({ type: "image", attrs: attrsFromAsset(asset) })))
    .run();
}

export function ImageNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: ReactNodeViewProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const src = String(node.attrs.src ?? "");
  const alt = String(node.attrs.alt ?? "");
  const caption = String(node.attrs.caption ?? "");
  const align = String(node.attrs.align ?? "center");
  const width = Number(node.attrs.width ?? 720) || 720;
  const height = Number(node.attrs.height ?? 405) || 405;

  return (
    <NodeViewWrapper
      as="figure"
      data-align={align}
      className={cn(
        "article-image group relative my-8 max-w-full",
        align === "left" && "ml-0 mr-auto",
        align === "right" && "ml-auto mr-0",
        align === "center" && "mx-auto",
        selected && "ring-2 ring-brand/40 ring-offset-2 ring-offset-background",
      )}
      style={{ width: Math.min(Math.max(width, 160), 720) }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full rounded-xl border border-border"
        draggable={false}
      />
      {selected ? (
        <div className="absolute inset-x-2 top-2 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card/95 p-1 shadow-sm">
          <Tool
            label="Align left"
            active={align === "left"}
            onClick={() => updateAttributes({ align: "left" })}
          >
            <AlignLeftIcon />
          </Tool>
          <Tool
            label="Align center"
            active={align === "center"}
            onClick={() => updateAttributes({ align: "center" })}
          >
            <AlignCenterIcon />
          </Tool>
          <Tool
            label="Align right"
            active={align === "right"}
            onClick={() => updateAttributes({ align: "right" })}
          >
            <AlignRightIcon />
          </Tool>
          <label className="ml-1 flex items-center gap-1 px-1 text-[0.7rem] text-muted-foreground">
            Width
            <input
              type="range"
              min={240}
              max={720}
              value={Math.min(width, 720)}
              onChange={(event) => {
                const next = Number(event.target.value);
                const ratio = height / (width || 1);
                updateAttributes({
                  width: next,
                  height: Math.round(next * ratio),
                });
              }}
            />
          </label>
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => setPickerOpen(true)}
          >
            <ImageIcon />
            Replace
          </Button>
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => window.open(src, "_blank", "noreferrer")}
          >
            Preview
          </Button>
          <Button
            type="button"
            size="xs"
            variant="destructive"
            onClick={() => deleteNode()}
          >
            <Trash2Icon />
            Remove
          </Button>
        </div>
      ) : null}
      <figcaption className="mt-3">
        <Input
          value={caption}
          placeholder="Caption"
          aria-label="Image caption"
          className="h-8 border-transparent bg-transparent text-center text-sm text-muted-foreground"
          onChange={(event) => updateAttributes({ caption: event.target.value })}
        />
      </figcaption>
      {selected ? (
        <div className="mt-2 space-y-1">
          <Label htmlFor={`alt-${src}`} className="text-xs text-muted-foreground">
            Alternative text
          </Label>
          <Input
            id={`alt-${src}`}
            value={alt}
            placeholder="Describe the image"
            className="h-8"
            onChange={(event) => updateAttributes({ alt: event.target.value })}
          />
        </div>
      ) : null}
      <ImagePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        folder="articles"
        title="Replace image"
        onConfirm={(selection) => {
          const asset = Array.isArray(selection) ? selection[0] : selection;
          if (asset) updateAttributes(attrsFromAsset(asset));
        }}
      />
    </NodeViewWrapper>
  );
}

function Tool({
  children,
  label,
  active,
  onClick,
}: {
  children: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="icon-xs"
      variant={active ? "secondary" : "ghost"}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
