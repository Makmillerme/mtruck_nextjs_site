import BreadCrumbs from "@/components/single-product/BreadCrumbs";
import {
  fetchFavoriteId,
  fetchOpenCatalogOrderForProduct,
  fetchRelatedProducts,
  fetchSingleProduct,
} from "@/utils/actions";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import {
  CATALOG_CACHE_REVALIDATE_SECONDS,
  CATALOG_CACHE_TAGS,
} from "@/lib/catalog/cache-tags";
import { uniqueImages } from "@/lib/catalog/product-to-card";
import FavoriteToggleButton from "@/components/products/FavoriteToggleButton";
import ShareButton from "@/components/single-product/ShareButton";
import ProductGallery from "@/components/single-product/product-gallery";
import ProductBuyBox from "@/components/single-product/product-buy-box";
import ProductBuyBoxContact from "@/components/single-product/product-buy-box-contact";
import ProductDealerCard from "@/components/single-product/product-dealer-card";
import ProductDetailsTabs from "@/components/single-product/product-details-tabs";
import ProductHowtoSection from "@/components/single-product/product-howto-section";
import ProductRelated from "@/components/single-product/product-related";
import ProductStickyCta from "@/components/single-product/product-sticky-cta";
import ProductTermsSection from "@/components/single-product/product-terms-section";
import { CtaInquiryTrigger } from "@/components/cta/cta-inquiry";
import {
  CatalogOrderProvider,
  CatalogOrderTrigger,
} from "@/components/single-product/product-order-cta";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import {
  buildProductDetailsTabs,
  buildProductKeyFacts,
  formatProductPrice,
} from "@/lib/catalog/product-page";
import { getBuyerCurrencyCookie } from "@/lib/finance/buyer-currency";
import FinancingCalculator from "@/components/single-product/financing-calculator";
import { resolveStorefrontPriceDisplay } from "@/lib/finance/storefront-card-price";
import { fetchCardPreviewLayoutsByNodeIds } from "@/lib/catalog/card-preview";
import {
  fetchProductPageLayoutsByNodeIds,
  resolveProductPageLayout,
} from "@/lib/catalog/product-page-layout";
import {
  fetchAttributesForNode,
  resolveProductsAreUnique,
} from "@/lib/catalog/taxonomy";
import { productWithSpecsToCardModel } from "@/lib/catalog/product-to-card";
import {
  canPlaceProductOrder,
  resolvePublicAvailabilityBadge,
} from "@/lib/catalog/product-availability-badge";
import db from "@/utils/db";
import { buildCatalogHref } from "@/utils/catalog-query";
import { LuFileText } from "react-icons/lu";

async function fetchProductMetadata(productId: string) {
  return unstable_cache(
    () =>
      db.product.findUnique({
        where: { id: productId },
        select: {
          name: true,
          description: true,
          image: true,
          archivedAt: true,
        },
      }),
    ["product-metadata", productId],
    {
      revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
      tags: [CATALOG_CACHE_TAGS.products],
    }
  )();
}

export async function generateMetadata(props: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const product = await fetchProductMetadata(id);

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
  const [product, locale, t, tFinance, tFooter, session, buyerCurrency] =
    await Promise.all([
      fetchSingleProduct(params.id),
      getLocale(),
      getTranslations("Product"),
      getTranslations("FinanceAdmin"),
      getTranslations("Footer"),
      getSession(),
      getBuyerCurrencyCookie(),
    ]);
  const { name, description, price, currency, productCode } = product;
  const storefrontPrice = await resolveStorefrontPriceDisplay(
    {
      price,
      currency,
      taxonomyNodeId: product.taxonomyNodeId,
      promoKind: product.promoKind,
      promoValue: product.promoValue,
    },
    locale,
    buyerCurrency
  );
  const priceLabel = storefrontPrice.priceLabel;
  const currencyDisplayMode = storefrontPrice.currencyDisplayMode;
  const financingOffer = storefrontPrice.financingOffer;
  const vatLineKinds = new Set(["net", "gross", "vat"]);
  const moneyKey = (currencyCode: string, amount: number) =>
    `${currencyCode.toUpperCase()}:${amount}`;
  // Left column already shows main + STACKED extras — hide the same
  // currency+amount from the VAT column (not only when main === VAT currency).
  const leftMoneyKeys = new Set(
    storefrontPrice.lines
      .filter((line) => line.kind === "main" || line.kind === "extra")
      .map((line) => moneyKey(line.currencyCode, line.amount))
  );
  const extraPriceLines = storefrontPrice.lines
    .filter((line) => line.kind === "extra")
    .map((line) =>
      formatProductPrice(
        line.amount,
        locale,
        line.currencyCode,
        currencyDisplayMode
      )
    );
  const vatLines = storefrontPrice.lines.filter(
    (line) =>
      vatLineKinds.has(line.kind) &&
      !leftMoneyKeys.has(moneyKey(line.currencyCode, line.amount))
  );
  const priceLines = vatLines.map((line, index, all) => {
    const amount = formatProductPrice(
      line.amount,
      locale,
      line.currencyCode,
      currencyDisplayMode
    );
    const prefix = line.labelKey ? tFinance(line.labelKey) : null;
    const emphasize =
      index === all.length - 1 && storefrontPrice.vatCurrenciesDiffer;
    return {
      title: prefix ?? "",
      amount,
      // Same currencies: all VAT lines muted. Differ: last (З ПДВ) stays strong.
      muted: !emphasize,
      emphasize,
    };
  });
  const user = session?.user;
  const userId = user?.id;
  const isAuthenticated = Boolean(userId);
  const categoryLabel = product.taxonomyNode?.name ?? null;
  const categorySlug = product.taxonomyNode?.slug ?? null;

  const [
    favoriteId,
    openCatalogOrder,
    productsAreUnique,
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
      resolveProductsAreUnique(product.taxonomyNodeId),
      fetchRelatedProducts({
        productId: product.id,
        taxonomyNodeId: product.taxonomyNodeId,
        limit: 4,
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
  const allowsQuantity = !productsAreUnique;

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
  const relatedDisplays = await Promise.all(
    related.map((item) =>
      resolveStorefrontPriceDisplay(
        {
          price: item.price,
          currency: item.currency,
          taxonomyNodeId: item.taxonomyNodeId,
          promoKind: item.promoKind,
          promoValue: item.promoValue,
        },
        locale,
        buyerCurrency
      )
    )
  );
  const relatedProducts = related.map((item, index) =>
    productWithSpecsToCardModel(
      item,
      item.taxonomyNodeId
        ? relatedLayouts.get(item.taxonomyNodeId)
        : undefined,
      locale,
      relatedDisplays[index]
    )
  );
  const publicBadge = resolvePublicAvailabilityBadge({
    status: product.status,
    availability: product.availability,
  });
  const availabilityLabel = publicBadge ? t(publicBadge.labelKey) : null;
  const canOrder = canPlaceProductOrder(product.status);

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
    { id: "delivery", label: t("trustDelivery") },
    { id: "service", label: t("trustService") },
    { id: "prep", label: t("trustPrep") },
    { id: "documents", label: t("trustDocuments") },
  ];

  const orderAddedFlash =
    (await cookies()).get("mtruck-order-added")?.value === params.id;

  const schemaAvailability =
    product.status === "SOLD"
      ? "https://schema.org/SoldOut"
      : product.status === "RESERVED"
        ? "https://schema.org/PreOrder"
        : product.availability === "TRANSIT" ||
            product.availability === "ON_ORDER"
          ? "https://schema.org/PreOrder"
          : "https://schema.org/InStock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name,
    description: description?.trim() || undefined,
    image: gallery.map((item) => item.src).filter(Boolean),
    sku: productCode ?? undefined,
    brand: categoryLabel || undefined,
    offers: {
      "@type": "Offer",
      url: `https://m-truck.ua/products/${params.id}`,
      priceCurrency: currency || "USD",
      price: price,
      availability: schemaAvailability,
    },
  };

  return (
    <CatalogOrderProvider
      productId={params.id}
      productName={name}
      priceLabel={priceLabel}
      imageSrc={gallery[0]?.src ?? product.image}
      productCode={productCode}
      isAuthenticated={isAuthenticated}
      hasOpenOrder={Boolean(openCatalogOrder)}
      openOrderId={openCatalogOrder?.id ?? null}
      openOrderQuantity={openCatalogOrder?.products ?? 1}
      allowsQuantity={allowsQuantity}
      favoriteId={favoriteId}
      initialSheetOpen={orderAddedFlash}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section
        data-page-shell="product"
        className="grid min-w-0 grid-cols-1 gap-8 pb-24 lg:pb-8"
      >
        <BreadCrumbs
          name={product.name}
          categoryLabel={categoryLabel}
          categorySlug={categorySlug}
        />

        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="flex min-h-0 min-w-0 w-full flex-col overflow-hidden">
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
            struckLabel={storefrontPrice.struckLabel}
            extraPriceLines={extraPriceLines}
            priceLines={priceLines}
            availabilityLabel={availabilityLabel}
            availabilityTone={publicBadge?.tone ?? "default"}
            availabilityClassName={publicBadge?.chipClassName ?? null}
            facts={keyFacts}
            articleLabel={
              productCode ? t("articleCode", { code: productCode }) : null
            }
            financingLabel={storefrontPrice.financingLabel}
            financingAmount={storefrontPrice.financingAmountLabel}
            financingExtraLabels={storefrontPrice.financingExtraLabels}
            financingCalcLabel={
              financingOffer ? t("financingCalculate") : null
            }
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
            cta={canOrder ? <CatalogOrderTrigger /> : null}
            secondaryCta={offerCta}
            contact={<ProductBuyBoxContact />}
          />
        </div>

        <ProductDetailsTabs tabs={detailsTabs} textHeading={t("aboutTitle")} />

        <ProductTermsSection
          title={t("termsTitle")}
          items={[
            {
              id: "delivery",
              title: t("termsDeliveryTitle"),
              body: t("termsDeliveryBody"),
            },
            {
              id: "service",
              title: t("termsServiceTitle"),
              body: t("termsServiceBody"),
            },
            {
              id: "prep",
              title: t("termsPrepTitle"),
              body: t("termsPrepBody"),
            },
            {
              id: "documents",
              title: t("termsDocumentsTitle"),
              body: t("termsDocumentsBody"),
            },
          ]}
        />

        <ProductHowtoSection
          title={t("howtoTitle")}
          steps={[
            {
              id: "inspect",
              title: t("howtoStep1Title"),
              body: t("howtoStep1Body"),
            },
            {
              id: "reserve",
              title: t("howtoStep2Title"),
              body: t("howtoStep2Body"),
            },
            {
              id: "deal",
              title: t("howtoStep3Title"),
              body: t("howtoStep3Body"),
            },
            {
              id: "handover",
              title: t("howtoStep4Title"),
              body: t("howtoStep4Body"),
            },
          ]}
        />

        <ProductDealerCard
          title={t("dealerTitle")}
          address={tFooter("address")}
          hours={tFooter("hours")}
          phoneValue={tFooter("phone.value")}
          phoneHref={tFooter("phone.href")}
          telegramLabel={t("contactTelegram")}
          visitHint={t("dealerVisitHint")}
          inquiryCta={
            <CtaInquiryTrigger
              size="lg"
              variant="default"
              className="w-full sm:w-auto"
              context={{
                productId: params.id,
                productName: name,
                productCode: productCode ?? null,
              }}
            >
              {t("dealerInquiry")}
            </CtaInquiryTrigger>
          }
        />

        {financingOffer ? (
          <FinancingCalculator
            offer={financingOffer}
            currencyDisplayMode={currencyDisplayMode}
            inquiry={{
              productId: params.id,
              productName: name,
              productCode: productCode ?? null,
            }}
          />
        ) : null}

        <ProductRelated
          title={t("relatedTitle")}
          products={relatedProducts}
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

        <ProductStickyCta
          priceLabel={priceLabel}
          cta={canOrder ? <CatalogOrderTrigger /> : offerCta}
        />
      </section>
    </CatalogOrderProvider>
  );
}

export default SingleProductPage;
