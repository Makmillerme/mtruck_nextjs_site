import { getTranslations } from 'next-intl/server';

export default async function NotFoundPage() {
  const t = await getTranslations('NotFound');

  return (
    <section className="py-24 text-center">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-4 text-muted-foreground">{t('description')}</p>
    </section>
  );
}
