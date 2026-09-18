import FavoriteToggleButton from "@/components/products/FavoriteToggleButton";
import PhotoCarousel from "@/components/media/photo-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { formatCurrency, formatMileage } from "@/utils/format";
import { getLocale, getTranslations } from "next-intl/server";
import {
  LuChevronRight,
  LuLeaf,
  LuRoute,
  LuSettings2,
  LuShieldCheck,
} from "react-icons/lu";

export type VehicleStatus =
  | "PUBLISHED"
  | "RESERVED"
  | "DRAFT"
  | "PREPARING"
  | "SOLD";

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
  mileage?: number | null;
  euro?: string | null;
  location?: string | null;
  categoryLabel?: string | null;
  transmission?: string | null;
  feature?: string | null;
};

export function productToVehicle(product: {
  id: string;
  name: string;
  price: number;
  image: string;
  company: string;
  images?: { url: string }[];
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
    categoryLabel: product.company,
  };
}

const STATUS_DOT: Record<VehicleStatus, string> = {
  PUBLISHED: "bg-emerald-500",
  RESERVED: "bg-amber-500",
  DRAFT: "bg-slate-400",
  PREPARING: "bg-sky-500",
  SOLD: "bg-red-500",
};

export default async function VehicleCard({
  vehicle,
  priority = false,
  favoriteId,
  isAuthenticated,
  layout = "grid",
}: {
  vehicle: VehicleCardModel;
  priority?: boolean;
  favoriteId?: string | null;
  isAuthenticated?: boolean;
  layout?: "grid" | "list";
}) {
  const locale = await getLocale();
  const t = await getTranslations("VehicleCard");
  const status = vehicle.status ?? "PUBLISHED";
  const euro = vehicle.euro?.trim() || t("euroFallback");
  const price = formatCurrency(vehicle.price, locale);
  const mileageLabel =
    vehicle.mileage != null
      ? formatMileage(vehicle.mileage)
      : t("mileageFallback");
  const transmission = vehicle.transmission?.trim() || t("transmissionFallback");
  const feature = vehicle.feature?.trim() || t("featureFallback");

  const subtitleParts = [
    vehicle.year ? t("year", { year: vehicle.year }) : null,
    vehicle.categoryLabel?.trim() || t("categoryFallback"),
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
        <PhotoCarousel
          variant="card"
          images={gallery}
          href={vehicle.href}
          priority={priority}
          className={isList ? "md:w-72 md:shrink-0" : undefined}
          sizes={
            isList
              ? "(max-width: 768px) 100vw, 288px"
              : "(max-width: 640px) 100vw, (max-width: 899px) 50vw, 33vw"
          }
          overlay={
            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5 sm:p-3">
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
              <div className="pointer-events-auto shrink-0">
                <FavoriteToggleButton
                  productId={vehicle.id}
                  favoriteId={favoriteId}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          }
        />

        <div className="flex min-w-0 flex-1 flex-col p-4 lg:p-5">
          <Link href={vehicle.href} className="block">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">
              {subtitleParts.join(" • ")}
            </p>
            <h3 className="mb-3 line-clamp-2 text-lg font-black leading-snug text-foreground lg:mb-4 lg:text-xl lg:leading-tight">
              {vehicle.name}
            </h3>
          </Link>

          <div className="mb-4 grid grid-cols-2 gap-x-1.5 gap-y-2.5 border-y border-border/70 py-3 text-xs text-muted-foreground sm:text-sm lg:mb-5 lg:gap-x-2 lg:gap-y-3 lg:py-4">
            <p className="flex min-w-0 items-center gap-1.5">
              <LuRoute
                className="size-3.5 shrink-0 text-muted-foreground/80 sm:size-4"
                aria-hidden
              />
              <span className="truncate">{mileageLabel}</span>
            </p>
            <p className="flex min-w-0 items-center gap-1.5">
              <LuSettings2
                className="size-3.5 shrink-0 text-muted-foreground/80 sm:size-4"
                aria-hidden
              />
              <span className="truncate">{transmission}</span>
            </p>
            <p className="flex min-w-0 items-center gap-1.5">
              <LuLeaf
                className="size-3.5 shrink-0 text-muted-foreground/80 sm:size-4"
                aria-hidden
              />
              <span className="truncate">{euro}</span>
            </p>
            <p className="flex min-w-0 items-center gap-1.5">
              <LuShieldCheck
                className="size-3.5 shrink-0 text-muted-foreground/80 sm:size-4"
                aria-hidden
              />
              <span className="truncate">{feature}</span>
            </p>
          </div>

          <div className="mt-auto grid gap-3">
            <div className="min-w-0">
              <p className="truncate text-xl font-extrabold tracking-tight text-foreground lg:text-2xl">
                {price}
              </p>
              <p className="text-xs text-muted-foreground">{t("priceHint")}</p>
            </div>
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
