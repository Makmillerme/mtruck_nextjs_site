import { fetchProductRating } from '@/utils/actions';
import { FaStar } from 'react-icons/fa';
import { getTranslations } from 'next-intl/server';

async function ProductRating({ productId }: { productId: string }) {
  const t = await getTranslations('Product');
  const { count, rating } = await fetchProductRating(productId);

  return (
    <span className='flex gap-1 items-center text-md mt-1 mb-4'>
      <FaStar className='w-3 h-3' />
      {rating} {t('reviewsCount', { count })}
    </span>
  );
}
export default ProductRating;
