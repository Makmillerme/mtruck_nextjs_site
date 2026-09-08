'use client';
import { useState } from 'react';
import SelectProductAmount from './SelectProductAmount';
import { Mode } from './SelectProductAmount';
import FormContainer from '../form/FormContainer';
import { SubmitButton } from '../form/Buttons';
import { addToCartAction } from '@/utils/actions';
import { ProductSignInButton } from '../form/Buttons';
import { authClient } from '@/lib/auth-client';
import { useTranslations } from 'next-intl';

function AddToCart({ productId }: { productId: string }) {
  const t = useTranslations('Product');
  const [amount, setAmount] = useState(1);
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;
  return (
    <div className='mt-4'>
      <SelectProductAmount
        mode={Mode.SingleProduct}
        amount={amount}
        setAmount={setAmount}
      />
      {userId ? (
        <FormContainer action={addToCartAction}>
          <input type='hidden' name='productId' value={productId} />
          <input type='hidden' name='amount' value={amount} />
          <SubmitButton text={t('addToCart')} className='mt-8' />
        </FormContainer>
      ) : (
        <ProductSignInButton />
      )}
    </div>
  );
}
export default AddToCart;
