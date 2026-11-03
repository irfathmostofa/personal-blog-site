"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";

import { ADMIN_NAV } from "@/lib/constants";

const LABELS: Record<string, string> = {
  ...Object.fromEntries(ADMIN_NAV.map((item) => [item.href, item.label])),
};

function crumbsFor(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const items: { href: string; label: string }[] = [];
  let href = "";
  for (const part of parts) {
    href += `/${part}`;
    if (href === "/admin") continue;
    items.push({
      href,
      label: LABELS[href] ?? part.replace(/-/g, " "),
    });
  }
  return items;
}

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname);
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 md:flex">
      {crumbs.map((crumb, index) => {
        const last = index === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex min-w-0 items-center gap-1">
            {index > 0 ? (
              <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            ) : null}
            {last ? (
              <span className="truncate text-sm font-medium capitalize">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="truncate text-sm text-muted-foreground capitalize hover:text-foreground"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
