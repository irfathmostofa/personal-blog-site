"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchForm({ defaultQuery = "" }: { defaultQuery?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const q = defaultQuery || params.get("q") || "";

  return (
    <form
      className="flex gap-2"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
      }}
    >
      <Input
        name="q"
        defaultValue={q}
        placeholder="Search titles, excerpts and body copy"
        aria-label="Search articles"
        className="h-11 flex-1"
      />
      <Button type="submit" className="h-11 px-5">
        Search
      </Button>
    </form>
  );
}
