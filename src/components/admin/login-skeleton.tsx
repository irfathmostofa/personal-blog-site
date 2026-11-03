import { Skeleton } from "@/components/ui/skeleton";

export function LoginSkeleton() {
  return (
    <div className="grid min-h-svh flex-1 lg:grid-cols-2">
      <div className="hidden bg-foreground lg:block" />
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm space-y-5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="flex min-h-svh flex-1 bg-surface">
      <div className="hidden h-svh w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:block" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-14 border-b border-border bg-background" />
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-3 h-4 w-80" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
