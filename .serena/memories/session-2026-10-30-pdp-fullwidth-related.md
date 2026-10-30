# PDP full-width related + details — 2026-10-30

## Related carousel

- Nav arrows moved beside «Схожі товари» title (header row), not over/side of track.
- Removed `px-11` on Carousel — track is full content width.
- `CarouselPrevious/Next` use `static left-auto …` overrides of absolute defaults.
- Desktop title lives inside `ProductRelatedCarousel`; mobile keeps own h2 + grid.

## Details tabs

- Removed `page-shell-reading` from `ProductDetailsTabs` — card is full page width (reading shell unused on PDP for now).
