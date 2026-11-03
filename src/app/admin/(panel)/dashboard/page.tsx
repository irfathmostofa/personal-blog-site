import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardView } from "@/components/admin/dashboard-view";
import { AdminShellSkeleton } from "@/components/admin/login-skeleton";
import { getDashboardStats } from "@/lib/admin/stats";
import { requireStaff } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Dashboard",
  description: "Staff newsroom for The Quiet Ledger.",
  path: "/admin/dashboard",
  noIndex: true,
});

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <DashboardBody />
    </Suspense>
  );
}

function greetingFor(name: string) {
  const first = name.split(/\s+/)[0] || "there";
  return `Welcome back, ${first}`;
}

async function DashboardBody() {
  const session = await requireStaff("/admin/dashboard");
  const stats = await getDashboardStats();

  return (
    <DashboardView
      stats={stats}
      greeting={greetingFor(session.profile.display_name)}
    />
  );
}
