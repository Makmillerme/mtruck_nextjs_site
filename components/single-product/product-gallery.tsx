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
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  function openAt(index: number) {
    setStartIndex(index);
    setOpen(true);
  }

  return (
    <>
      <PhotoCarousel
        variant="page"
        images={images}
        priority={priority}
        sizes={sizes}
        className={cn("overflow-hidden rounded-sm", className)}
        onImageClick={openAt}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[95vh] w-[min(100vw-1.5rem,72rem)] overflow-y-auto border-0 bg-background p-3 sm:max-w-5xl sm:p-4"
        >
          <DialogTitle className="sr-only">Gallery</DialogTitle>
          <PhotoCarousel
            variant="page"
            images={images}
            startIndex={startIndex}
            sizes="(max-width:768px) 100vw, 72rem"
            className="overflow-hidden rounded-sm"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
