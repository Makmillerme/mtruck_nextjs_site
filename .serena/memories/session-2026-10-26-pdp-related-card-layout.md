# PDP related cards — card preview layout (2026-10-26)

## Bug
«Схожа техніка» показувала лише категорію + назву + ціну + Детальніше (без року в subtitle і без spec chips).

## Cause
`app/[locale]/products/[id]/page.tsx` мапив related через `productWithSpecsToVehicle(item)` **без** layout → `FALLBACK_CARD_PREVIEW_LAYOUT` з `slotKeys: []` / `subtitleKeys: []` (після 2026-10-21 no-hardcode).

Каталог правильно: `fetchCardPreviewLayoutsByNodeIds` → `productWithSpecsToVehicle(product, layouts.get(nodeId))`.

## Fix
На PDP паралельно з related тягнемо `fetchCardPreviewLayoutsByNodeIds(db, [product.taxonomyNodeId])` і передаємо layout у mapper.

## Verify
Картки: `ФУРГОНИ • 2020` + chips (км, КПП, Euro, …) + ціна + Детальніше.

## Note
`AccountCabinetView` favorites ще мапить без layout — той самий патерн, якщо знадобиться.
