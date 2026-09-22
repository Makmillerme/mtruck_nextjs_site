import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Lab #states card skeleton — shared canon. */
export function LoadingCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-sm border border-border p-6",
        className
      )}
    >
      <Skeleton className="h-40 w-full rounded-sm" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-11 w-32" />
    </div>
  );
}

/** Catalog / home grid of card skeletons. */
export function LoadingCatalogGrid({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <LoadingCardSkeleton key={index} className="p-0 overflow-hidden" />
      ))}
    </div>
  );
}

/** Vehicle-card shaped skeleton (aspect media + body). */
export function LoadingProductCard() {
  return (
    <article className="overflow-hidden rounded-sm border border-border bg-background">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-11 w-32" />
      </div>
    </article>
  );
}

export function LoadingCatalogGridCards({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <LoadingProductCard key={index} />
      ))}
    </div>
  );
}

/** Full catalog page shell: filter column + results grid. */
/** Results-only catalog wait — never skeleton the filter chrome. */
export function LoadingCatalogPage() {
  return (
    <div className="page-content">
      <LoadingCatalogGridCards count={6} />
    </div>
  );
}

/** PDP gallery + detail column. */
export function LoadingProductPage() {
  return (
    <section className="grid gap-8 pb-8">
      <Skeleton className="h-4 w-48" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Skeleton className="aspect-[4/3] w-full rounded-sm" />
        <div className="grid content-start gap-5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-11" />
            <Skeleton className="h-11 w-11" />
          </div>
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </section>
  );
}

/** Admin list: toolbar + table rows. */
export function LoadingAdminTable({
  rows = 6,
}: {
  rows?: number;
}) {
  return (
    <div className="grid gap-6">
      <div className="flex w-full min-w-0 items-center gap-2">
        <Skeleton className="h-11 min-w-0 flex-1" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-5 w-40" />
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-4 grid grid-cols-4 gap-3 border-b pb-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="grid gap-3">
          {Array.from({ length: rows }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
