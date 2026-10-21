# Card preview UI editor — 2026-10-20

## Done
- Removed `/admin/ui` **Filter** tab (default → `cardPreview`). Orphan `setNodeShowInFilterAction` / `setAttributeIsFacetAction` + schemas removed. Filter flags remain in Data Model.
- Prisma: `CardPreviewLayout` (1:1 `taxonomyNodeId`) + `CardPreviewSlot` (ordered attrs, max 4). `db push` applied.
- Runtime: `VehicleCard` uses `specItems` + showName/Price/Status/Subtitle. `productWithSpecsToVehicle(product, layout)`. Catalog loads layouts via `fetchCardPreviewLayoutsByNodeIds`. Fallback = classic mileage/transmission/euro/feature.
- Admin: `/admin/ui?tab=cardPreview&node=` — CascadeSelect folder, toggles, MemberOrderPicker slots, live VehicleCard grid/list, `saveCardPreviewLayoutAction`.
- Seed: `ensureCardPreviewLayouts` / `scripts/seed-card-preview.ts` (inherited attrs on path). Currently 4 layouts / 16 slots after seed.

## Key files
- `lib/catalog/card-preview.ts`, `lib/admin/card-preview-editor-data.ts`
- `components/admin/ui-editor/card-preview-editor.tsx`
- `utils/card-preview-actions.ts`
- `components/ui/switch.tsx` (shadcn added)

## Specs style (follow-up)
`CardPreviewSpecsStyle`: `GRID_4` | `GRID_6` | `TAGS` on `CardPreviewLayout.specsStyle`.
- GRID_4 → max 4 slots, 2-col icon grid
- GRID_6 → max 6 slots, 2/3-col icon grid
- TAGS → max 6 slots, Badge chips
Editor segmented control + live preview. Slot limit follows style.

## Next (deferred)
- Product page + «Картка товару» editor
- Layout tab
