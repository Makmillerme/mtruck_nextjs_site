'use client';
import { useState } from 'react';
import { SubmitButton } from '@/components/form/Buttons';
import FormContainer from '@/components/form/FormContainer';
import { Card } from '@/components/ui/card';
import RatingInput from '@/components/reviews/RatingInput';
import TextAreaInput from '@/components/form/TextAreaInput';
import { Button } from '@/components/ui/button';
import { createReviewAction } from '@/utils/actions';
import { useTranslations } from 'next-intl';

function SubmitReview({
  productId,
  authorName,
  authorImageUrl,
}: {
  productId: string;
  authorName: string;
  authorImageUrl: string;
}) {
  const t = useTranslations('Reviews');
  const [isReviewFormVisible, setIsReviewFormVisible] = useState(false);
  return (
    <div>
      <Button
        size='lg'
        className='capitalize'
        onClick={() => setIsReviewFormVisible((prev) => !prev)}
      >
        {t('leaveReview')}
      </Button>
      {isReviewFormVisible && (
        <Card className='p-8 mt-8'>
          <FormContainer action={createReviewAction}>
            <input type='hidden' name='productId' value={productId} />
            <input type='hidden' name='authorName' value={authorName} />
            <input type='hidden' name='authorImageUrl' value={authorImageUrl} />
            <RatingInput name='rating' labelText={t('rating')} />
            <TextAreaInput
              name='comment'
              labelText={t('feedback')}
            />
            <SubmitButton className='mt-4' />
          </FormContainer>
        </Card>
      )}
    </div>
  );
}
export default SubmitReview;
