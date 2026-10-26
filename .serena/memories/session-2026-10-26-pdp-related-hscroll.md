# PDP horizontal scroll on medium (≥lg) — 2026-10-26

## Cause
Related Embla carousel (`ProductRelatedCarousel`, shown `lg+`) sat in a CSS grid without `min-w-0`. Default grid/flex `min-width: auto` let the wide Embla track inflate the section (~1520px vs ~956px content). Page `scrollWidth` grew → horizontal scrollbar. Below `lg` (grid mode) no page overflow.

## Fix
- `product-related.tsx`: `min-w-0` on related `<section>` and on `hidden lg:block` wrapper
- `product-related-carousel.tsx`: `max-w-full min-w-0` on Carousel root (kept `px-11` gutter for arrows)
- `app/[locale]/products/[id]/page.tsx`: `min-w-0` on main PDP `<section>`

Verified at 900 (delta 0, carousel hidden) and 1024 (delta 0, carouselW 956).