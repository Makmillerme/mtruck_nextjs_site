"use client";

import { useState } from "react";
import PhotoCarousel, {
  type PhotoCarouselImage,
} from "@/components/media/photo-carousel";
import ProductLightbox from "@/components/single-product/product-lightbox";
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
      <span className="inline-flex items-center gap-1.5 rounded-sm bg-card/90 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-sm">
        <LuExpand className="size-3.5" aria-hidden />
        {t("galleryExpand")}
      </span>
    </div>
  );

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-col">
      <PhotoCarousel
        variant="page"
        images={images}
        priority={priority}
        sizes={sizes}
        className={cn(
          "min-h-0 min-w-0 w-full overflow-hidden rounded-sm",
          className
        )}
        onImageClick={openAt}
        overlay={zoomHint}
        prevLabel={t("galleryPrev")}
        nextLabel={t("galleryNext")}
        thumbLabel={t("galleryThumb")}
      />

      <ProductLightbox
        images={images}
        open={open}
        startIndex={startIndex}
        onOpenChange={setOpen}
      />
    </div>
  );
}
