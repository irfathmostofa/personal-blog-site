import type { MediaAsset, MediaFolder } from "@/lib/types/database";

export type MediaSort = "newest" | "oldest" | "largest" | "smallest" | "name";

export type MediaListQuery = {
  page?: number;
  perPage?: number;
  q?: string;
  folder?: MediaFolder | "";
  sort?: MediaSort;
};

export type MediaListResult = {
  items: MediaAsset[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

export type MediaUsageRef = {
  kind: "post-cover" | "post-og" | "post-body" | "category" | "profile" | "settings";
  id: string;
  label: string;
  href?: string;
  extra?: string;
};

export type MediaUsage = {
  assetId: string;
  refs: MediaUsageRef[];
};

export type MediaActionResult<T = undefined> =
  | { status: "success"; message: string; data: T }
  | { status: "error"; message: string };

export type OptimizeStats = {
  originalBytes: number;
  optimizedBytes: number;
  savedPercent: number;
  originalWidth: number;
  originalHeight: number;
  width: number;
  height: number;
  format: string;
  mimeType: string;
  skipped: boolean;
  skipReason?: string;
};
