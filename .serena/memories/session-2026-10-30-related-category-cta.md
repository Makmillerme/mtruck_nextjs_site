# Related teaser → category catalog — 2026-10-30

`ProductRelated` teaser/mobile CTA uses same `buildCatalogHref(… folders: [categorySlug])` as breadcrumb.

i18n Product:
- `relatedViewCategory`: «Усі в категорії {category}»
- `relatedCatalogHintInCategory`: «Більше пропозицій у категорії {category}»
- Fallbacks without taxonomy: `relatedViewCatalog` / `relatedCatalogHint`

Wired in `app/[locale]/products/[id]/page.tsx` from `categoryLabel` + `categorySlug`.
