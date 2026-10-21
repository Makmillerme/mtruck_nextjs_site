# Card preview specs unify (2026-10-21)

## UX
- Характеристики: Switch `showSpecs` (увімк/вимк на превʼю картки).
- Якщо увімкнено: стиль лише **GRID** або **TAGS** (більше немає GRID_4/5/6 як окремих стилів).
- GRID → Select `specsGridCount` 1…8.
- TAGS → безлімітно (slot max 48 у `CARD_PREVIEW_SLOT_MAX`).
- `MemberOrderPicker`: «Додати поле» **над** списком «Поля в порядку».

## Schema / DB
- Enum `CardPreviewSpecsStyle`: `GRID` | `TAGS`.
- Поля: `showSpecs Boolean @default(true)`, `specsGridCount Int @default(4)`.
- Міграція: `scripts/migrate-card-preview-specs-grid.sql` (застосовано; enum у БД = GRID,TAGS).
- Legacy `GRID_4/5/6` нормалізується в `gridCountFromLegacyStyle` у `lib/catalog/card-preview.ts`.

## Файли
- `prisma/schema.prisma`, `lib/catalog/card-preview.ts`, `utils/card-preview-actions.ts`
- `lib/admin/card-preview-editor-data.ts`, `lib/catalog/product-to-vehicle.ts`
- `components/admin/ui-editor/card-preview-editor.tsx`
- `components/vehicles/vehicle-card.tsx`
- `components/admin/catalog/display-groups-panel.tsx` (MemberOrderPicker)
- i18n: `showSpecs`, `specsStyleGrid`, `specsGridCount`, `specsGridCountOption`, `specSlotsHidden`

## Prisma generate
- `npx prisma generate` може дати EPERM на DLL поки крутиться `npm run dev`.
- Не вбивати node. Користувач: коротко зупинити/перезапустити dev → generate.
- На момент сесії client уже має GRID/TAGS + showSpecs у `.prisma/client`.
