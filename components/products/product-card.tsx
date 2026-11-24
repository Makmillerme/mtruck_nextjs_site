"use client";

import dynamic from "next/dynamic";
import { CardSignInButton } from "@/components/form/Buttons";
import PhotoStatic from "@/components/media/photo-static";
import FavoriteToggleForm from "@/components/products/FavoriteToggleForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { formatProductPrice } from "@/lib/catalog/product-page";
import { useLocale, useTranslations } from "next-intl";
import {
  specsGridClassName,
  type CardPreviewSpecsStyleId,
} from "@/lib/catalog/card-preview";
import { useLayoutEffect, useRef } from "react";
import { LuChevronRight, LuTag } from "react-icons/lu";

const PhotoCarousel = dynamic(
  () => import("@/components/media/photo-carousel"),
  { ssr: true }
);

export type ProductCardStatus =
  | "PUBLISHED"
  | "RESERVED"
  | "DRAFT"
  | "PREPARING"
  | "SOLD";

export type ProductCardSpecItem = {
  key: string;
  label: string;
  value: string;
};

export type ProductCardModel = {
  id: string;
  name: string;
  price: number;
  currency?: string;
  /** Prefetched storefront label (FX-aware). */
  priceLabel?: string;
  priceHint?: string | null;
  struckLabel?: string | null;
  currencyDisplayMode?: "CODE" | "SYMBOL";
  financingLabel?: string | null;
  financingAmountLabel?: string | null;
  priceLines?: {
    kind: string;
    amount: number;
    currencyCode: string;
    labelKey?: string;
  }[];
  image: string;
  /** Cover + gallery URLs, unique, cover first */
  images?: string[];
  href: string;
  status?: ProductCardStatus;
  year?: number | null;
  location?: string | null;
  categoryLabel?: string | null;
  /** Prefetch subtitle segments (fields + category). */
  subtitleParts?: string[];
  specItems?: ProductCardSpecItem[];
  specsStyle?: CardPreviewSpecsStyleId;
  specsGridCount?: number;
  showName?: boolean;
  showPrice?: boolean;
  showStatus?: boolean;
  showSubtitle?: boolean;
  showSpecs?: boolean;
};

export function productToCardModel(product: {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: { url: string }[];
  categoryLabel?: string | null;
}): ProductCardModel {
  const urls = [
    ...new Set(
      [product.image, ...(product.images?.map((item) => item.url) ?? [])]
        .map((url) => url?.trim())
        .filter(Boolean) as string[]
    ),
  ];
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: urls[0] ?? product.image,
    images: urls,
    href: `/products/${product.id}`,
    status: "PUBLISHED",
    categoryLabel: product.categoryLabel ?? null,
    specItems: [],
  };
}

const STATUS_DOT: Record<ProductCardStatus, string> = {
  PUBLISHED: "bg-emerald-500",
  RESERVED: "bg-amber-500",
  DRAFT: "bg-slate-400",
  PREPARING: "bg-sky-500",
  SOLD: "bg-red-500",
};

const GRID_IMAGE_SIZES =
  // Catalog grid: 1 → 2 (sm) → 3 (xl=1280), with filter sidebar
  "(max-width: 640px) 100vw, (max-width: 1279px) 50vw, 33vw";

const LIST_IMAGE_SIZES = "(max-width: 768px) 100vw, 448px";

function CardPriceBlock({
  price,
  priceHint,
  struckLabel,
  priceLines,
  locale,
  currencyDisplayMode,
  financingLabel,
  financingAmountLabel,
  layout = "grid",
}: {
  price: string;
  priceHint?: string | null;
  struckLabel?: string | null;
  priceLines?: ProductCardModel["priceLines"];
  locale: string;
  currencyDisplayMode: "CODE" | "SYMBOL";
  financingLabel?: string | null;
  financingAmountLabel?: string | null;
  layout?: "grid" | "list";
}) {
  const extras = (priceLines ?? []).filter((line) => line.kind === "extra");
  const showFinancing = Boolean(financingLabel || financingAmountLabel);
  const hasExtras = extras.length > 0;
  const hasMeta = Boolean(struckLabel || priceHint || hasExtras);
  const isList = layout === "list";

  const priceCol = (
    <div
      className={cn(
        "min-w-0 grid",
        showFinancing && "flex-1",
        hasMeta ? "gap-0.5" : "gap-0",
        (showFinancing || hasExtras || priceHint) && "text-right"
      )}
    >
      {struckLabel ? (
        <p className="truncate text-sm leading-none text-muted-foreground line-through tabular-nums">
          {struckLabel}
        </p>
      ) : null}
      <FitPriceText
        text={price}
        align={
          showFinancing || hasExtras || priceHint ? "right" : "left"
        }
        className="font-extrabold tabular-nums tracking-tight text-foreground"
      />
      {priceHint ? (
        <p className="truncate text-[11px] leading-snug text-muted-foreground">
          {priceHint}
        </p>
      ) : null}
      {hasExtras ? (
        <div className="grid gap-0.5 pt-0.5">
          {extras.map((line) => (
            <p
              key={`${line.kind}-${line.currencyCode}`}
              className="truncate text-sm font-bold leading-tight tabular-nums tracking-tight text-foreground lg:text-base"
            >
              {formatProductPrice(
                line.amount,
                locale,
                line.currencyCode,
                currencyDisplayMode
              )}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );

  if (!showFinancing) {
    return priceCol;
  }

  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <div
        className={cn(
          "grid min-w-0 shrink-0 gap-1 text-left",
          isList
            ? "w-[min(48%,14rem)]"
            : "w-[min(48%,12rem)]"
        )}
      >
        {financingLabel ? (
          <p className="font-mono text-[10px] leading-none uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px] sm:tracking-[0.15em]">
            {financingLabel}
          </p>
        ) : null}
        {financingAmountLabel ? (
          <p className="text-base font-bold leading-tight tabular-nums tracking-tight text-foreground [overflow-wrap:anywhere]">
            {financingAmountLabel}
          </p>
        ) : null}
      </div>
      {priceCol}
    </div>
  );
}

/**
 * Main card price: keep one line; if it overflows the column, step down size
 * once (layout/size adapt), then a light scale if still tight.
 */
function FitPriceText({
  text,
  align = "left",
  className,
}: {
  text: string;
  align?: "left" | "right";
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const el = textRef.current;
    if (!wrap || !el) return;

    const origin = align === "right" ? "right center" : "left center";

    const fit = () => {
      el.style.transform = "none";
      el.style.transformOrigin = origin;
      const available = wrap.clientWidth;
      if (available <= 0) return;
      const needed = el.scrollWidth;
      if (needed <= available + 0.5) return;
      // Shrink proportionally; never below ~82% so the price stays readable.
      const scale = Math.max(0.82, available / needed);
      el.style.transform = `scale(${scale})`;
    };

    fit();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(fit);
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [text, align]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "min-w-0 overflow-hidden",
        align === "right" && "text-right"
      )}
    >
      <p
        ref={textRef}
        className={cn(
          "inline-block whitespace-nowrap text-xl leading-none lg:text-2xl",
          className
        )}
      >
        {text}
      </p>
    </div>
  );
}

export default function ProductCard({
  product,
  priority = false,
  favoriteId,
  isAuthenticated,
  layout = "grid",
  showFavorite = true,
  imageSizes,
}: {
  product: ProductCardModel;
  priority?: boolean;
  favoriteId?: string | null;
  isAuthenticated?: boolean;
  layout?: "grid" | "list";
  showFavorite?: boolean;
  /** Override next/image sizes (e.g. denser cabinet favorites grid). */
  imageSizes?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("ProductCard");
  const tProduct = useTranslations("Product");
  const status = product.status ?? "PUBLISHED";
  const currencyDisplayMode = product.currencyDisplayMode ?? "CODE";
  const price =
    product.priceLabel ??
    formatProductPrice(
      product.price,
      locale,
      product.currency ?? "USD",
      currencyDisplayMode
    );
  const showName = product.showName !== false;
  const showPrice = product.showPrice !== false;
  const showStatus = product.showStatus !== false;
  const showSubtitle = product.showSubtitle !== false;
  const showSpecs = product.showSpecs !== false;
  const specItems = showSpecs ? product.specItems ?? [] : [];
  const specsStyle = product.specsStyle ?? "GRID";
  const specsGridCount = product.specsGridCount ?? specItems.length ?? 4;

  const subtitleParts =
    product.subtitleParts && product.subtitleParts.length > 0
      ? product.subtitleParts
      : [
          product.categoryLabel?.trim() || t("categoryFallback"),
          product.year ? t("year", { year: product.year }) : null,
        ].filter(Boolean);

  const gallery = (product.images?.length ? product.images : [product.image]).map(
    (src) => ({ src, alt: product.name })
  );
  const mediaSizes =
    imageSizes ?? (layout === "list" ? LIST_IMAGE_SIZES : GRID_IMAGE_SIZES);
  const isList = layout === "list";
  const mediaFrame = isList ? "fill" : "ratio";
  const mediaClassName = isList ? "absolute inset-0 h-full" : undefined;

  return (
    <article className="group h-full">
      <div
        className={cn(
          // Shadow must not share overflow-hidden — it clips box-shadow on hover.
          "flex h-full rounded-sm border border-border bg-card shadow-sm transition-shadow duration-500 group-hover:shadow-xl",
          isList ? "flex-col md:flex-row" : "flex-col"
        )}
      >
        <div
          className={cn(
            "overflow-hidden",
            isList
              ? "relative aspect-[4/3] w-full md:aspect-auto md:w-[min(38%,20rem)] md:shrink-0 md:self-stretch md:rounded-l-sm"
              : "rounded-t-sm"
          )}
        >
          {(() => {
            const mediaOverlay =
              showStatus || showFavorite ? (
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5 sm:p-3">
                  {showStatus ? (
                    <Badge
                      variant="secondary"
                      className="pointer-events-none shrink gap-1.5 rounded-full border-0 bg-card/90 px-2.5 py-1 text-[11px] font-semibold leading-none text-foreground backdrop-blur-sm hover:bg-card/90 sm:px-3 sm:py-1.5 sm:text-xs"
                    >
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          STATUS_DOT[status]
                        )}
                        aria-hidden
                      />
                      <span className="whitespace-nowrap">
                        {t(`status.${status}`)}
                      </span>
                    </Badge>
                  ) : (
                    <span />
                  )}
                  {showFavorite ? (
                    <div className="pointer-events-auto shrink-0">
                      {isAuthenticated ? (
                        <FavoriteToggleForm
                          productId={product.id}
                          favoriteId={favoriteId ?? null}
                        />
                      ) : (
                        <CardSignInButton />
                      )}
                    </div>
                  ) : null}
                </div>
              ) : undefined;

            if (gallery.length <= 1) {
              return (
                <PhotoStatic
                  src={gallery[0]?.src ?? product.image}
                  alt={product.name}
                  href={product.href}
                  priority={priority}
                  frame={mediaFrame}
                  className={mediaClassName}
                  sizes={mediaSizes}
                  overlay={mediaOverlay}
                />
              );
            }

            return (
              <PhotoCarousel
                variant="card"
                frame={mediaFrame}
                images={gallery}
                href={product.href}
                priority={priority}
                className={mediaClassName}
                sizes={mediaSizes}
                prevLabel={tProduct("galleryPrev")}
                nextLabel={tProduct("galleryNext")}
                thumbLabel={tProduct("galleryThumb")}
                overlay={mediaOverlay}
              />
            );
          })()}
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4 lg:p-5">
          <Link href={product.href} className="block">
            {showSubtitle ? (
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">
                {subtitleParts.join(" • ")}
              </p>
            ) : null}
            {showName ? (
              <h3 className="mb-3 line-clamp-2 text-lg font-black leading-snug text-foreground lg:mb-4 lg:text-xl lg:leading-tight">
                {product.name}
              </h3>
            ) : null}
          </Link>

          {specItems.length > 0 ? (
            specsStyle === "TAGS" ? (
              <div className="mb-4 flex flex-wrap gap-1.5 border-y border-border/70 py-3 lg:mb-5 lg:py-4">
                {specItems.map((item) => (
                  <Badge
                    key={item.key}
                    variant="secondary"
                    className="max-w-full truncate rounded-sm border-0 px-2 py-1 text-[11px] font-medium text-muted-foreground sm:text-xs"
                    title={item.label}
                  >
                    {item.value}
                  </Badge>
                ))}
              </div>
            ) : (
              <div
                className={cn(
                  "mb-4 gap-x-1.5 gap-y-2.5 border-y border-border/70 py-3 text-xs text-muted-foreground sm:text-sm lg:mb-5 lg:gap-x-2 lg:gap-y-3 lg:py-4",
                  specsGridClassName(
                    Math.max(specsGridCount, specItems.length),
                    isList
                  )
                )}
              >
                {specItems.map((item) => (
                  <p
                    key={item.key}
                    className="flex min-w-0 items-center gap-1.5"
                    title={item.label}
                  >
                    <LuTag
                      className="size-3.5 shrink-0 text-muted-foreground/80 sm:size-4"
                      aria-hidden
                    />
                    <span className={cn("min-w-0", isList ? "truncate sm:whitespace-normal" : "truncate")}>
                      {item.value}
                    </span>
                  </p>
                ))}
              </div>
            )
          ) : null}

          <div className="mt-auto grid gap-3">
            {showPrice ? (
              <CardPriceBlock
                price={price}
                priceHint={product.priceHint}
                struckLabel={product.struckLabel}
                priceLines={product.priceLines}
                locale={locale}
                currencyDisplayMode={currencyDisplayMode}
                financingLabel={product.financingLabel}
                financingAmountLabel={product.financingAmountLabel}
                layout={layout}
              />
            ) : null}
            <Button asChild className="w-full">
              <Link href={product.href}>
                <span className="text-sm font-medium">{t("details")}</span>
                <LuChevronRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
