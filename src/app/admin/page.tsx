import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { LoginSkeleton } from "@/components/admin/login-skeleton";
import { Wordmark } from "@/components/brand/wordmark";
import { getStaffSession, safeAdminNext } from "@/lib/auth";
import { SITE } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { firstParam } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
  description: "Staff sign-in for The Quiet Ledger newsroom.",
  path: "/admin",
  noIndex: true,
});

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginGate searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginGate({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const next = safeAdminNext(firstParam(params.next));
  const session = await getStaffSession();

  if (session) {
    redirect(next);
  }

  return (
    <div className="grid min-h-svh flex-1 lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-foreground px-12 py-12 text-background lg:flex">
        <Wordmark className="text-background" />
        <div className="max-w-sm">
          <p className="font-heading text-4xl leading-tight font-semibold tracking-tight">
            The newsroom stays quiet on purpose.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-background/70">
            {SITE.tagline} Access is limited to provisioned editors. There is no
            public registration.
          </p>
        </div>
        <p className="text-xs tracking-widest text-background/50 uppercase">
          Staff only
        </p>
      </aside>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Wordmark />
          </div>
          <p className="text-xs font-semibold tracking-widest text-brand uppercase">
            Newsroom
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            Sign in
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Use the email and password issued for your staff account.
          </p>
          <div className="mt-8">
            <LoginForm next={next} configured={isSupabaseConfigured()} />
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:underline">
              Back to the publication
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
