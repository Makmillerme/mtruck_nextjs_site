import EmptyList from '@/components/global/EmptyList';
import { deleteProductAction, fetchAdminProducts } from '@/utils/actions';
import { Link } from '@/i18n/navigation';

import { formatCurrency } from '@/utils/format';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IconButton } from '@/components/form/Buttons';
import FormContainer from '@/components/form/FormContainer';
import { getLocale, getTranslations } from 'next-intl/server';

async function AdminProductsPage() {
  const t = await getTranslations('Admin');
  const locale = await getLocale();
  const items = await fetchAdminProducts();
  if (items.length === 0) return <EmptyList />;

  return (
    <section>
      <Table>
        <TableCaption>
          {t('totalProducts', { count: items.length })}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{t('productName')}</TableHead>
            <TableHead>{t('company')}</TableHead>
            <TableHead>{t('price')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const { id: productId, name, company, price } = item;
            return (
              <TableRow key={productId}>
                <TableCell>
                  <Link
                    href={`/products/${productId}`}
                    className='underline text-muted-foreground tracking-wide capitalize'
                  >
                    {name}
                  </Link>
                </TableCell>
                <TableCell>{company}</TableCell>
                <TableCell>{formatCurrency(price, locale)}</TableCell>
                <TableCell className='flex items-center gap-x-2'>
                  <Link href={`/admin/products/${productId}/edit`}>
                    <IconButton actionType='edit' />
                  </Link>
                  <DeleteProduct productId={productId} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}

function DeleteProduct({ productId }: { productId: string }) {
  const deleteProduct = deleteProductAction.bind(null, { productId });
  return (
    <FormContainer action={deleteProduct}>
      <IconButton actionType='delete' />
    </FormContainer>
  );
}

export default AdminProductsPage;
