import type { Json } from "@/lib/types/database";
import { slugify } from "@/lib/format";

export type TiptapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
};

export type TocItem = {
  id: string;
  level: 2 | 3;
  text: string;
};

export function asTiptapDoc(value: Json | null | undefined): TiptapNode {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { type: "doc", content: [] };
  }
  const node = value as TiptapNode;
  if (node.type !== "doc") {
    return { type: "doc", content: [node] };
  }
  return { type: "doc", content: node.content ?? [] };
}

export function nodeText(node: TiptapNode | null | undefined): string {
  if (!node) return "";
  if (typeof node.text === "string") return node.text;
  return (node.content ?? []).map(nodeText).join("");
}

export function extractToc(doc: TiptapNode): TocItem[] {
  const used = new Map<string, number>();
  const items: TocItem[] = [];

  for (const node of doc.content ?? []) {
    if (node.type !== "heading") continue;
    const level = Number(node.attrs?.level ?? 2);
    if (level !== 2 && level !== 3) continue;
    const text = nodeText(node).trim();
    if (!text) continue;
    const base = slugify(text) || "section";
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;
    items.push({ id, level, text });
  }

  return items;
}

export function headingIdFor(node: TiptapNode, seen: Map<string, number>): string {
  const text = nodeText(node).trim();
  const base = slugify(text) || "section";
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

export const EMPTY_DOC: TiptapNode = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function isEmptyDoc(doc: TiptapNode | null | undefined): boolean {
  const text = nodeText(doc).trim();
  if (text.length > 0) return false;
  return !(doc?.content ?? []).some((node) => node.type === "image" || node.type === "table" || node.type === "horizontalRule");
}

export function contentStats(doc: TiptapNode | null | undefined): {
  word_count: number;
  reading_time_minutes: number;
} {
  const words = nodeText(doc)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return {
    word_count: words,
    reading_time_minutes: words === 0 ? 0 : Math.max(1, Math.round(words / 220)),
  };
}
