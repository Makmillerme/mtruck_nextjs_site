"use client";

import { useEffect, useState } from "react";
import CatalogTeaserCard from "@/components/single-product/catalog-teaser-card";
import VehicleCard, {
  type VehicleCardModel,
} from "@/components/vehicles/vehicle-card";
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
  vehicles,
  catalogHref,
  catalogLabel,
  catalogHint,
  isAuthenticated = false,
  prevLabel,
  nextLabel,
}: {
  vehicles: VehicleCardModel[];
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

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "start",
        containScroll: "trimSnaps",
      }}
      className="relative w-full max-w-full min-w-0 px-11"
    >
      <CarouselContent
        className="ml-0 gap-5"
        viewportClassName={cn(overflowFieldGutterClassName, "py-1")}
      >
        {vehicles.map((vehicle) => (
          <CarouselItem key={vehicle.id} className={slideClassName}>
            <VehicleCard
              vehicle={{ ...vehicle, showStatus: false }}
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
      <CarouselPrevious
        type="button"
        className="left-0 top-1/2 z-30 hidden size-9 -translate-y-1/2 border-border bg-card pointer-events-auto shadow-md lg:inline-flex"
        aria-label={prevLabel}
        onPointerDown={(event) => event.stopPropagation()}
      />
      <CarouselNext
        type="button"
        className="right-0 top-1/2 z-30 hidden size-9 -translate-y-1/2 border-border bg-card pointer-events-auto shadow-md lg:inline-flex"
        aria-label={nextLabel}
        onPointerDown={(event) => event.stopPropagation()}
      />
    </Carousel>
  );
}
