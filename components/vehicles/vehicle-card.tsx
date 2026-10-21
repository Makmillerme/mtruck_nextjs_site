"use client";

import { CardSignInButton } from "@/components/form/Buttons";
import PhotoCarousel from "@/components/media/photo-carousel";
import FavoriteToggleForm from "@/components/products/FavoriteToggleForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import { useLocale, useTranslations } from "next-intl";
import {
  specsGridClassName,
  type CardPreviewSpecsStyleId,
} from "@/lib/catalog/card-preview";
import { LuChevronRight, LuTag } from "react-icons/lu";

export type VehicleStatus =
  | "PUBLISHED"
  | "RESERVED"
  | "DRAFT"
  | "PREPARING"
  | "SOLD";

export type VehicleCardSpecItem = {
  key: string;
  label: string;
  value: string;
};

export type VehicleCardModel = {
  id: string;
  name: string;
  price: number;
  image: string;
  /** Cover + gallery URLs, unique, cover first */
  images?: string[];
  href: string;
  status?: VehicleStatus;
  year?: number | null;
  location?: string | null;
  categoryLabel?: string | null;
  /** Prefetch subtitle segments (fields + category). */
  subtitleParts?: string[];
  specItems?: VehicleCardSpecItem[];
  specsStyle?: CardPreviewSpecsStyleId;
  specsGridCount?: number;
  showName?: boolean;
  showPrice?: boolean;
  showStatus?: boolean;
  showSubtitle?: boolean;
  showSpecs?: boolean;
};

export function productToVehicle(product: {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: { url: string }[];
  categoryLabel?: string | null;
}): VehicleCardModel {
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

const STATUS_DOT: Record<VehicleStatus, string> = {
  PUBLISHED: "bg-emerald-500",
  RESERVED: "bg-amber-500",
  DRAFT: "bg-slate-400",
  PREPARING: "bg-sky-500",
  SOLD: "bg-red-500",
};

export default function VehicleCard({
  vehicle,
  priority = false,
  favoriteId,
  isAuthenticated,
  layout = "grid",
  showFavorite = true,
}: {
  vehicle: VehicleCardModel;
  priority?: boolean;
  favoriteId?: string | null;
  isAuthenticated?: boolean;
  layout?: "grid" | "list";
  showFavorite?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("VehicleCard");
  const status = vehicle.status ?? "PUBLISHED";
  const price = formatCurrency(vehicle.price, locale);
  const showName = vehicle.showName !== false;
  const showPrice = vehicle.showPrice !== false;
  const showStatus = vehicle.showStatus !== false;
  const showSubtitle = vehicle.showSubtitle !== false;
  const showSpecs = vehicle.showSpecs !== false;
  const specItems = showSpecs ? vehicle.specItems ?? [] : [];
  const specsStyle = vehicle.specsStyle ?? "GRID";
  const specsGridCount = vehicle.specsGridCount ?? specItems.length ?? 4;

  const subtitleParts =
    vehicle.subtitleParts && vehicle.subtitleParts.length > 0
      ? vehicle.subtitleParts
      : [
          vehicle.categoryLabel?.trim() || t("categoryFallback"),
          vehicle.year ? t("year", { year: vehicle.year }) : null,
        ].filter(Boolean);

  const gallery = (vehicle.images?.length ? vehicle.images : [vehicle.image]).map(
    (src) => ({ src, alt: vehicle.name })
  );

  const isList = layout === "list";

  return (
    <article className="group h-full">
      <div
        className={cn(
          "flex h-full overflow-hidden rounded-sm border border-border bg-background shadow-sm transition-shadow duration-500 group-hover:shadow-xl",
          isList ? "flex-col md:flex-row" : "flex-col"
        )}
      >
        <div
          className={cn(
            isList &&
              "relative aspect-[4/3] w-full md:aspect-auto md:w-[min(38%,20rem)] md:shrink-0 md:self-stretch"
          )}
        >
          <PhotoCarousel
            variant="card"
            frame={isList ? "fill" : "ratio"}
            images={gallery}
            href={vehicle.href}
            priority={priority}
            className={isList ? "absolute inset-0 h-full" : undefined}
            sizes={
              isList
                ? "(max-width: 768px) 100vw, 448px"
                : "(max-width: 640px) 100vw, (max-width: 899px) 50vw, 33vw"
            }
            overlay={
              showStatus || showFavorite ? (
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5 sm:p-3">
                  {showStatus ? (
                    <Badge
                      variant="secondary"
                      className="pointer-events-none shrink gap-1.5 rounded-full border-0 bg-background/90 px-2.5 py-1 text-[11px] font-semibold leading-none text-foreground backdrop-blur-sm hover:bg-background/90 sm:px-3 sm:py-1.5 sm:text-xs"
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
                          productId={vehicle.id}
                          favoriteId={favoriteId ?? null}
                        />
                      ) : (
                        <CardSignInButton />
                      )}
                    </div>
                  ) : null}
                </div>
              ) : undefined
            }
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4 lg:p-5">
          <Link href={vehicle.href} className="block">
            {showSubtitle ? (
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">
                {subtitleParts.join(" • ")}
              </p>
            ) : null}
            {showName ? (
              <h3 className="mb-3 line-clamp-2 text-lg font-black leading-snug text-foreground lg:mb-4 lg:text-xl lg:leading-tight">
                {vehicle.name}
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
              <div className="min-w-0">
                <p className="truncate text-xl font-extrabold tracking-tight text-foreground lg:text-2xl">
                  {price}
                </p>
                <p className="text-xs text-muted-foreground">{t("priceHint")}</p>
              </div>
            ) : null}
            <Button asChild className="w-full">
              <Link href={vehicle.href}>
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
