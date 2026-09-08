# Homepage IA + Category Finder (2026-09-08)

## Homepage section order (canonical)

1. `Hero`
2. `CatalogBlock` (`#catalog`, grid `#inventory`) — unified finder + featured grid
3. `ServicesSection`
4. `ContactSection`

Removed from homepage: TrustStrip (under Hero), FaqSection, PartnershipSection; separate `CategorySelectorSection` / `FeaturedProducts` shells.

## CatalogBlock

See `mem:marketing-catalog-block-2026-09`.
- Finder panel: `CategoryFinderPanel` (client)
- Grid: `CatalogFeaturedGrid` — no titles above cards
- Shell: one `bg-secondary`, `page-container py-16 md:py-24`
- Hero CTAs: `#catalog` / `#inventory`

## Finder data

- `lib/home/category-finder.ts`
- CTA: `/products?category=&make=&status=` (use `make`, not `brand`)
- Status chips same active style as brands

## Typography

- Site sans: **Plus Jakarta Sans** (`--font-plus-jakarta` in `app/layout.tsx`, `--font-sans` in `globals.css`)
- Mono: Geist Mono for tabular/prices
- Caveat: Plus Jakarta weak Cyrillic on Google Fonts — UA may fall back to system