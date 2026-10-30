"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PhotoCarouselImage } from "@/components/media/photo-carousel";
import { useTranslations } from "next-intl";
import {
  LuChevronLeft,
  LuChevronRight,
  LuMinus,
  LuPlus,
  LuRotateCcw,
} from "react-icons/lu";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

function clampPan(
  x: number,
  y: number,
  scale: number,
  stageW: number,
  stageH: number
) {
  if (scale <= MIN_ZOOM) return { x: 0, y: 0 };
  const maxX = Math.max(0, (stageW * (scale - 1)) / 2);
  const maxY = Math.max(0, (stageH * (scale - 1)) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, x)),
    y: Math.min(maxY, Math.max(-maxY, y)),
  };
}

export default function ProductLightbox({
  images,
  open,
  startIndex = 0,
  onOpenChange,
}: {
  images: PhotoCarouselImage[];
  open: boolean;
  startIndex?: number;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Product");
  const slides = images.filter((item) => Boolean(item.src));
  const safeStart = Math.min(
    Math.max(0, startIndex),
    Math.max(0, slides.length - 1)
  );
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(safeStart);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  zoomRef.current = zoom;
  const stageRef = useRef<HTMLDivElement | null>(null);

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const bumpZoom = useCallback((delta: number) => {
    setZoom((current) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + delta));
      const rect = stageRef.current?.getBoundingClientRect();
      setOffset((prev) =>
        clampPan(prev.x, prev.y, next, rect?.width ?? 0, rect?.height ?? 0)
      );
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    setIndex(safeStart);
    resetZoom();
  }, [open, safeStart, resetZoom]);

  useEffect(() => {
    if (!api || !open) return;
    api.scrollTo(safeStart, true);
  }, [api, open, safeStart]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setIndex(api.selectedScrollSnap());
      resetZoom();
    };
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, resetZoom]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        resetZoom();
        api?.scrollPrev();
      }
      if (event.key === "ArrowRight") {
        resetZoom();
        api?.scrollNext();
      }
      if (event.key === "+" || event.key === "=") bumpZoom(ZOOM_STEP);
      if (event.key === "-") bumpZoom(-ZOOM_STEP);
      if (event.key === "0") resetZoom();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, api, bumpZoom, resetZoom]);

  if (slides.length === 0) return null;

  function onWheel(event: ReactWheelEvent) {
    event.preventDefault();
    bumpZoom(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
  }

  function onPointerDown(event: ReactPointerEvent) {
    if (zoomRef.current <= MIN_ZOOM) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  }

  function onPointerMove(event: ReactPointerEvent) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = stageRef.current?.getBoundingClientRect();
    setOffset(
      clampPan(
        drag.originX + (event.clientX - drag.startX),
        drag.originY + (event.clientY - drag.startY),
        zoomRef.current,
        rect?.width ?? 0,
        rect?.height ?? 0
      )
    );
  }

  function onPointerUp(event: ReactPointerEvent) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  function onTouchStart(event: ReactTouchEvent) {
    if (event.touches.length === 2) {
      const [a, b] = [event.touches[0]!, event.touches[1]!];
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchRef.current = { distance, zoom: zoomRef.current };
    }
  }

  function onTouchMove(event: ReactTouchEvent) {
    if (event.touches.length !== 2 || !pinchRef.current) return;
    event.preventDefault();
    const [a, b] = [event.touches[0]!, event.touches[1]!];
    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const ratio = distance / Math.max(1, pinchRef.current.distance);
    const next = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, pinchRef.current.zoom * ratio)
    );
    setZoom(next);
    if (next <= MIN_ZOOM) setOffset({ x: 0, y: 0 });
  }

  function onTouchEnd() {
    pinchRef.current = null;
  }

  function scrollToIndex(next: number) {
    resetZoom();
    api?.scrollTo(next);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Phone: full bleed. sm+: width-led shell — shorter than before so landscape
          // object-contain does not leave a huge letterbox above/below the photo.
          "z-[110] flex h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-[-50%] translate-y-[-50%] flex-col gap-0 overflow-hidden rounded-none border-0 bg-card p-0",
          "sm:h-[min(80vh,36rem)] sm:max-h-[80vh] sm:w-[min(100vw-1.5rem,72rem)] sm:max-w-5xl sm:rounded-sm",
          "lg:h-[min(82vh,40rem)] lg:max-h-[82vh] lg:max-w-6xl"
        )}
      >
        <DialogTitle className="sr-only">{t("galleryDialogTitle")}</DialogTitle>

        <div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[7.5rem_minmax(0,1fr)]">
          {slides.length > 1 ? (
            <div className="hidden min-h-0 overflow-y-auto border-r border-border p-2 md:block">
              <div className="grid gap-2">
                {slides.map((item, i) => (
                  <button
                    key={`lb-thumb-${item.src}-${i}`}
                    type="button"
                    onClick={() => scrollToIndex(i)}
                    aria-label={`${t("galleryThumb")} ${i + 1}`}
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
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-muted">
            <Carousel
              setApi={setApi}
              opts={{
                loop: true,
                align: "start",
                containScroll: false,
                startIndex: safeStart,
                watchDrag: () => zoomRef.current <= MIN_ZOOM,
                dragFree: false,
              }}
              className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-muted"
            >
              <div
                ref={stageRef}
                className={cn(
                  "relative min-h-0 flex-1 touch-pan-y overflow-hidden bg-muted",
                  zoom > 1 && "cursor-grab active:cursor-grabbing"
                )}
                onWheel={onWheel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <CarouselContent className="!ml-0 h-full">
                  {slides.map((item, i) => {
                    const active = i === index;
                    return (
                      <CarouselItem
                        key={`lb-slide-${item.src}-${i}`}
                        className="relative min-w-0 !basis-full !pl-0 h-full"
                      >
                        <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3">
                          <div
                            className="relative h-full w-full"
                            style={
                              active
                                ? {
                                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                                    transition: dragRef.current
                                      ? undefined
                                      : "transform 120ms ease-out",
                                  }
                                : undefined
                            }
                          >
                            <Image
                              src={item.src}
                              alt={item.alt ?? ""}
                              fill
                              sizes="(max-width:768px) 100vw, 72rem"
                              className="pointer-events-none select-none object-contain"
                              priority={active}
                              draggable={false}
                            />
                          </div>
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>

                {slides.length > 1 ? (
                  <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between p-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="pointer-events-auto size-9 rounded-full border-0 bg-card/90 shadow-sm backdrop-blur-sm"
                      aria-label={t("galleryPrev")}
                      onClick={() => {
                        resetZoom();
                        api?.scrollPrev();
                      }}
                    >
                      <LuChevronLeft className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="pointer-events-auto size-9 rounded-full border-0 bg-card/90 shadow-sm backdrop-blur-sm"
                      aria-label={t("galleryNext")}
                      onClick={() => {
                        resetZoom();
                        api?.scrollNext();
                      }}
                    >
                      <LuChevronRight className="size-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </Carousel>

            <div className="flex shrink-0 items-center justify-center gap-2 px-3 py-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9"
                aria-label={t("galleryZoomOut")}
                disabled={zoom <= MIN_ZOOM}
                onClick={() => bumpZoom(-ZOOM_STEP)}
              >
                <LuMinus className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9"
                aria-label={t("galleryZoomReset")}
                disabled={zoom <= MIN_ZOOM}
                onClick={resetZoom}
              >
                <LuRotateCcw className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9"
                aria-label={t("galleryZoomIn")}
                disabled={zoom >= MAX_ZOOM}
                onClick={() => bumpZoom(ZOOM_STEP)}
              >
                <LuPlus className="size-4" />
              </Button>
              <span className="min-w-[3rem] text-center text-xs tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
