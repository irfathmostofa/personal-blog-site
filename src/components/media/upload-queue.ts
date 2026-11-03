"use client";

import { MEDIA_MAX_FILES } from "@/lib/media/constants";
import { optimizeImage, validateImageFile, type OptimizedImage } from "@/lib/media/optimize";
import type { OptimizeStats } from "@/lib/media/types";

export type UploadStatus =
  | "queued"
  | "optimizing"
  | "ready"
  | "uploading"
  | "done"
  | "error"
  | "cancelled";

export type UploadItem = {
  id: string;
  original: File;
  optimized: OptimizedImage | null;
  status: UploadStatus;
  progress: number;
  error: string | null;
  duplicateOf?: { id: string; public_url: string };
  controller: AbortController;
};

export function createUploadItems(
  files: File[],
  alreadyQueued = 0,
): { items: UploadItem[]; rejected: string[] } {
  const rejected: string[] = [];
  const accepted: File[] = [];
  const remaining = Math.max(0, MEDIA_MAX_FILES - alreadyQueued);

  if (remaining === 0) {
    return { items: [], rejected: [`Only ${MEDIA_MAX_FILES} images can be queued at once.`] };
  }

  for (const file of files.slice(0, remaining)) {
    const reason = validateImageFile(file);
    if (reason) rejected.push(reason);
    else accepted.push(file);
  }

  if (files.length > remaining) {
    rejected.push(`Only ${MEDIA_MAX_FILES} images can be queued at once.`);
  }

  const items = accepted.map((file) => ({
    id: crypto.randomUUID(),
    original: file,
    optimized: null,
    status: "queued" as const,
    progress: 0,
    error: null,
    controller: new AbortController(),
  }));

  return { items, rejected };
}

export async function runOptimize(item: UploadItem): Promise<UploadItem> {
  if (item.controller.signal.aborted) {
    return { ...item, status: "cancelled" };
  }

  try {
    const optimized = await optimizeImage(item.original, {
      signal: item.controller.signal,
      onProgress: () => undefined,
    });
    return {
      ...item,
      optimized,
      status: "ready",
      progress: 40,
    };
  } catch (cause) {
    if (item.controller.signal.aborted) {
      return { ...item, status: "cancelled" };
    }
    const message = cause instanceof Error ? cause.message : "Optimization failed.";
    return { ...item, status: "error", error: message };
  }
}

export function statsFor(item: UploadItem): OptimizeStats | null {
  return item.optimized?.stats ?? null;
}
