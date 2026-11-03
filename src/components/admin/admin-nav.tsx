"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartLineIcon,
  FileTextIcon,
  FolderTreeIcon,
  ImagesIcon,
  LayoutDashboardIcon,
  MailIcon,
  MessageSquareIcon,
  PenLineIcon,
  SettingsIcon,
  TagsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { ADMIN_NAV, ADMIN_NAV_PHASE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<(typeof ADMIN_NAV)[number]["icon"], LucideIcon> = {
  LayoutDashboard: LayoutDashboardIcon,
  FileText: FileTextIcon,
  PenLine: PenLineIcon,
  FolderTree: FolderTreeIcon,
  Tags: TagsIcon,
  Images: ImagesIcon,
  MessageSquare: MessageSquareIcon,
  Users: UsersIcon,
  Mail: MailIcon,
  ChartLine: ChartLineIcon,
  Settings: SettingsIcon,
};

function isActive(pathname: string, href: string) {
  if (href === "/admin/dashboard") return pathname === href;
  if (href === "/admin/posts/new") return pathname === href;
  if (href === "/admin/posts") {
    return pathname === href || (pathname.startsWith("/admin/posts/") && pathname !== "/admin/posts/new");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Newsroom" className="flex flex-col gap-0.5 px-2">
      {ADMIN_NAV.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActive(pathname, item.href);
        const ready =
          item.href === "/admin/dashboard" ||
          item.href === "/admin/media" ||
          item.href === "/admin/categories" ||
          item.href === "/admin/tags" ||
          item.href === "/admin/comments" ||
          item.href === "/admin/subscribers" ||
          item.href === "/admin/messages" ||
          item.href === "/admin/analytics" ||
          item.href === "/admin/settings";
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
              collapsed && "justify-center px-0",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {collapsed ? (
              <span className="sr-only">{item.label}</span>
            ) : (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {ready ? null : (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
                    {ADMIN_NAV_PHASE[item.href]}
                  </span>
                )}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
