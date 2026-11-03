## Fix 2026-11-03 — PDP single-photo gallery height

When product has 1 image, PhotoCarousel early-return used only `aspect-[4/3]`. Hero `lg:items-stretch` made buy-box taller → dead gap under the photo (gallery looked «broken»).

### Fix
- `photo-carousel.tsx`: page + single → `aspect-[4/3] h-full min-h-0` (aspect for mobile intrinsic height; h-full fills stretched desktop column)
- `product-gallery.tsx`: single root `flex h-full` + carousel `flex-1`
- PDP / ui-lab wrappers: `flex h-full min-h-0 … overflow-hidden`

Verified MAN TGX (`beca376d-…`): img.h === buy-box.h (531), gapUnderImg 0, bottomsMatch.
