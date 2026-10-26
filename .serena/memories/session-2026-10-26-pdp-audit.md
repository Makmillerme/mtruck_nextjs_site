# PDP audit + fixes (2026-10-26)

## Tools
- next-devtools `get_errors` / `get_page_metadata` / logs
- Browser Actros PDP + Serena code review

## False positives
- Hydration mismatches = only `data-cursor-ref` from Cursor browser (not app bug).
- Old `session.ts` / `next/headers` in client = ui-lab FavoriteToggle (fixed earlier).

## Fixed
1. **Price parity:** VehicleCard → `formatProductPrice` (no cents). Related/catalog match PDP (`72 100 USD`).
2. **Carousel i18n:** VehicleCard passes `Product.galleryPrev/Next/Thumb`; dots use `${thumbLabel} N` (was hardcoded EN `Photo N`).
3. **Spec number format:** `formatSpecDisplay(locale)` with Intl → `390 000 км`; `productWithSpecsToVehicle(..., locale)`; ProductsGrid/List `getLocale()`.
4. **SEO:** `generateMetadata` on PDP → title template `| MTruck`, description, OG image.

## Deferred / OK by design
- No `loading.tsx` (locale soft-nav perf).
- Sticky CTA `lg:hidden` (tablet still sees bar).
- Related heading `text-lg` vs muted uppercase section titles — visual hierarchy, not bug.
- Card `mt-auto` price/CTA stretch — equal card heights.
- `AccountCabinetView` favorites still map without card-preview layout (same pattern as related was).
- Duplicate `RequestCatalogOrder` in buy-box + sticky — two forms, OK.

## RSC map
Page = RSC. Client islands: gallery, lightbox, sticky CTA, share, order, VehicleCard (carousel).
