"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, PanelLeftIcon } from "lucide-react";

import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { AdminNav } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { StaffSession } from "@/lib/auth/types";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AdminSidebar({
  session,
  collapsed,
  onToggle,
}: {
  session: StaffSession;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const initials = getInitials(session.profile.display_name);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex",
        collapsed ? "w-[4.25rem]" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-2",
          collapsed ? "justify-center" : "justify-between gap-1 pl-3",
        )}
      >
        {collapsed ? null : (
          <Wordmark className="min-w-0 origin-left scale-90" />
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
        >
          <PanelLeftIcon className="size-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-3">
        <AdminNav collapsed={collapsed} />
      </div>
      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed && "flex-col",
          )}
        >
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-muted text-[0.7rem] font-semibold text-brand"
          >
            {initials || "QL"}
          </span>
          {collapsed ? (
            <span className="sr-only">
              {session.profile.display_name}, {session.profile.role}
            </span>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {session.profile.display_name}
              </p>
              <p className="truncate text-xs capitalize text-muted-foreground">
                {session.profile.role}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export function AdminTopbar({ session }: { session: StaffSession }) {
  const [open, setOpen] = useState(false);
  const initials = getInitials(session.profile.display_name);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/90 px-3 backdrop-blur-md sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-lg md:hidden",
              "hover:bg-muted",
            )}
            aria-label="Open navigation"
          >
            <MenuIcon className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 md:hidden" showCloseButton>
            <SheetHeader className="border-b border-border">
              <SheetTitle className="sr-only">Newsroom navigation</SheetTitle>
              <Wordmark />
            </SheetHeader>
            <div className="py-3">
              <AdminNav onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <span className="truncate text-sm font-medium md:hidden">Newsroom</span>
        <AdminBreadcrumb />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/"
          className="hidden rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline"
        >
          View site
        </Link>
        <ThemeToggle />
        <div className="flex items-center gap-2 rounded-full border border-border bg-card py-0.5 pr-1 pl-0.5">
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-full bg-brand-muted text-[0.65rem] font-semibold tracking-wide text-brand"
          >
            {initials || "QL"}
          </span>
          <span className="hidden max-w-[9rem] truncate text-xs font-medium sm:inline">
            {session.profile.display_name}
          </span>
          <Badge variant="outline" className="hidden h-5 capitalize sm:inline-flex">
            {session.profile.role}
          </Badge>
          <SignOutButton className="h-7 px-2" />
        </div>
      </div>
    </header>
  );
}
