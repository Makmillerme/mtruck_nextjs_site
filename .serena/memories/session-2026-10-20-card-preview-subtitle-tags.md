# Card preview — TAGS unlimited, grid icon, subtitle slots (2026-10-20)

## Зміни

1. **TAGS** — без практичного ліміту полів (`slotMaxForSpecsStyle(TAGS) = 48`, UI hint `specSlotsHintUnlimited`). GRID_4=4, GRID_6=6.
2. **GRID icons** — прибрано `SPEC_ICON` map; для всіх specs одна `LuTag`.
3. **Підзаголовок** — не хардкод `year`:
   - `CardPreviewSubtitleSlot` (до 2 полів-атрибутів)
   - категорія завжди останнім пунктом (обовʼязкова)
   - разом до 3 сегментів: `field • field • category`
   - `categorySource` UI перенесено під toggle «Підзаголовок»; hint видалено
4. Runtime: `subtitleKeys` у resolve → `subtitleParts` у `productWithSpecsToVehicle` → `VehicleCard`.
5. Seed backfill: існуючі layout отримують `year` як subtitle slot, якщо слотів ще не було.

## Файли

- `prisma/schema.prisma` — `CardPreviewSubtitleSlot`
- `lib/catalog/card-preview.ts`, `product-to-vehicle.ts`
- `components/vehicles/vehicle-card.tsx`
- `components/admin/ui-editor/card-preview-editor.tsx`
- `lib/admin/card-preview-editor-data.ts`, `utils/card-preview-actions.ts`
- i18n `UiEditor.subtitleSlots*` / `specSlotsHintUnlimited`
