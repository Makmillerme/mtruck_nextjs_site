# Admin UI editor exploration (/admin/ui) — 2026-10-20

## Current state
- Page: `app/[locale]/admin/ui/page.tsx` — ADMIN via `getAdminUser()`; **all 4 tabs are stubs** (`UiEditorStubPanel`).
- Shell: `components/admin/ui-editor/ui-editor-tabs.tsx` + `ui-editor-stub-panel.tsx`; tab parse `lib/admin/ui-editor-tab.ts`.
- Tabs: `filter` (default) | `cardPreview` | `productCard` | `layout`. URL `?tab=`.
- Nav: Sidebar CMS accordion → `/admin/ui` (`cmsUiEditor`). MANAGER has no CMS entry.

## Filter tab
- **No live editor.** Stub text says filters live in Data Model (`showInFilter` / `showInHomeFilter` / `isFacet`).
- Historical: `FilterSettingsPanel` existed 2026-10-07 then removed when flags moved to folder/field sheets; `HomeFinderSettings` dropped.
- Orphan: `setNodeShowInFilterAction` + `setAttributeIsFacetAction` (+ Zod schemas) — **no callers**.
- Real config UX: `folder-tree.tsx` flags; `fields-panel.tsx` isFacet / showInHomeFilter.

## Card Preview / Product Card
- Stubs only (`stubCardPreview`, `stubProductCard`). No persistence, no live preview.

## Prisma — no UI layout models
- Filter flags on TaxonomyNode / AttributeDefinition.
- `DisplayGroup` + members = **product name template tags** (`writesProductName`), not card slots.
- No CardLayout / field-visibility / UiConfig model.

## VehicleCard today
- `components/vehicles/vehicle-card.tsx` + `lib/catalog/product-to-vehicle.ts`.
- Hardcoded slots: status badge, favorite, subtitle (year + categoryLabel), name, 4-spec grid (mileage/transmission/euro/feature), price+hint, CTA.
- Spec keys hardcoded: year, mileage, euro, transmission, feature, location (location mapped but **not rendered**), make→categoryLabel fallback.
- Product detail (`products/[id]`): all specs by sortOrder — no visibility config.

## i18n
- `Admin.cmsUiEditor` (+ unused `cmsUiEditorStub`); namespace `UiEditor.*` tab*/stub* uk/en/de.

## Recommended next scope
1. Remove Filter tab (+ orphan actions/schemas; default tab → cardPreview).
2. Build Card Preview editor: pick which fields/tags show on grid/list VehicleCard (reuse DisplayGroup pattern or new CardPreviewConfig).
3. Product Card tab later: detail page section visibility.
4. Layout tab last (visual drag-drop).

See also: mem cms-data-model-ui-editor-backlog, ui-editor-filter-tabs, show-in-home-filter, marketing-vehicle-card, catalog-preview-cards; docs/backlog/ideas.md § CMS.