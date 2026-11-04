import BreadCrumbs from "@/components/single-product/BreadCrumbs";
import {
  fetchFavoriteId,
  fetchOpenCatalogOrderForProduct,
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
import { CtaInquiryTrigger } from "@/components/cta/cta-inquiry";
import RequestCatalogOrder from "@/components/single-product/RequestCatalogOrder";
import { getSession } from "@/utils/session";
import { getLocale, getTranslations } from "next-intl/server";
import {
  buildProductDetailsTabs,
  buildProductKeyFacts,
  formatProductPrice,
} from "@/lib/catalog/product-page";
import { fetchCardPreviewLayoutsByNodeIds } from "@/lib/catalog/card-preview";
import {
  fetchProductPageLayoutsByNodeIds,
  resolveProductPageLayout,
} from "@/lib/catalog/product-page-layout";
import { fetchAttributesForNode } from "@/lib/catalog/taxonomy";
import { productWithSpecsToVehicle } from "@/lib/catalog/product-to-vehicle";
import db from "@/utils/db";
import { buildCatalogHref } from "@/utils/catalog-query";
import { LuFileText } from "react-icons/lu";

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
  const [product, locale, t, session] = await Promise.all([
    fetchSingleProduct(params.id),
    getLocale(),
    getTranslations("Product"),
    getSession(),
  ]);
  const { name, description, price, productCode } = product;
  const priceLabel = formatProductPrice(price, locale);
  const leasingEstimate = Math.max(1, Math.round((price || 0) / 51));
  const leasingAmountLabel = formatProductPrice(leasingEstimate, locale);
  const user = session?.user;
  const userId = user?.id;
  const isAuthenticated = Boolean(userId);
  const categoryLabel = product.taxonomyNode?.name ?? null;
  const categorySlug = product.taxonomyNode?.slug ?? null;

  const [
    favoriteId,
    openCatalogOrder,
    related,
    relatedLayouts,
    pageLayouts,
    folderAttributes,
  ] = await Promise.all([
      userId
        ? fetchFavoriteId({ productId: product.id })
        : Promise.resolve(null),
      userId
        ? fetchOpenCatalogOrderForProduct({
            productId: product.id,
            userId,
          })
        : Promise.resolve(null),
      fetchRelatedProducts({
        productId: product.id,
        taxonomyNodeId: product.taxonomyNodeId,
        limit: 12,
      }),
      product.taxonomyNodeId
        ? fetchCardPreviewLayoutsByNodeIds(db, [product.taxonomyNodeId])
        : Promise.resolve(new Map()),
      product.taxonomyNodeId
        ? fetchProductPageLayoutsByNodeIds(db, [product.taxonomyNodeId])
        : Promise.resolve(new Map()),
      product.taxonomyNodeId
        ? fetchAttributesForNode(product.taxonomyNodeId)
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
      type: spec.attribute.type,
      textInput: spec.attribute.textInput,
      sortOrder: spec.attribute.sortOrder,
    },
    option: spec.option,
    selectedOptions: spec.selectedOptions,
    numberValue: spec.numberValue,
    textValue: spec.textValue,
    booleanValue: spec.booleanValue,
  }));

  const pageLayoutRow = product.taxonomyNodeId
    ? pageLayouts.get(product.taxonomyNodeId)
    : undefined;
  const layoutAttributes =
    folderAttributes.length > 0
      ? folderAttributes.map((attr) => ({
          id: attr.id,
          key: attr.key,
          sortOrder: attr.sortOrder,
          name: attr.name,
          type: attr.type,
          textInput: attr.textInput,
        }))
      : specsForPage.map((spec) => ({
          id: spec.attribute.id,
          key: spec.attribute.key,
          sortOrder: spec.attribute.sortOrder,
          name: spec.attribute.name,
          type: spec.attribute.type,
          textInput: spec.attribute.textInput,
        }));
  const pageLayout = resolveProductPageLayout(pageLayoutRow, layoutAttributes);
  const keyFacts = buildProductKeyFacts(specsForPage, pageLayout, locale);
  const detailsTabs = buildProductDetailsTabs(
    specsForPage,
    pageLayout,
    description,
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
      hasOpenOrder={Boolean(openCatalogOrder)}
    />
  );

  const offerCta = (
    <CtaInquiryTrigger
      size="lg"
      variant="outline"
      className="w-full"
      context={{
        productId: params.id,
        productName: name,
        productCode: productCode ?? null,
      }}
    >
      <LuFileText className="size-4" aria-hidden />
      {t("requestOffer")}
    </CtaInquiryTrigger>
  );

  const trustItems = [
    { id: "warranty", label: t("trustWarranty") },
    { id: "service", label: t("trustService") },
    { id: "delivery", label: t("trustDelivery") },
    {
      id: "tradein",
      label: t("trustTradeIn"),
      hint: t("trustTradeInHint"),
    },
  ];

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

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
        <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden">
          <ProductGallery
            images={gallery}
            priority
            sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw, 40vw"
          />
        </div>

        <ProductBuyBox
          className="min-w-0"
          categoryLabel={categoryLabel}
          name={name}
          priceLabel={priceLabel}
          priceHint={t("priceHint")}
          availabilityLabel={availabilityLabel}
          availabilityInStock={availabilityInStock}
          facts={keyFacts}
          articleLabel={
            productCode ? t("articleCode", { code: productCode }) : null
          }
          financingLabel={t("financingFrom")}
          financingAmount={t("financingPerMonth", {
            amount: leasingAmountLabel,
          })}
          financingHint={t("financingHint")}
          trustItems={trustItems}
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
          secondaryCta={offerCta}
        />
      </div>

      <ProductDetailsTabs tabs={detailsTabs} textHeading={t("aboutTitle")} />

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
