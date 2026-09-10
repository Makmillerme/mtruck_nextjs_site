import { Skeleton } from '../ui/skeleton';

function LoadingContainer() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 min-[900px]:grid-cols-3 md:gap-5">
      <LoadingProduct />
      <LoadingProduct />
      <LoadingProduct />
    </div>
  );
}

function LoadingProduct() {
  return (
    <article className="overflow-hidden rounded-2xl border border-border/60 bg-background">
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
export default LoadingContainer;
