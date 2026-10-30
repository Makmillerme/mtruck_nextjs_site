import BreadCrumbs from "@/components/single-product/BreadCrumbs";
import {
  fetchFavoriteId,
  fetchRelatedProducts,
  fetchSingleProduct,
} from "@/utils/actions";
import type { Metadata } from "next";
import { uniqueImages } from "@/lib/catalog/product-to-vehicle";
import FavoriteToggleButton from "@/components/products/FavoriteToggleButton";
import ShareButton from "@/components/single-product/ShareButton";
import ProductGallery from "@/components/single-product/product-gallery";
import ProductBuyBox from "@/components/single-product/product-buy-box";
import ProductDetailsTabs from "@/components/single-product/product-details-tabs";
import ProductRelated from "@/components/single-product/product-related";
import ProductStickyCta from "@/components/single-product/product-sticky-cta";
import RequestCatalogOrder from "@/components/single-product/RequestCatalogOrder";
import { Button } from "@/components/ui/button";
import { getSession } from "@/utils/session";
import { getLocale, getTranslations } from "next-intl/server";
import {
  buildProductKeyFacts,
  buildProductSpecGroups,
  formatProductPrice,
} from "@/lib/catalog/product-page";
import {
  fetchDisplayGroupsForNode,
  resolveDisplayGroupsByKey,
} from "@/lib/catalog/taxonomy";
import { fetchCardPreviewLayoutsByNodeIds } from "@/lib/catalog/card-preview";
import { productWithSpecsToVehicle } from "@/lib/catalog/product-to-vehicle";
import db from "@/utils/db";
import { buildCatalogHref } from "@/utils/catalog-query";
import { LuPhone } from "react-icons/lu";

export async function generateMetadata(props: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const product = await db.product.findUnique({
    where: { id },
    select: {
      name: true,
      description: true,
      image: true,
      archivedAt: true,
    },
  });

  if (!product || product.archivedAt) {
    return {};
  }

  const description = product.description?.trim() || undefined;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

async function SingleProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [product, locale, t, tNav, session] = await Promise.all([
    fetchSingleProduct(params.id),
    getLocale(),
    getTranslations("Product"),
    getTranslations("Navbar"),
    getSession(),
  ]);
  const { name, description, price } = product;
  const priceLabel = formatProductPrice(price, locale);
  const user = session?.user;
  const userId = user?.id;
  const isAuthenticated = Boolean(userId);
  const categoryLabel = product.taxonomyNode?.name ?? null;
  const categorySlug = product.taxonomyNode?.slug ?? null;

  const [favoriteId, related, displayGroups, relatedLayouts] =
    await Promise.all([
      userId
        ? fetchFavoriteId({ productId: product.id })
        : Promise.resolve(null),
      fetchRelatedProducts({
        productId: product.id,
        taxonomyNodeId: product.taxonomyNodeId,
        limit: 12,
      }),
      product.taxonomyNodeId
        ? fetchDisplayGroupsForNode(product.taxonomyNodeId).then(
            resolveDisplayGroupsByKey
          )
        : Promise.resolve([]),
      product.taxonomyNodeId
        ? fetchCardPreviewLayoutsByNodeIds(db, [product.taxonomyNodeId])
        : Promise.resolve(new Map()),
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

  const keyFacts = buildProductKeyFacts(specsForPage, 6, locale);
  const specGroups = buildProductSpecGroups(
    specsForPage,
    displayGroups,
    locale
  );
  const relatedVehicles = related.map((item) =>
    productWithSpecsToVehicle(
      item,
      item.taxonomyNodeId
        ? relatedLayouts.get(item.taxonomyNodeId)
        : undefined,
      locale
    )
  );
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

  const callCta = (
    <Button asChild size="lg" variant="outline">
      <a href={tNav("phoneHref")}>
        <LuPhone className="size-4" aria-hidden />
        {t("callManager")}
      </a>
    </Button>
  );

  return (
    <section
      data-page-shell="product"
      className="grid min-w-0 gap-8 pb-24 lg:pb-8"
    >
      <BreadCrumbs
        name={product.name}
        categoryLabel={categoryLabel}
        categorySlug={categorySlug}
      />

      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={gallery}
          priority
          sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw, 40vw"
        />

        <ProductBuyBox
          categoryLabel={categoryLabel}
          name={name}
          priceLabel={priceLabel}
          priceHint={t("priceHint")}
          availabilityLabel={availabilityLabel}
          availabilityInStock={availabilityInStock}
          facts={keyFacts}
          actions={
            <>
              <FavoriteToggleButton
                productId={params.id}
                favoriteId={favoriteId}
                isAuthenticated={isAuthenticated}
                appearance="outline"
              />
              <ShareButton name={product.name} productId={params.id} />
            </>
          }
          cta={orderCta}
          secondaryCta={callCta}
        />
      </div>

      <ProductDetailsTabs
        description={description}
        specGroups={specGroups}
        descriptionTab={t("descriptionTitle")}
        specsTab={t("specsTitle")}
        aboutTitle={t("aboutTitle")}
      />

      <ProductRelated
        title={t("relatedTitle")}
        vehicles={relatedVehicles}
        catalogHref={
          categorySlug
            ? buildCatalogHref(new URLSearchParams(), {
                clearFacets: true,
                folders: [categorySlug],
                resetPage: true,
              })
            : "/products"
        }
        catalogLabel={t("relatedViewCategory")}
        catalogHint={
          categoryLabel
            ? t("relatedCatalogHintInCategory", {
                category: categoryLabel,
              })
            : t("relatedCatalogHint")
        }
        carouselPrevLabel={t("relatedCarouselPrev")}
        carouselNextLabel={t("relatedCarouselNext")}
        isAuthenticated={isAuthenticated}
      />

      <ProductStickyCta priceLabel={priceLabel} cta={orderCta} />
    </section>
  );
}

export default SingleProductPage;
