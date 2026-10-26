# Related products: grid / carousel + catalog CTA (2026-10-26)

## Canon

| Viewport | UI |
|----------|-----|
| `&lt;lg` | Grid max 4 (`grid-cols-1 sm:grid-cols-2`) + outline Button «Перейти до каталогу» |
| `≥lg` | Embla carousel: `basis-1/3` (3-up), `xl:basis-1/4` (4-up); pool **12**; last slide `CatalogTeaserCard` |

Catalog href via `buildCatalogHref(..., { folders: [categorySlug] })` (same as BreadCrumbs).

## Files

- `components/single-product/catalog-teaser-card.tsx`
- `components/single-product/product-related-carousel.tsx` (setApi + resize reInit for `hidden lg:block`)
- `components/single-product/product-related.tsx` (CSS dual)
- `app/[locale]/products/[id]/page.tsx` — `limit: 12` + catalog props
- i18n `Product.relatedViewCatalog` / `relatedCatalogHint`
- Lab: `ui-lab-pdp.tsx` DEMO_RELATED ×6 + new props

## Verify

- 390: grid 4 + button `/products?folder=furhony`
- 900: 2×2 grid, carousel `display:none`
- 1100: carousel basis 33%
- 1280: basis 25% + teaser at end of track
