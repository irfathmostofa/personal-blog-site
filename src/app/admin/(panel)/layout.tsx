import { Suspense } from "react";

import { AdminChrome } from "@/components/admin/admin-chrome";
import { AdminShellSkeleton } from "@/components/admin/login-skeleton";
import { requireStaff } from "@/lib/auth";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <PanelGate>{children}</PanelGate>
    </Suspense>
  );
}

async function PanelGate({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  return <AdminChrome session={session}>{children}</AdminChrome>;
}
