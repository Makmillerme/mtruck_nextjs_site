# Related nested carousel: photo drag isolation (2026-11-05)

Problem: on PDP related row, drag on ProductCard image moved the **product** Embla, not the photo gallery.

## Fix
- `PhotoCarousel` (multi): `data-photo-carousel` marker.
- `ProductRelatedCarousel`: `watchDrag` returns false when event target is inside `[data-photo-carousel]` so parent does not steal horizontal drag.
- Wheel-to-advance photos was added then **removed** per user request — no mouse-wheel photo scroll.

Files: `components/media/photo-carousel.tsx`, `components/single-product/product-related-carousel.tsx`.
