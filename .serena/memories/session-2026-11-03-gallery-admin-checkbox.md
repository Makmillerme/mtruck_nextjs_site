## Fixes 2026-11-03 — PDP gallery overflow + admin checkbox columns

### Gallery overlap (MAN TGX PDP)
Cause: CSS grid item `min-width: auto` let PhotoCarousel/intrinsic image blow past the left column over the buy-box.

Changes:
- `app/[locale]/products/[id]/page.tsx`: wrap gallery in `min-w-0 w-full overflow-hidden`; `ProductBuyBox className="min-w-0"`
- `components/single-product/product-gallery.tsx`: `min-w-0 w-full overflow-hidden` on carousel
- `components/media/photo-carousel.tsx`: stage + multi root `min-w-0 w-full`
- `components/dev/ui-lab-pdp.tsx`: same wrapper pattern

Verified via CDP on `/products/beca376d-…`: col0 right 589, buy-box left 637, zero overflowers; title fully readable.

### Admin products table checkbox fields
`formatSpecCell` (`lib/catalog/spec-display.ts`) lacked `MULTI_SELECT` (always fell through to empty) and treated BOOLEAN false as empty cell (`columnsEmptyCell` passed as noLabel).

Fix:
- MULTI_SELECT → join `optionLabels`
- BOOLEAN → Так / Ні / — (`yesLabel`, `noLabel`, `emptyLabel`)
- i18n `columnsNo` in uk/en/de
- admin-products-view call site updated

Verified: enabling «Комплектація» (MULTI_SELECT) shows ABS, ASR/ESP, Кондиціонер, … in table cells.

Note: «Особливість» is TEXT, not BOOLEAN; equipment checklist is MULTI_SELECT checkbox UI.
