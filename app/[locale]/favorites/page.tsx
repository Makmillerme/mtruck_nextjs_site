import SectionTitle from '@/components/global/SectionTitle';
import ProductsGrid from '@/components/products/ProductsGrid';
import { fetchUserFavorites } from '@/utils/actions';
import { getTranslations } from 'next-intl/server';

async function FavoritesPage() {
  const t = await getTranslations('Favorites');
  const favorites = await fetchUserFavorites();
  if (favorites.length === 0)
    return <SectionTitle text={t('empty')} />;

  return (
    <div>
      <SectionTitle text={t('title')} />
      <ProductsGrid products={favorites.map((favorite) => favorite.product)} />
    </div>
  );
}
export default FavoritesPage;
