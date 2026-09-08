import CartItemsList from '@/components/cart/CartItemsList';
import CartTotals from '@/components/cart/CartTotals';
import SectionTitle from '@/components/global/SectionTitle';
import { fetchOrCreateCart, updateCart } from '@/utils/actions';
import { getSession } from '@/utils/session';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

async function CartPage() {
  const t = await getTranslations('Cart');
  const session = await getSession();
  const userId = session?.user.id;
  if (!userId) redirect('/');
  const previousCart = await fetchOrCreateCart({ userId });
  const { currentCart, cartItems } = await updateCart(previousCart);
  if (cartItems.length === 0) return <SectionTitle text={t('empty')} />;

  return (
    <>
      <SectionTitle text={t('title')} />
      <div className='mt-8 grid gap-4 lg:grid-cols-12'>
        <div className='lg:col-span-8'>
          <CartItemsList cartItems={cartItems} />
        </div>
        <div className='lg:col-span-4'>
          <CartTotals cart={currentCart} />
        </div>
      </div>
    </>
  );
}
export default CartPage;
