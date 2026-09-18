import { fetchProductReviewsByUser } from '@/utils/actions';
import ReviewCard from '@/components/reviews/ReviewCard';
import SectionTitle from '@/components/global/SectionTitle';
import DeleteReviewButton from '@/components/reviews/DeleteReviewButton';
import { getTranslations } from 'next-intl/server';

async function ReviewsPage() {
  const t = await getTranslations('Reviews');
  const reviews = await fetchProductReviewsByUser();
  if (reviews.length === 0) {
    return <SectionTitle text={t('empty')} />;
  }

  return (
    <>
      <SectionTitle text={t('title')} />
      <section className='grid md:grid-cols-2 gap-8 mt-4'>
        {reviews.map((review) => {
          const { comment, rating } = review;
          const { name, image } = review.product;
          const reviewInfo = { comment, rating, name, image };
          return (
            <ReviewCard key={review.id} reviewInfo={reviewInfo}>
              <DeleteReviewButton reviewId={review.id} />
            </ReviewCard>
          );
        })}
      </section>
    </>
  );
}

export default ReviewsPage;
