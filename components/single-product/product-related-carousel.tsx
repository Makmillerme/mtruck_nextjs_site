"use client";

import { useEffect, useState } from "react";
import CatalogTeaserCard from "@/components/single-product/catalog-teaser-card";
import ProductCard, {
  type ProductCardModel,
} from "@/components/products/product-card";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { overflowFieldGutterClassName } from "@/lib/ui/sheet-field";
import { cn } from "@/lib/utils";

export default function ProductRelatedCarousel({
  title,
  products,
  catalogHref,
  catalogLabel,
  catalogHint,
  isAuthenticated = false,
  prevLabel,
  nextLabel,
}: {
  title: string;
  products: ProductCardModel[];
  catalogHref: string;
  catalogLabel: string;
  catalogHint?: string;
  isAuthenticated?: boolean;
  prevLabel: string;
  nextLabel: string;
}) {
  const [api, setApi] = useState<CarouselApi>();

  // Parent uses `hidden lg:block` — reInit when the track gets a real width.
  useEffect(() => {
    if (!api) return;
    const reInit = () => api.reInit();
    reInit();
    window.addEventListener("resize", reInit);
    return () => window.removeEventListener("resize", reInit);
  }, [api]);

  // basis must subtract gaps: 3×(1/3) + 2×gap-5 > 100% → third card clipped.
  // lg: 2 gaps × 1.25rem; xl: 3 gaps × 1.25rem. p-px on item keeps borders inside clip.
  const slideClassName =
    "box-border p-px pl-px basis-full lg:basis-[calc((100%-2.5rem)/3)] xl:basis-[calc((100%-3.75rem)/4)]";

  const navButtonClassName =
    "static left-auto right-auto top-auto size-9 translate-x-0 translate-y-0 border-border bg-card shadow-md";

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "start",
        containScroll: "trimSnaps",
      }}
      className="relative w-full max-w-full min-w-0"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <CarouselPrevious
            type="button"
            className={navButtonClassName}
            aria-label={prevLabel}
            onPointerDown={(event) => event.stopPropagation()}
          />
          <CarouselNext
            type="button"
            className={navButtonClassName}
            aria-label={nextLabel}
            onPointerDown={(event) => event.stopPropagation()}
          />
        </div>
      </div>

      <CarouselContent
        className="ml-0 gap-5"
        viewportClassName={cn(
          overflowFieldGutterClassName,
          // Clip only X (Embla track). Y visible so group-hover:shadow-xl is not chopped.
          // Overrides carousel default overflow-hidden via tailwind-merge.
          "overflow-x-clip overflow-y-visible px-1 py-3"
        )}
      >
        {products.map((item) => (
          <CarouselItem key={item.id} className={slideClassName}>
            <ProductCard
              product={{ ...item, showStatus: false }}
              isAuthenticated={isAuthenticated}
              showFavorite={false}
            />
          </CarouselItem>
        ))}
        <CarouselItem className={slideClassName}>
          <CatalogTeaserCard
            href={catalogHref}
            label={catalogLabel}
            hint={catalogHint}
          />
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
}
