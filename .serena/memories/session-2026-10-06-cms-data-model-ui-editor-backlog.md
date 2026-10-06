# Next big task: CMS → Data Model + UI Editor (parked 2026-10-06)

User parked this for tomorrow. When they ask «що ми робимо?» / «what's next» — answer from this memory + `docs/backlog/ideas.md` § «CMS → Модель даних + UI редактор».

## Goal
Split admin CMS into two sidebar branches (same UX pattern as Products with nested roots):

### 1. Модель даних (Data Model)
Current catalog constructor: folders/taxonomy tree, fields, options, display groups. Source of truth for *what exists*.

### 2. UI редактор (UI Editor)
Configure *how* the public site presents that model:
- Homepage / catalog **filter** look: which fields belong to the filter, enable/disable filter (or parts).
- Product **card preview** appearance (list/grid).
- Product **card / detail** appearance: which options to show.
- **Visual layout editor** for component positions on those surfaces.

## Why
Admin must tune catalog UX without code, separately from editing the data schema.

## Anchor files
- Sidebar pattern: `app/[locale]/admin/Sidebar.tsx` (Товари → Комерційна / Не комерційна).
- CMS today: `app/[locale]/admin/catalog/page.tsx`, `components/admin/catalog/*`.
- Public filter: `components/products/catalog-filters.tsx`, `lib/catalog/public-filter.ts`, `utils/catalog-query.ts`.
- Cards: `components/vehicles/vehicle-card.tsx`; memories `catalog-preview-cards`, `marketing-vehicle-card-ui-spec-2026-09`.
- Possible config hook: existing Display Groups in CMS.

## Suggested kickoff tomorrow
1. `/plan` + sequential-thinking: IA for sidebar (CMS parent → Data Model / UI Editor children vs two top-level links).
2. Scope phase 1 tightly (likely: sidebar split + filter enable/fields config) before visual drag-drop editor.
3. Decide persistence: Prisma config models vs JSON on TaxonomyNode / DisplayGroup.

## Status
Backlog: Обговорюється / Готово до впровадження. Do NOT start implementation until user asks.
