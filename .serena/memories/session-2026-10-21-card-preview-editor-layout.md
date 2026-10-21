# Card preview editor — preview tabs on top (2026-10-21)

## UX

- **Зверху:** сегмент Сітка | Список (framed tabs canon) + один live `VehicleCard`
- **Нижче:** 3 колонки — Папка | Налаштування | Поля на картці + Save
- Dual sticky side-by-side preview прибрано

## List card polish

- Фото list: `md:w-[min(38%,20rem)]` (менше стискає контент)
- Specs у list: `grid-cols-2 sm:grid-cols-4` (GRID_4) / до 6 колонок для GRID_6; текст `sm:whitespace-normal`

## Files

- `components/admin/ui-editor/card-preview-editor.tsx`
- `components/vehicles/vehicle-card.tsx`
