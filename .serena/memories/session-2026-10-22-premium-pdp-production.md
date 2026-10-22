# Premium PDP production (2026-10-22)

## Page
`app/[locale]/products/[id]/page.tsx`
- Gallery + sticky buy-box; key facts; description; grouped specs; related; mobile sticky CTA
- Removed: ProductRating, ProductReviews, SubmitReview, status Badge, back-to-catalog beside CTA
- Availability only (IN_STOCK / TRANSIT)
- Breadcrumb: Home → Catalog → taxonomyNode → name

## Components (`components/single-product/`)
- product-gallery.tsx, product-buy-box.tsx, product-key-facts.tsx, product-specs.tsx, product-sticky-cta.tsx, product-related.tsx
- ShareButton: copy-link + navigator.share (no react-share icons)

## Data
- `lib/catalog/product-page.ts`: buildProductKeyFacts (max 6 by sortOrder), buildProductSpecGroups (DisplayGroup non-writers, else flat)
- `fetchRelatedProducts` in utils/actions.ts (same taxonomyNodeId, PUBLISHED, limit 4)
- PhotoCarousel: optional `onImageClick` for lightbox

## i18n Product
keyFactsTitle, relatedTitle, share, copyLink, linkCopied, linkCopyFailed, shareNative (uk/en/de)
