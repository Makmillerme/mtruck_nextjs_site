import { getTranslations } from 'next-intl/server';

export default async function AboutPage() {
  const t = await getTranslations('About');

  return (
    <section>
      <h1 className='flex flex-wrap gap-2 sm:gap-x-6 items-center justify-center text-4xl font-bold leading-none tracking-wide sm:text-6xl'>
        {t('titleBefore')}
        <span className='bg-primary py-2 px-4 rounded-lg tracking-widest text-white'>
          {t('titleHighlight')}
        </span>
      </h1>
      <p className='mt-6 text-lg tracking-wide leading-8 max-w-2xl mx-auto text-muted-foreground'>
        {t('body')}
      </p>
    </section>
  );
}
