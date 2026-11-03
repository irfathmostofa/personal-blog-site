"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { MEDIA_FOLDER_LABEL, MEDIA_FOLDERS } from "@/lib/media/constants";
import type { MediaSort } from "@/lib/media/types";

export function MediaToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const folder = params.get("folder") ?? "";
  const sort = (params.get("sort") as MediaSort) || "newest";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <form
      className="flex flex-col gap-3 lg:flex-row lg:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setParam("q", String(form.get("q") ?? "").trim());
      }}
    >
      <Input
        name="q"
        defaultValue={q}
        placeholder="Search filenames, alt text, captions"
        aria-label="Search media"
        className="h-10 flex-1"
      />
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Filter by folder"
          className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={folder}
          onChange={(event) => setParam("folder", event.target.value)}
        >
          <option value="">All folders</option>
          {MEDIA_FOLDERS.map((value) => (
            <option key={value} value={value}>
              {MEDIA_FOLDER_LABEL[value]}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort media"
          className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={sort}
          onChange={(event) => setParam("sort", event.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="largest">Largest</option>
          <option value="smallest">Smallest</option>
          <option value="name">Name</option>
        </select>
      </div>
    </form>
  );
}
