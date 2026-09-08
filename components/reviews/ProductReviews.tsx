import { fetchProductReviews } from '@/utils/actions';
import SectionTitle from '../global/SectionTitle';
import ReviewCard from './ReviewCard';
import { getTranslations } from 'next-intl/server';

async function ProductReviews({ productId }: { productId: string }) {
  const t = await getTranslations('Product');
  const reviews = await fetchProductReviews(productId);

  return (
    <div className='mt-16'>
      <SectionTitle text={t('reviewsTitle')} />
      <div className='grid md:grid-cols-2 gap-8 my-8'>
        {reviews.map((review) => {
          const { comment, rating, authorImageUrl, authorName } = review;
          const reviewInfo = {
            comment,
            rating,
            image: authorImageUrl,
            name: authorName,
          };
          return <ReviewCard key={review.id} reviewInfo={reviewInfo} />;
        })}
      </div>
    </div>
  );
}
export default ProductReviews;
