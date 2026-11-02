import { Skeleton } from "@/components/ui/skeleton";

export function ArticleCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[16/10] w-full rounded-xl" />
      <Skeleton className="mt-4 h-3 w-32" />
      <Skeleton className="mt-3 h-6 w-5/6" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
  );
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <ArticleCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function HomepageSkeleton() {
  return (
    <div className="container-editorial py-16">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-6 h-16 w-full" />
          <Skeleton className="mt-4 h-16 w-4/5" />
        </div>
        <Skeleton className="aspect-[16/11] w-full rounded-2xl" />
      </div>
      <div className="mt-16">
        <ArticleGridSkeleton />
      </div>
    </div>
  );
}
