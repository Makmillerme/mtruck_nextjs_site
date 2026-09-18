"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export type PhotoCarouselImage = {
  src: string;
  alt?: string;
};

function SlideImage({
  src,
  alt,
  sizes,
  priority,
  zoomOnHover,
  href,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  zoomOnHover?: boolean;
  href?: string;
}) {
  const image = (
    <span className="absolute inset-0 block overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
        className={cn(
          "object-cover origin-center will-change-transform",
          zoomOnHover &&
            "transition-transform duration-500 group-hover:scale-105"
        )}
      />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="absolute inset-0 block overflow-hidden">
        {image}
      </Link>
    );
  }

  return <div className="absolute inset-0 overflow-hidden">{image}</div>;
}

export default function PhotoCarousel({
  images,
  variant = "card",
  sizes = "(max-width: 640px) 100vw, (max-width: 899px) 50vw, 33vw",
  priority = false,
  className,
  overlay,
  href,
}: {
  images: PhotoCarouselImage[];
  variant?: "card" | "page";
  sizes?: string;
  priority?: boolean;
  className?: string;
  overlay?: ReactNode;
  href?: string;
}) {
  const slides = images.filter((item) => Boolean(item.src));
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(0);
  const multi = slides.length > 1;

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const scrollTo = useCallback(
    (next: number) => {
      api?.scrollTo(next);
    },
    [api]
  );

  if (slides.length === 0) {
    return (
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden bg-muted",
          className
        )}
      />
    );
  }

  if (!multi) {
    const first = slides[0]!;
    return (
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden bg-muted",
          className
        )}
      >
        <SlideImage
          src={first.src}
          alt={first.alt ?? ""}
          sizes={sizes}
          priority={priority}
          zoomOnHover={variant === "card"}
          href={href}
        />
        {overlay ? (
          <div className="pointer-events-none absolute inset-0 z-10">
            {overlay}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn(variant === "page" && "grid gap-3", className)}>
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start", containScroll: false }}
        className="relative w-full overflow-hidden"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {/* Flush slides: override shadcn default -ml-4 / pl-4 gap pattern */}
          <CarouselContent className="!ml-0 h-full">
            {slides.map((item, i) => (
              <CarouselItem
                key={`${item.src}-${i}`}
                className="min-w-0 !basis-full !pl-0"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <SlideImage
                    src={item.src}
                    alt={item.alt ?? ""}
                    sizes={sizes}
                    priority={priority && i === 0}
                    zoomOnHover={variant === "card" && i === index}
                    href={href}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {overlay ? (
            <div className="pointer-events-none absolute inset-0 z-10">
              {overlay}
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between p-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="pointer-events-auto size-8 rounded-full border-0 bg-background/90 shadow-sm backdrop-blur-sm hover:bg-background"
              aria-label="Previous photo"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                api?.scrollPrev();
              }}
            >
              <LuChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="pointer-events-auto size-8 rounded-full border-0 bg-background/90 shadow-sm backdrop-blur-sm hover:bg-background"
              aria-label="Next photo"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                api?.scrollNext();
              }}
            >
              <LuChevronRight className="size-4" />
            </Button>
          </div>

          {variant === "card" ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={`dot-${i}`}
                  type="button"
                  aria-label={`Photo ${i + 1}`}
                  className={cn(
                    "pointer-events-auto size-1.5 rounded-full transition-colors",
                    i === index
                      ? "bg-background"
                      : "bg-background/50 hover:bg-background/80"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    scrollTo(i);
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </Carousel>

      {variant === "page" ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {slides.map((item, i) => (
            <button
              key={`thumb-${item.src}-${i}`}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index ? true : undefined}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-sm border bg-muted transition-opacity",
                i === index
                  ? "border-foreground ring-1 ring-foreground"
                  : "border-border opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={item.src}
                alt={item.alt ?? ""}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
