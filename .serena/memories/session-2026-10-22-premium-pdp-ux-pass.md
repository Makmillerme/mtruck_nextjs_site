# PDP UX polish pass (2026-10-22)

Checkpoint commit first: `84eb1ad` (Lab+PDP baseline).

## Fixes
- Key facts moved into buy-box (compact); prefer year/mileage/power over make/model
- Removed sticky buy-box (no empty left column); keep mobile sticky CTA
- scroll-mt-24 on description/specs/related
- Specs denser label|value grid (max-w-3xl)
- formatProductPrice (no cents) + formatProductSpecValue (505 000 км)
- priceHint + secondary call CTA (Navbar phoneHref)
- Gallery expand hint + i18n aria; larger thumbs
- Breadcrumb category → `/products?folder={slug}`
- Related cards: showStatus false
- Description titled section, stronger text color
