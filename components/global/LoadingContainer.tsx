import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

function LoadingContainer() {
  return (
    <div className="grid gap-4 pt-12 sm:grid-cols-2 min-[900px]:grid-cols-3 md:gap-5">
      <LoadingProduct />
      <LoadingProduct />
      <LoadingProduct />
    </div>
  );
}

function LoadingProduct() {
  return (
    <Card>
      <CardContent className='p-4'>
        <Skeleton className='h-48 w-full' />
        <Skeleton className='h-4 w-3/4 mt-4' />
        <Skeleton className='h-4 w-1/2 mt-4' />
      </CardContent>
    </Card>
  );
}
export default LoadingContainer;
