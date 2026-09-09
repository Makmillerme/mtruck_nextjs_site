import FavoriteToggleButton from "@/components/products/FavoriteToggleButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { formatCurrency, formatMileage } from "@/utils/format";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ChevronRight,
  Leaf,
  Route,
  Settings2,
  ShieldCheck,
} from "lucide-react";

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
}): VehicleCardModel {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
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

const favoriteBtnClass =
  "size-9 overflow-hidden rounded-full border-0 bg-white p-0 shadow-sm hover:bg-white";

export default async function VehicleCard({
  vehicle,
  priority = false,
  favoriteId,
  isAuthenticated,
}: {
  vehicle: VehicleCardModel;
  priority?: boolean;
  favoriteId?: string | null;
  isAuthenticated?: boolean;
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

  return (
    <article className="group h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-all duration-300 hover:shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Link href={vehicle.href} className="absolute inset-0 block">
            <Image
              src={vehicle.image}
              alt={vehicle.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 899px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-2.5 sm:p-3">
            <Badge
              variant="secondary"
              className="pointer-events-none shrink gap-1.5 rounded-full border-0 bg-white/90 px-2.5 py-1 text-[11px] font-semibold leading-none text-foreground shadow-sm backdrop-blur-sm hover:bg-white/90 sm:px-3 sm:py-1.5 sm:text-xs"
            >
              <span
                className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[status])}
                aria-hidden
              />
              <span className="whitespace-nowrap">{t(`status.${status}`)}</span>
            </Badge>
            <div className="pointer-events-auto shrink-0">
              <FavoriteToggleButton
                productId={vehicle.id}
                className={favoriteBtnClass}
                favoriteId={favoriteId}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 min-[900px]:p-4 lg:p-5">
          <Link href={vehicle.href} className="block">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
              {subtitleParts.join(" • ")}
            </p>
            <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-snug text-foreground min-[900px]:line-clamp-1 lg:mb-4 lg:text-xl lg:leading-tight">
              {vehicle.name}
            </h3>
          </Link>

          <div className="mb-4 grid grid-cols-2 gap-x-1.5 gap-y-2.5 border-y border-border/70 py-3 text-xs text-muted-foreground sm:text-sm lg:mb-5 lg:gap-x-2 lg:gap-y-3 lg:py-4">
            <p className="flex min-w-0 items-center gap-1.5">
              <Route className="size-3.5 shrink-0 text-muted-foreground/80 sm:size-4" aria-hidden />
              <span className="truncate">{mileageLabel}</span>
            </p>
            <p className="flex min-w-0 items-center gap-1.5">
              <Settings2 className="size-3.5 shrink-0 text-muted-foreground/80 sm:size-4" aria-hidden />
              <span className="truncate">{transmission}</span>
            </p>
            <p className="flex min-w-0 items-center gap-1.5">
              <Leaf className="size-3.5 shrink-0 text-muted-foreground/80 sm:size-4" aria-hidden />
              <span className="truncate">{euro}</span>
            </p>
            <p className="flex min-w-0 items-center gap-1.5">
              <ShieldCheck className="size-3.5 shrink-0 text-muted-foreground/80 sm:size-4" aria-hidden />
              <span className="truncate">{feature}</span>
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <p className="truncate text-xl font-extrabold tracking-tight text-foreground lg:text-2xl">
                {price}
              </p>
              <p className="text-xs text-muted-foreground">{t("priceHint")}</p>
            </div>
            <Button
              asChild
              className="h-10 w-full shrink-0 gap-1.5 rounded-xl px-3 transition-all duration-300 xl:h-11 xl:w-auto group-hover:xl:px-4"
            >
              <Link href={vehicle.href}>
                <span className="text-sm font-medium">{t("details")}</span>
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
