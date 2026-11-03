"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

export function AdminFilterBar({
  placeholder,
  selects,
}: {
  placeholder: string;
  selects?: Array<{
    name: string;
    label: string;
    fallback?: string;
    options: Array<{ value: string; label: string }>;
  }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const q = params.get("q") ?? "";

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
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 flex-1"
      />
      {selects && selects.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {selects.map((select) => (
            <select
              key={select.name}
              aria-label={select.label}
              className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={params.get(select.name) ?? select.fallback ?? ""}
              onChange={(event) => setParam(select.name, event.target.value)}
            >
              {select.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      ) : null}
    </form>
  );
}
