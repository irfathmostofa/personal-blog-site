import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { SignOutButton } from "@/components/admin/sign-out-button";
import { AdminShellSkeleton } from "@/components/admin/login-skeleton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

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

async function DashboardBody() {
  const session = await requireStaff("/admin/dashboard");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-semibold tracking-widest text-brand uppercase">
        Newsroom
      </p>
      <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">
        Signed in
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Authentication and server-side role checks are live. Statistics, the
        publishing sidebar, and content tools arrive in Phase 6.
      </p>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              {session.profile.display_name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{session.email}</p>
          </div>
          <Badge variant="outline" className="h-6 capitalize">
            {session.profile.role}
          </Badge>
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs tracking-widest text-muted-foreground uppercase">
              Role
            </dt>
            <dd className="mt-1 capitalize">{session.profile.role}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-widest text-muted-foreground uppercase">
              Profile slug
            </dt>
            <dd className="mt-1 font-mono text-xs">{session.profile.slug}</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Authorization is enforced on the server for every protected route and
          mutation. Route-level UI is not treated as protection. Ordinary
          authenticated users without a staff profile cannot enter.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-9 px-3")}
          >
            View publication
          </Link>
          <SignOutButton className="h-9 px-3" />
        </div>
      </section>
    </div>
  );
}
