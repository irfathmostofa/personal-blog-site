import Link from "next/link";

import { SignOutButton } from "@/components/admin/sign-out-button";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import type { StaffSession } from "@/lib/auth";
import { getInitials } from "@/lib/format";

export function AdminChrome({
  session,
  children,
}: {
  session: StaffSession;
  children: React.ReactNode;
}) {
  const initials = getInitials(session.profile.display_name);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Wordmark className="min-w-0" />
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
            <span className="hidden text-xs font-medium tracking-widest text-muted-foreground uppercase sm:inline">
              Newsroom
            </span>
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
              <span className="hidden max-w-[10rem] truncate text-xs font-medium sm:inline">
                {session.profile.display_name}
              </span>
              <Badge
                variant="outline"
                className="hidden h-5 capitalize sm:inline-flex"
              >
                {session.profile.role}
              </Badge>
              <SignOutButton className="h-7 px-2" />
            </div>
          </div>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
