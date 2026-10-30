# Related/VehicleCard hover shadow clipped — 2026-10-30

## Cause
`VehicleCard` (and catalog teaser) put `overflow-hidden` on the **same** node as `shadow-sm` / `group-hover:shadow-xl`. CSS clips the element's own box-shadow. Embla viewport `overflow-hidden` + tiny `py-1` also clipped vertical shadow bleed.

## Fix
- `vehicle-card.tsx`: remove overflow-hidden from shadowed shell; clip media with inner `overflow-hidden` + rounded corners.
- `catalog-teaser-card.tsx`: drop overflow-hidden (no media to clip).
- `product-related-carousel.tsx`: viewport `py-6` for Embla vertical shadow room.
