# PDP details tabs (Опис / Характеристики) — 2026-10-26

## UI

- Client: `components/single-product/product-details-tabs.tsx`
- Content underline tabs (не framed navy): exported `contentTabsListClassName`, `contentTabsTriggerClassName`, `contentTabsCardClassName`
- Card: `rounded-sm border border-border bg-card p-4 md:p-6` + `page-shell-reading`
- Tabs: Опис | Детальні характеристики; empty tabs hidden; both empty → null
- Description: `aboutTitle` (h3) + `whitespace-pre-wrap`
- Specs: `ProductSpecs` without title (optional `title?`)

## Wiring

- `app/[locale]/products/[id]/page.tsx` uses `ProductDetailsTabs` instead of stacked description + ProductSpecs
- UI Lab PDP demo uses the same component
- i18n Product: `descriptionTitle`, `specsTitle` (uk: Детальні характеристики), `aboutTitle`

## Backlog

- «Комплектація» — `docs/backlog/ideas.md` (модель + 3rd tab). Not rendered yet.

## Canon note

Framed navy `components/ui/tabs.tsx` unchanged for cabinet/CMS. PDP uses className overrides.
