import BreadCrumbs from '@/components/single-product/BreadCrumbs';
import { fetchFavoriteId, fetchSingleProduct, findExistingReview } from '@/utils/actions';
import PhotoCarousel from '@/components/media/photo-carousel';
import { formatCurrency } from '@/utils/format';
import { uniqueImages } from '@/lib/catalog/product-to-vehicle';
import FavoriteToggleButton from '@/components/products/FavoriteToggleButton';
import ProductRating from '@/components/single-product/ProductRating';
import ShareButton from '@/components/single-product/ShareButton';
import SubmitReview from '@/components/reviews/SubmitReview';
import ProductReviews from '@/components/reviews/ProductReviews';
import { getSession } from '@/utils/session';
import { getLocale, getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { formatSpecDisplay } from '@/lib/catalog/product-to-vehicle';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import RequestCatalogOrder from '@/components/single-product/RequestCatalogOrder';

async function SingleProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [product, locale, t, session] = await Promise.all([
    fetchSingleProduct(params.id),
    getLocale(),
    getTranslations('Product'),
    getSession(),
  ]);
  const { name, company, description, price } = product;
  const dollarsAmount = formatCurrency(price, locale);
  const user = session?.user;
  const userId = user?.id;
  const isAuthenticated = Boolean(userId);
  const [favoriteId, existingReview] = await Promise.all([
    userId ? fetchFavoriteId({ productId: product.id }) : Promise.resolve(null),
    userId ? findExistingReview(userId, product.id) : Promise.resolve(null),
  ]);
  const reviewDoesNotExist = Boolean(userId && !existingReview);

  const gallery = uniqueImages(
    product.image,
    product.images.map((item) => item.url)
  ).map((src) => ({ src, alt: name }));
  const specs = [...product.specs].sort(
    (a, b) => a.attribute.sortOrder - b.attribute.sortOrder
  );

  return (
    <section className="grid gap-8 pb-8">
      <BreadCrumbs name={product.name} />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <PhotoCarousel
          variant="page"
          images={gallery}
          priority
          sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw, 33vw"
          className="overflow-hidden rounded-sm"
        />

        <div className="grid gap-5 content-start">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 grid gap-2">
              {product.taxonomyNode ? (
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {product.taxonomyNode.name}
                </p>
              ) : null}
              <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
              <p className="text-lg text-muted-foreground">{company}</p>
            </div>
            <div className="flex items-center gap-2">
              <FavoriteToggleButton
                productId={params.id}
                favoriteId={favoriteId}
                isAuthenticated={isAuthenticated}
              />
              <ShareButton name={product.name} productId={params.id} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={product.availability === 'IN_STOCK' ? 'default' : 'secondary'}>
              {product.availability === 'IN_STOCK'
                ? t('availabilityStock')
                : t('availabilityTransit')}
            </Badge>
            <Badge variant="soft">{product.status}</Badge>
          </div>

          <p className="text-3xl font-extrabold tracking-tight">{dollarsAmount}</p>
          <ProductRating productId={params.id} />
          <p className="leading-7 text-muted-foreground">{description}</p>

          {specs.length > 0 ? (
            <div className="grid gap-3 rounded-sm border p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t('specsTitle')}
              </h2>
              <dl className="grid gap-2 sm:grid-cols-2">
                {specs.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2 text-sm last:border-0"
                  >
                    <dt className="text-muted-foreground">{spec.attribute.name}</dt>
                    <dd className="font-medium text-right">
                      {formatSpecDisplay({
                        attribute: {
                          key: spec.attribute.key,
                          unit: spec.attribute.unit,
                        },
                        option: spec.option,
                        numberValue: spec.numberValue,
                        textValue: spec.textValue,
                        booleanValue: spec.booleanValue,
                      })}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <RequestCatalogOrder
              productId={params.id}
              isAuthenticated={isAuthenticated}
            />
            <Button asChild variant="outline" className="w-fit">
              <Link href="/products">{t('backToCatalog')}</Link>
            </Button>
          </div>
        </div>
      </div>

      <ProductReviews productId={params.id} />

      {reviewDoesNotExist && user ? (
        <SubmitReview
          productId={params.id}
          authorName={user.name || 'user'}
          authorImageUrl={user.image || ''}
        />
      ) : null}
    </section>
  );
}
export default SingleProductPage;
