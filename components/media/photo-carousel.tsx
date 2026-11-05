"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
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
        draggable={false}
        className={cn(
          "pointer-events-none select-none object-cover origin-center will-change-transform",
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
  frame = "ratio",
  sizes = "(max-width: 640px) 100vw, (max-width: 899px) 50vw, 33vw",
  priority = false,
  className,
  overlay,
  href,
  startIndex = 0,
  onImageClick,
  prevLabel = "Previous photo",
  nextLabel = "Next photo",
  thumbLabel = "Show photo",
}: {
  images: PhotoCarouselImage[];
  variant?: "card" | "page";
  /** `ratio` = aspect 4/3; `fill` = stretch to parent height (list cards). */
  frame?: "ratio" | "fill";
  sizes?: string;
  priority?: boolean;
  className?: string;
  overlay?: ReactNode;
  href?: string;
  /** Initial Embla snap (admin gallery thumb click). */
  startIndex?: number;
  /** PDP lightbox: click active stage (ignored when `href` is set). */
  onImageClick?: (index: number) => void;
  prevLabel?: string;
  nextLabel?: string;
  thumbLabel?: string;
}) {
  const slides = images.filter((item) => Boolean(item.src));
  const [api, setApi] = useState<CarouselApi>();
  const safeStart = Math.min(
    Math.max(0, startIndex),
    Math.max(0, slides.length - 1)
  );
  const [index, setIndex] = useState(safeStart);
  const multi = slides.length > 1;
  /** Ignore stage click after a swipe/drag so lightbox does not steal the gesture. */
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef(false);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);
  const prevThumbIndexRef = useRef(safeStart);
  const DRAG_THRESHOLD_PX = 8;
  const stageClass =
    frame === "fill"
      ? "relative h-full min-h-0 w-full min-w-0 overflow-hidden bg-muted"
      : "relative aspect-[4/3] w-full min-w-0 overflow-hidden bg-muted";
  const slideFrameClass =
    frame === "fill" || variant === "page"
      ? "absolute inset-0 overflow-hidden"
      : "relative aspect-[4/3] w-full overflow-hidden";

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

  useEffect(() => {
    if (!api) return;
    api.scrollTo(safeStart, true);
  }, [api, safeStart]);

  /** Advance the strip ~1.5 thumbs before the active card hits the visible edge. */
  useEffect(() => {
    if (variant !== "page" || !multi) return;
    const strip = thumbStripRef.current;
    if (!strip) return;

    const prev = prevThumbIndexRef.current;
    prevThumbIndexRef.current = index;
    const last = slides.length - 1;
    const delta = index - prev;
    const goingRight = delta === 1 || (prev === last && index === 0);
    const goingLeft = delta === -1 || (prev === 0 && index === last);

    const frame = requestAnimationFrame(() => {
      const thumb = strip.querySelector<HTMLElement>(
        `[data-thumb-index="${index}"]`
      );
      if (!thumb) return;

      const gap = 8;
      const step = thumb.offsetWidth + gap;
      const lead = step * 1.5;
      const stripRect = strip.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();
      const thumbLeft = thumbRect.left - stripRect.left + strip.scrollLeft;
      const thumbRight = thumbLeft + thumbRect.width;
      const viewLeft = strip.scrollLeft;
      const viewRight = viewLeft + strip.clientWidth;
      const maxScroll = Math.max(0, strip.scrollWidth - strip.clientWidth);
      const distRight = viewRight - thumbRight;
      const distLeft = thumbLeft - viewLeft;

      if (goingRight && distRight < lead) {
        strip.scrollTo({
          left: Math.min(maxScroll, thumbRight + lead - strip.clientWidth),
          behavior: "smooth",
        });
      } else if (goingLeft && distLeft < lead) {
        strip.scrollTo({
          left: Math.max(0, thumbLeft - lead),
          behavior: "smooth",
        });
      } else if (!goingRight && !goingLeft) {
        // Direct thumb jump: only bring into view if clipped.
        if (thumbRight > viewRight) {
          strip.scrollTo({
            left: Math.min(maxScroll, thumbRight - strip.clientWidth + gap),
            behavior: "smooth",
          });
        } else if (thumbLeft < viewLeft) {
          strip.scrollTo({
            left: Math.max(0, thumbLeft - gap),
            behavior: "smooth",
          });
        }
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [index, variant, multi, slides.length]);

  const scrollTo = useCallback(
    (next: number) => {
      api?.scrollTo(next);
    },
    [api]
  );

  function onStagePointerDown(event: ReactPointerEvent) {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    didDragRef.current = false;
  }

  function onStagePointerMove(event: ReactPointerEvent) {
    const start = pointerStartRef.current;
    if (!start || didDragRef.current) return;
    const dx = Math.abs(event.clientX - start.x);
    const dy = Math.abs(event.clientY - start.y);
    if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) {
      didDragRef.current = true;
    }
  }

  function onStageClick() {
    if (!onImageClick || href || didDragRef.current) return;
    onImageClick(index);
  }

  if (slides.length === 0) {
    return <div className={cn(stageClass, className)} />;
  }

  if (!multi) {
    const first = slides[0]!;
    /** PDP single photo: fill stretched hero column (aspect alone leaves a dead gap under the frame). */
    const pageSingleClass =
      variant === "page"
        ? // Mobile: intrinsic 4/3. lg+: fill column matched to buybox.
          "relative aspect-[4/3] w-full min-w-0 overflow-hidden bg-muted lg:aspect-auto lg:h-full lg:min-h-0"
        : stageClass;
    return (
      <div
        className={cn(
          pageSingleClass,
          className,
          onImageClick && !href && "cursor-zoom-in"
        )}
        onClick={
          onImageClick && !href
            ? () => onImageClick(0)
            : undefined
        }
        onKeyDown={
          onImageClick && !href
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onImageClick(0);
                }
              }
            : undefined
        }
        role={onImageClick && !href ? "button" : undefined}
        tabIndex={onImageClick && !href ? 0 : undefined}
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
    <div
      className={cn(
        "min-w-0 w-full",
        // Page: column matches buybox height; stage flex-1, thumbs shrink-0 (no stretched gap).
        variant === "page" && "flex min-h-0 flex-col gap-3 lg:h-full",
        frame === "fill" && "h-full min-h-0",
        className
      )}
    >
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
          align: "start",
          containScroll: false,
          startIndex: safeStart,
          watchDrag: true,
          dragFree: false,
        }}
        className={cn(
          "relative w-full overflow-hidden",
          variant === "page" &&
            "aspect-[4/3] lg:aspect-auto lg:min-h-0 lg:flex-1",
          frame === "fill" && "h-full"
        )}
      >
        <div
          className={cn(
            variant === "page"
              ? "relative h-full min-h-0 w-full min-w-0 overflow-hidden bg-muted"
              : stageClass,
            "select-none",
            onImageClick && !href && "cursor-zoom-in"
          )}
          onPointerDown={onImageClick && !href ? onStagePointerDown : undefined}
          onPointerMove={onImageClick && !href ? onStagePointerMove : undefined}
          onClick={onImageClick && !href ? onStageClick : undefined}
        >
          {/* Flush slides: override shadcn default -ml-4 / pl-4 gap pattern */}
          <CarouselContent className="!ml-0 h-full">
            {slides.map((item, i) => (
              <CarouselItem
                key={`${item.src}-${i}`}
                className={cn(
                  "relative min-w-0 !basis-full !pl-0",
                  (frame === "fill" || variant === "page") && "h-full"
                )}
              >
                <div className={slideFrameClass}>
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
              className="pointer-events-auto size-8 rounded-full border-0 bg-card/90 shadow-sm backdrop-blur-sm hover:bg-card"
              aria-label={prevLabel}
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
              className="pointer-events-auto size-8 rounded-full border-0 bg-card/90 shadow-sm backdrop-blur-sm hover:bg-card"
              aria-label={nextLabel}
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
                  aria-label={`${thumbLabel} ${i + 1}`}
                  className={cn(
                    "pointer-events-auto size-1.5 rounded-full transition-colors",
                    i === index
                      ? "bg-card"
                      : "bg-card/50 hover:bg-card/80"
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
        <div
          ref={thumbStripRef}
          className="flex min-w-0 shrink-0 items-start gap-2 overflow-x-auto overflow-y-hidden p-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((item, i) => (
            <button
              key={`thumb-${item.src}-${i}`}
              type="button"
              data-thumb-index={i}
              onClick={() => scrollTo(i)}
              aria-label={`${thumbLabel} ${i + 1}`}
              aria-current={i === index ? true : undefined}
              className={cn(
                // Visible slots: 3 / 4 / 5 of strip width; items-start + h-auto so aspect 4/3 is not stretched.
                "relative aspect-[4/3] h-auto w-[calc((100%-0.5rem*2)/3)] shrink-0 self-start overflow-hidden rounded-sm border bg-muted transition-opacity",
                "sm:w-[calc((100%-0.5rem*3)/4)] md:w-[calc((100%-0.5rem*4)/5)]",
                i === index
                  ? "border-foreground ring-1 ring-foreground"
                  : "border-border opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={item.src}
                alt={item.alt ?? ""}
                fill
                sizes="(max-width:640px) 33vw, (max-width:768px) 25vw, 20vw"
                className="object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
