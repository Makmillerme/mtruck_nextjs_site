import EmptyList from '@/components/global/EmptyList';
import { deleteProductAction, fetchAdminProducts } from '@/utils/actions';
import { Link } from '@/i18n/navigation';

import { formatCurrency } from '@/utils/format';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
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

  return (
    <section className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t('myProducts')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('totalProducts', { count: items.length })}
        </p>
      </div>
      {items.length === 0 ? (
        <EmptyList />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
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
                          className="tracking-wide text-muted-foreground underline capitalize"
                        >
                          {name}
                        </Link>
                      </TableCell>
                      <TableCell>{company}</TableCell>
                      <TableCell>{formatCurrency(price, locale)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/products/${productId}/edit`}>
                            <IconButton actionType="edit" />
                          </Link>
                          <DeleteProduct productId={productId} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
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
