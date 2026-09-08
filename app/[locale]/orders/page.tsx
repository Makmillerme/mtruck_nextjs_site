import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import SectionTitle from '@/components/global/SectionTitle';
import { fetchUserOrders } from '@/utils/actions';
import { formatCurrency, formatDate } from '@/utils/format';
import { getLocale, getTranslations } from 'next-intl/server';

async function OrdersPage() {
  const t = await getTranslations('Orders');
  const locale = await getLocale();
  const orders = await fetchUserOrders();

  return (
    <>
      <SectionTitle text={t('title')} />
      <Table>
        <TableCaption>{t('total', { count: orders.length })}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{t('products')}</TableHead>
            <TableHead>{t('orderTotal')}</TableHead>
            <TableHead>{t('tax')}</TableHead>
            <TableHead>{t('shipping')}</TableHead>
            <TableHead>{t('date')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const { products, orderTotal, tax, shipping, createdAt } = order;
            return (
              <TableRow key={order.id}>
                <TableCell>{products}</TableCell>
                <TableCell>{formatCurrency(orderTotal, locale)}</TableCell>
                <TableCell>{formatCurrency(tax, locale)}</TableCell>
                <TableCell>{formatCurrency(shipping, locale)}</TableCell>
                <TableCell>{formatDate(createdAt, locale)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
export default OrdersPage;
