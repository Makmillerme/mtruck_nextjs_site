import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

async function EmptyList({
  heading,
  className,
}: {
  heading?: string;
  className?: string;
}) {
  const t = await getTranslations('Common');
  return <h2 className={cn('text-xl', className)}>{heading ?? t('emptyList')}</h2>;
}
export default EmptyList;
