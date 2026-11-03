import { Skeleton } from "@/components/ui/skeleton";

export function LoginSkeleton() {
  return (
    <div className="grid min-h-full flex-1 lg:grid-cols-2">
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
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <div className="h-14 border-b border-border bg-background" />
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-4 w-80" />
        <Skeleton className="mt-10 h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
