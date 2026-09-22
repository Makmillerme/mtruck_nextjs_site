# PhotoCarousel (shared)

**File:** `components/media/photo-carousel.tsx`

## Variants
- `card` — aspect 4/3, arrows + dots, optional `href` on slides, hover zoom
- `page` — same stage + thumbnail strip (aria-current only on selected)

## Props
- `startIndex?: number` — Embla start + scrollTo (admin gallery thumb click)

## Surfaces
- VehicleCard preview
- ProductsList (via VehicleCard)
- PDP product gallery
- ui-lab blocks
- Admin product sheet: `ProductImageGalleryField` (card + Reorder thumbs + add)

## Hover jump fix (2026-09)
Card preview shifted left on hover because:
1. shadcn CarouselContent default `-ml-4` / Item `pl-4` not reliably cancelled → force `!ml-0` / `!pl-0`
2. `group-hover:scale-105` applied to **all** Embla slides → zoom only on **active** slide (`i === index`)
3. Isolate scale inside `overflow-hidden` wrappers + `origin-center`

Do not rely on `-ml-0` alone; use important overrides for flush full-bleed slides.