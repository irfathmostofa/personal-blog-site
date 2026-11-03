"use client";

import { useCallback, useState } from "react";

import { AdminSidebar, AdminTopbar } from "@/components/admin/admin-sidebar";
import type { StaffSession } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

export function AdminShell({
  session,
  children,
}: {
  session: StaffSession;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const onToggle = useCallback(() => setCollapsed((value) => !value), []);

  return (
    <div className="flex min-h-svh flex-1 bg-surface">
      <AdminSidebar
        session={session}
        collapsed={collapsed}
        onToggle={onToggle}
      />
      <div className={cn("flex min-w-0 flex-1 flex-col")}>
        <AdminTopbar session={session} />
        <main id="main" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
