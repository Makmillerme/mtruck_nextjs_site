import { Card, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/format';
import { Cart } from '@prisma/client';
import { getLocale, getTranslations } from 'next-intl/server';

async function CartTotals({ cart }: { cart: Cart }) {
  const t = await getTranslations('Cart');
  const locale = await getLocale();
  const { cartTotal, shipping, tax, orderTotal } = cart;
  return (
    <div>
      <Card className="p-8">
        <CartTotalRow label={t('subtotal')} amount={cartTotal} locale={locale} />
        <CartTotalRow label={t('shipping')} amount={shipping} locale={locale} />
        <CartTotalRow label={t('tax')} amount={tax} locale={locale} />
        <CardTitle className="mt-8">
          <CartTotalRow
            label={t('orderTotal')}
            amount={orderTotal}
            lastRow
            locale={locale}
          />
        </CardTitle>
      </Card>
      <p className="text-sm text-muted-foreground mt-8">
        {t('noOnlinePayment')}
      </p>
    </div>
  );
}

function CartTotalRow({
  label,
  amount,
  lastRow,
  locale,
}: {
  label: string;
  amount: number;
  lastRow?: boolean;
  locale: string;
}) {
  return (
    <>
      <p className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{formatCurrency(amount, locale)}</span>
      </p>
      {lastRow ? null : <Separator className="my-2" />}
    </>
  );
}

export default CartTotals;
