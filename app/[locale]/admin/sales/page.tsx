import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { fetchAdminOrders } from '@/utils/actions';
import { formatCurrency, formatDate } from '@/utils/format';
import { getLocale, getTranslations } from 'next-intl/server';

async function SalesPage() {
  const t = await getTranslations('Admin');
  const tOrders = await getTranslations('Orders');
  const locale = await getLocale();
  const orders = await fetchAdminOrders();

  return (
    <Table>
      <TableCaption>{t('totalOrders', { count: orders.length })}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{t('email')}</TableHead>
          <TableHead>{tOrders('products')}</TableHead>
          <TableHead>{tOrders('orderTotal')}</TableHead>
          <TableHead>{tOrders('tax')}</TableHead>
          <TableHead>{tOrders('shipping')}</TableHead>
          <TableHead>{tOrders('date')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const { products, orderTotal, tax, shipping, createdAt, email } =
            order;
          return (
            <TableRow key={order.id}>
              <TableCell>{email}</TableCell>
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
  );
}
export default SalesPage;
