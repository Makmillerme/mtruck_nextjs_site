# ServicesSection (2026-09-09, update)

Homepage `#services` after CatalogBlock. White paper band in the 3-color rhythm. Nav label «Послуги» (renamed from «Сервіс», uk only — en/de eyebrow already said Services/Leistungen).

## Business copy (importer model)
Items: `sale`, `finance`, `workshop`, `refit`. Groups: `commerce` (Продаж) + `workshop` (Підготовка).

## Group CTA «маячки» (2026-09-09)
Each group header row now has a pill link to `/services#sale` / `/services#workshop` (i18n-aware `Link` from `@/i18n/navigation`):
- rounded-full border-primary/25, ArrowUpRight icon, hover fills bg-primary
- i18n key `groupsCta.{commerce|workshop}` (uk/en/de)
- `/services` page itself NOT redesigned yet — hashes are forward-compatible, harmless with no matching anchor today

## Design
- `bg-background` (white), `page-container py-16 md:py-24` — matches catalog vertical rhythm
- Editorial header: 12-col, eyebrow mono left, H2 left, lead right
- shadcn `Separator` + 2-column hairline grid (`divide-y` / `lg:border-r`), numbered 01–04, small Lucide icons (no card shadows, no icon-circle hover)

## Color rhythm (homepage, full)
1. Navy — Hero (`data-header-surface="dark"`)
2. Pastel — Catalog (`bg-secondary`)
3. White — Services (`bg-background`)
4. Navy — CustomOrderSection (`bg-foreground`, `data-header-surface="dark"`) — see `mem:custom-order-section-2026-09`
5. Pastel — Contact (`bg-secondary`)
6. Navy — Footer (`bg-foreground`, `data-header-surface="dark"`)

## Out of scope
`/services` (`ServicesPage` / `services-page.tsx`) still lists old customs/delivery cards. Align when that route gets its detailed redesign (homepage stays short/teaser per user; full detail lives on dedicated pages, not built yet).
