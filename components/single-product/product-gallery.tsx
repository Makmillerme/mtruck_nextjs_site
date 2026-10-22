"use client";

import { useState } from "react";
import PhotoCarousel, {
  type PhotoCarouselImage,
} from "@/components/media/photo-carousel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LuExpand } from "react-icons/lu";

export default function ProductGallery({
  images,
  priority = false,
  className,
  sizes = "(max-width:768px) 100vw,(max-width:1200px) 50vw, 40vw",
}: {
  images: PhotoCarouselImage[];
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const t = useTranslations("Product");
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  function openAt(index: number) {
    setStartIndex(index);
    setOpen(true);
  }

  const zoomHint = (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-end p-2.5">
      <span className="inline-flex items-center gap-1.5 rounded-sm bg-background/90 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-sm">
        <LuExpand className="size-3.5" aria-hidden />
        {t("galleryExpand")}
      </span>
    </div>
  );

  return (
    <>
      <PhotoCarousel
        variant="page"
        images={images}
        priority={priority}
        sizes={sizes}
        className={cn("overflow-hidden rounded-sm", className)}
        onImageClick={openAt}
        overlay={zoomHint}
        prevLabel={t("galleryPrev")}
        nextLabel={t("galleryNext")}
        thumbLabel={t("galleryThumb")}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[95vh] w-[min(100vw-1.5rem,72rem)] overflow-y-auto border-0 bg-background p-3 sm:max-w-5xl sm:p-4">
          <DialogTitle className="sr-only">{t("galleryDialogTitle")}</DialogTitle>
          <PhotoCarousel
            variant="page"
            images={images}
            startIndex={startIndex}
            sizes="(max-width:768px) 100vw, 72rem"
            className="overflow-hidden rounded-sm"
            prevLabel={t("galleryPrev")}
            nextLabel={t("galleryNext")}
            thumbLabel={t("galleryThumb")}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
