import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Container,
  ShieldCheck,
  Truck,
  Van,
} from "lucide-react";

export type CategoryId =
  | "tractors"
  | "semitrailers"
  | "containers"
  | "vans"
  | "special";

export type StatusFilter = "all" | "in_stock" | "transit";

export type FinderCategory = {
  id: CategoryId;
  icon: LucideIcon;
  baseCount: number;
};

export type FinderBrand = {
  id: string;
  label: string;
};

export const FINDER_CATEGORIES: readonly FinderCategory[] = [
  { id: "tractors", icon: Truck, baseCount: 28 },
  { id: "semitrailers", icon: Boxes, baseCount: 16 },
  { id: "containers", icon: Container, baseCount: 9 },
  { id: "vans", icon: Van, baseCount: 14 },
  { id: "special", icon: ShieldCheck, baseCount: 7 },
] as const;

export const FINDER_BRANDS: readonly FinderBrand[] = [
  { id: "daf", label: "DAF" },
  { id: "scania", label: "Scania" },
  { id: "volvo", label: "Volvo" },
  { id: "man", label: "MAN" },
  { id: "mercedes", label: "Mercedes-Benz" },
] as const;

export const FINDER_STATUS: readonly StatusFilter[] = [
  "all",
  "in_stock",
  "transit",
] as const;

/** Deterministic mock count until Prisma vehicle taxonomy exists. */
export function getMockOfferCount(
  categoryId: CategoryId,
  brandId: string | null,
  status: StatusFilter
): number {
  const category = FINDER_CATEGORIES.find((item) => item.id === categoryId);
  let count = category?.baseCount ?? 0;

  if (brandId) {
    const brandIndex = FINDER_BRANDS.findIndex((b) => b.id === brandId);
    const factor = 0.35 + ((brandIndex + 1) % 5) * 0.08;
    count = Math.max(1, Math.round(count * factor));
  }

  if (status === "in_stock") {
    count = Math.max(1, Math.round(count * 0.62));
  } else if (status === "transit") {
    count = Math.max(1, Math.round(count * 0.38));
  }

  return count;
}

/** Finder params use `make`/`status`/`category` so they do not clash with
 *  catalog `brand` (company) filter until vehicle taxonomy exists. */
export function buildProductsHref(
  categoryId: CategoryId,
  brandId: string | null,
  status: StatusFilter
): string {
  const params = new URLSearchParams();
  params.set("category", categoryId);
  if (brandId) params.set("make", brandId);
  if (status !== "all") params.set("status", status);
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}
