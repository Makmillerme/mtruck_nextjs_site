import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FavoriteToggleButton from "@/components/products/FavoriteToggleButton";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { formatCurrency, formatMileage } from "@/utils/format";
import type { Product } from "@prisma/client";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Calendar, Fuel, Gauge, MapPin } from "lucide-react";

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
};

export function productToVehicle(product: Product): VehicleCardModel {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    href: `/products/${product.id}`,
    status: "PUBLISHED",
  };
}

const STATUS_CLASS: Record<VehicleStatus, string> = {
  PUBLISHED: "border-transparent bg-primary text-primary-foreground hover:bg-primary",
  RESERVED: "border-transparent bg-[#E2E8F0] text-[#1E293B] hover:bg-[#E2E8F0]",
  DRAFT: "border-transparent bg-[#E2E8F0] text-[#1E293B] hover:bg-[#E2E8F0]",
  PREPARING: "border-transparent bg-[#E2E8F0] text-[#1E293B] hover:bg-[#E2E8F0]",
  SOLD: "border-transparent bg-[#EF4444] text-white hover:bg-[#EF4444]",
};

export default async function VehicleCard({
  vehicle,
}: {
  vehicle: VehicleCardModel;
}) {
  const locale = await getLocale();
  const t = await getTranslations("VehicleCard");
  const status = vehicle.status ?? "PUBLISHED";
  const euro = vehicle.euro?.trim() || t("euroFallback");
  const price = formatCurrency(vehicle.price, locale);

  return (
    <article className="group h-full">
      <Card className="flex h-full flex-col overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Link href={vehicle.href} className="absolute inset-0">
            <Image
              src={vehicle.image}
              alt={vehicle.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <div className="absolute left-3 top-3 z-10 rounded-md bg-white/90 shadow-sm">
            <FavoriteToggleButton productId={vehicle.id} />
          </div>
          <Badge
            className={cn(
              "absolute right-3 top-3 z-10 rounded-full px-2 py-0.5 text-xs font-medium shadow-none",
              STATUS_CLASS[status]
            )}
          >
            {t(`status.${status}`)}
          </Badge>
        </div>
        <CardContent className="flex flex-1 flex-col space-y-4 p-4">
          <Link href={vehicle.href} className="block">
            <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
              {vehicle.name}
            </h3>
            <p className="mt-1 font-mono text-2xl font-black text-primary">
              {price}
            </p>
          </Link>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            {vehicle.year ? (
              <p className="flex items-center gap-1.5">
                <Calendar className="size-4 shrink-0" aria-hidden />
                {t("year", { year: vehicle.year })}
              </p>
            ) : null}
            {vehicle.mileage != null ? (
              <p className="flex items-center gap-1.5">
                <Gauge className="size-4 shrink-0" aria-hidden />
                <span className="font-mono">{formatMileage(vehicle.mileage)}</span>
              </p>
            ) : null}
            <p className="flex items-center gap-1.5">
              <Fuel className="size-4 shrink-0" aria-hidden />
              {euro}
            </p>
            {vehicle.location ? (
              <p className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{vehicle.location}</span>
              </p>
            ) : null}
          </div>
          <Button asChild className="mt-auto w-full">
            <Link href={vehicle.href}>{t("details")}</Link>
          </Button>
        </CardContent>
      </Card>
    </article>
  );
}
