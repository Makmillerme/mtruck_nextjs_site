# PhotoCarousel + PDP lightbox (shared)

**Files:** `components/media/photo-carousel.tsx`, `components/single-product/product-gallery.tsx`, `components/single-product/product-lightbox.tsx`

## Variants (PhotoCarousel)
- `card` — aspect 4/3, arrows + dots, optional `href`, hover zoom on active slide
- `page` — stage + thumbnail strip

## PDP gallery canon (2026-10-26)
- Page: Embla swipe; tap (no drag) opens lightbox
- Lightbox: **same Embla** for slides (`object-contain`); L-thumbs md+; zoom CSS on active slide
- Gestures: Embla drag only when `zoom === 1`; pan when zoomed; Ctrl/Meta+wheel zoom; +/−/reset buttons
- Lab: `/ui-lab?section=carousel` → «PDP gallery + lightbox (канон)» via `ProductGallery`

## Surfaces
- VehicleCard, catalog list, PDP, ui-lab blocks/PDP, admin `ProductImageGalleryField`

## Embla flush slides
Force `!ml-0` / `!pl-0`; zoom hover only on active index; `draggable={false}` + `pointer-events-none` on Image.