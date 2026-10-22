import BreadCrumbs from "@/components/single-product/BreadCrumbs";
import {
  fetchFavoriteId,
  fetchRelatedProducts,
  fetchSingleProduct,
} from "@/utils/actions";
import { uniqueImages } from "@/lib/catalog/product-to-vehicle";
import FavoriteToggleButton from "@/components/products/FavoriteToggleButton";
import ShareButton from "@/components/single-product/ShareButton";
import ProductGallery from "@/components/single-product/product-gallery";
import ProductBuyBox from "@/components/single-product/product-buy-box";
import ProductKeyFacts from "@/components/single-product/product-key-facts";
import ProductSpecs from "@/components/single-product/product-specs";
import ProductRelated from "@/components/single-product/product-related";
import ProductStickyCta from "@/components/single-product/product-sticky-cta";
import RequestCatalogOrder from "@/components/single-product/RequestCatalogOrder";
import { getSession } from "@/utils/session";
import { getLocale, getTranslations } from "next-intl/server";
import { formatCurrency } from "@/utils/format";
import {
  buildProductKeyFacts,
  buildProductSpecGroups,
} from "@/lib/catalog/product-page";
import {
  fetchDisplayGroupsForNode,
  resolveDisplayGroupsByKey,
} from "@/lib/catalog/taxonomy";
import { productWithSpecsToVehicle } from "@/lib/catalog/product-to-vehicle";

async function SingleProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [product, locale, t, session] = await Promise.all([
    fetchSingleProduct(params.id),
    getLocale(),
    getTranslations("Product"),
    getSession(),
  ]);
  const { name, description, price } = product;
  const dollarsAmount = formatCurrency(price, locale);
  const user = session?.user;
  const userId = user?.id;
  const isAuthenticated = Boolean(userId);
  const categoryLabel = product.taxonomyNode?.name ?? null;

  const [favoriteId, related, displayGroups] = await Promise.all([
    userId ? fetchFavoriteId({ productId: product.id }) : Promise.resolve(null),
    fetchRelatedProducts({
      productId: product.id,
      taxonomyNodeId: product.taxonomyNodeId,
      limit: 4,
    }),
    product.taxonomyNodeId
      ? fetchDisplayGroupsForNode(product.taxonomyNodeId).then(
          resolveDisplayGroupsByKey
        )
      : Promise.resolve([]),
  ]);

  const gallery = uniqueImages(
    product.image,
    product.images.map((item) => item.url)
  ).map((src) => ({ src, alt: name }));

  const specsForPage = product.specs.map((spec) => ({
    id: spec.id,
    attribute: {
      id: spec.attribute.id,
      key: spec.attribute.key,
      name: spec.attribute.name,
      unit: spec.attribute.unit,
      sortOrder: spec.attribute.sortOrder,
    },
    option: spec.option,
    numberValue: spec.numberValue,
    textValue: spec.textValue,
    booleanValue: spec.booleanValue,
  }));

  const keyFacts = buildProductKeyFacts(specsForPage);
  const specGroups = buildProductSpecGroups(specsForPage, displayGroups);
  const relatedVehicles = related.map((item) => productWithSpecsToVehicle(item));
  const availabilityInStock = product.availability === "IN_STOCK";
  const availabilityLabel = availabilityInStock
    ? t("availabilityStock")
    : t("availabilityTransit");

  const orderCta = (
    <RequestCatalogOrder
      productId={params.id}
      isAuthenticated={isAuthenticated}
    />
  );

  return (
    <section className="grid gap-8 pb-24 lg:pb-8">
      <BreadCrumbs name={product.name} categoryLabel={categoryLabel} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={gallery}
          priority
          sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw, 40vw"
        />

        <ProductBuyBox
          sticky
          categoryLabel={categoryLabel}
          name={name}
          priceLabel={dollarsAmount}
          availabilityLabel={availabilityLabel}
          availabilityInStock={availabilityInStock}
          actions={
            <>
              <FavoriteToggleButton
                productId={params.id}
                favoriteId={favoriteId}
                isAuthenticated={isAuthenticated}
              />
              <ShareButton name={product.name} productId={params.id} />
            </>
          }
          cta={orderCta}
        />
      </div>

      <ProductKeyFacts facts={keyFacts} title={t("keyFactsTitle")} />

      {description?.trim() ? (
        <p className="max-w-3xl leading-7 text-muted-foreground">{description}</p>
      ) : null}

      <ProductSpecs groups={specGroups} title={t("specsTitle")} />

      <ProductRelated
        title={t("relatedTitle")}
        vehicles={relatedVehicles}
        isAuthenticated={isAuthenticated}
      />

      <ProductStickyCta priceLabel={dollarsAmount} cta={orderCta} />
    </section>
  );
}

export default SingleProductPage;
