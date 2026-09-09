'use client';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error');

  return (
    <div className="page-container flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-semibold tracking-tight">{t('title')}</h2>
      <p className="max-w-md text-muted-foreground">{t('description')}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset}>
          {t('retry')}
        </Button>
        <Button asChild variant="outline">
          <Link href="/">{t('home')}</Link>
        </Button>
      </div>
    </div>
  );
}
