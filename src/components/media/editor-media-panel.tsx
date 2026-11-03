"use client";

import { useState } from "react";

import { CoverImageField } from "@/components/media/cover-image-field";
import type { MediaAsset } from "@/lib/types/database";

export function EditorMediaPanel() {
  const [cover, setCover] = useState<MediaAsset | null>(null);

  return (
    <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Cover image
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The picker and uploader are ready. The Tiptap body editor in Phase 8
          will reuse this same component for covers and inline figures.
        </p>
      </div>
      <CoverImageField value={cover} onChange={setCover} folder="covers" />
      {cover ? (
        <p className="text-xs text-muted-foreground">
          Selected {cover.original_filename} ({cover.id}). Nothing is saved until
          the article editor can create a post.
        </p>
      ) : null}
    </div>
  );
}
