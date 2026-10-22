# Plan: premium product page (PDP) — 2026-10-22

## Current
`app/[locale]/products/[id]/page.tsx`: BreadCrumbs → PhotoCarousel page + info → ProductReviews/SubmitReview.
Furniture leftovers: star rating, reviews form, raw `product.status` Badge, equal-weight back-to-catalog, flat specs box, Twitter/LinkedIn share icons.

## Keep
Gallery, name/price/availability, favorite, RequestCatalogOrder, description, specs (restructured), taxonomy path.

## Kill / demote on PDP
ProductRating, ProductReviews, SubmitReview (schema keep), status Badge, back button next to CTA, dated share row.

## Lab gaps (before production)
pdp-shell, key-facts, grouped-specs, sticky-cta, lightbox Dialog, related VehicleCard row.

## Phases
1 Agree keep/kill → 2 UI Lab `pdp` → 3 rewrite SingleProductPage → 4 related + display-group specs → 5 optional share polish.
UI-editor visual PDP config stays backlog.
