import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminSettings } from "@/lib/admin/settings";
import { getStaffSession, requireStaff } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Settings",
  description: "Publication settings.",
  path: "/admin/settings",
  noIndex: true,
});

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <AdminPageHeader
        eyebrow="Publication"
        title="Settings"
        description="Site identity, SEO defaults, comments, appearance, newsletter and analytics switches. Administrators can save."
      />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
          <SettingsBody />
        </Suspense>
      </div>
    </div>
  );
}

async function SettingsBody() {
  await requireStaff("/admin/settings");
  const [data, session] = await Promise.all([getAdminSettings(), getStaffSession()]);
  return (
    <SettingsForm data={data} canEdit={session?.profile.role === "admin"} />
  );
}
