"use client";

import imageCompression from "browser-image-compression";

import {
  MEDIA_ALLOWED_TYPES,
  MEDIA_MAX_INPUT_BYTES,
  MEDIA_OPTIMIZE,
  MEDIA_SKIP_REENCODE,
} from "@/lib/media/constants";
import type { OptimizeStats } from "@/lib/media/types";
import { extensionForMime, replaceExtension } from "@/lib/media/filename";

export type OptimizedImage = {
  file: File;
  previewUrl: string;
  originalPreviewUrl: string;
  stats: OptimizeStats;
};

function percentSaved(original: number, optimized: number): number {
  if (original <= 0) return 0;
  return Math.max(0, ((original - optimized) / original) * 100);
}

function isAllowedType(type: string): type is (typeof MEDIA_ALLOWED_TYPES)[number] {
  return (MEDIA_ALLOWED_TYPES as readonly string[]).includes(type);
}

export function validateImageFile(file: File): string | null {
  if (!isAllowedType(file.type)) {
    return `${file.name} is not a supported image. Use JPEG, PNG, WebP, AVIF or GIF.`;
  }
  if (file.size <= 0) {
    return `${file.name} is empty.`;
  }
  if (file.size > MEDIA_MAX_INPUT_BYTES) {
    return `${file.name} is larger than 10 MB.`;
  }
  return null;
}

export async function readImageSize(file: File): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  }

  const url = URL.createObjectURL(file);
  try {
    const size = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("Could not read image dimensions."));
      image.src = url;
    });
    return size;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function outputFilename(originalName: string, mime: string): string {
  return replaceExtension(originalName, extensionForMime(mime, originalName));
}

export async function optimizeImage(
  file: File,
  options?: {
    signal?: AbortSignal;
    onProgress?: (progress: number) => void;
    maxWidthOrHeight?: number;
    quality?: number;
  },
): Promise<OptimizedImage> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  const originalPreviewUrl = URL.createObjectURL(file);
  const originalSize = await readImageSize(file).catch(() => ({ width: 0, height: 0 }));

  if (MEDIA_SKIP_REENCODE.has(file.type)) {
    return {
      file,
      previewUrl: originalPreviewUrl,
      originalPreviewUrl,
      stats: {
        originalBytes: file.size,
        optimizedBytes: file.size,
        savedPercent: 0,
        originalWidth: originalSize.width,
        originalHeight: originalSize.height,
        width: originalSize.width,
        height: originalSize.height,
        format: extensionForMime(file.type, file.name),
        mimeType: file.type,
        skipped: true,
        skipReason: "Animated GIF is stored as-is so frames stay intact.",
      },
    };
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: MEDIA_OPTIMIZE.maxSizeMB,
      maxWidthOrHeight: options?.maxWidthOrHeight ?? MEDIA_OPTIMIZE.maxWidthOrHeight,
      initialQuality: options?.quality ?? MEDIA_OPTIMIZE.quality,
      fileType: MEDIA_OPTIMIZE.outputType,
      useWebWorker: false,
      preserveExif: false,
      alwaysKeepResolution: false,
      signal: options?.signal,
      onProgress: options?.onProgress,
    });

    const keepOriginal = compressed.size >= file.size && compressed.type === file.type;
    const output = keepOriginal ? file : compressed;
    const outputSize = await readImageSize(output).catch(() => originalSize);
    const mime = output.type || (keepOriginal ? file.type : MEDIA_OPTIMIZE.outputType);
    const named = new File([output], outputFilename(file.name, mime), {
      type: mime,
      lastModified: Date.now(),
    });

    return {
      file: named,
      previewUrl: URL.createObjectURL(named),
      originalPreviewUrl,
      stats: {
        originalBytes: file.size,
        optimizedBytes: named.size,
        savedPercent: percentSaved(file.size, named.size),
        originalWidth: originalSize.width,
        originalHeight: originalSize.height,
        width: outputSize.width,
        height: outputSize.height,
        format: extensionForMime(mime, named.name),
        mimeType: mime,
        skipped: keepOriginal,
        skipReason: keepOriginal
          ? "The original file was already smaller than the WebP result, so it was kept."
          : undefined,
      },
    };
  } catch (cause) {
    if (options?.signal?.aborted) throw cause;
    const named = new File([file], file.name, { type: file.type, lastModified: file.lastModified });
    return {
      file: named,
      previewUrl: originalPreviewUrl,
      originalPreviewUrl,
      stats: {
        originalBytes: file.size,
        optimizedBytes: file.size,
        savedPercent: 0,
        originalWidth: originalSize.width,
        originalHeight: originalSize.height,
        width: originalSize.width,
        height: originalSize.height,
        format: extensionForMime(file.type, file.name),
        mimeType: file.type,
        skipped: true,
        skipReason: "The browser could not re-encode this file, so the original was kept.",
      },
    };
  }
}

export function revokeOptimized(image: OptimizedImage) {
  URL.revokeObjectURL(image.previewUrl);
  if (image.previewUrl !== image.originalPreviewUrl) {
    URL.revokeObjectURL(image.originalPreviewUrl);
  }
}
