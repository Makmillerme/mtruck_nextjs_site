# Admin UI normalize via UI Lab — 2026-09

Коміти: `98515a6`, follow-up `48a5227`.

## Примітиви

- `components/ui/tabs.tsx`: **outline-навігація** — без треку `bg-secondary`. List: `h-9 gap-2`. Trigger: `h-9 px-3.5 text-xs`, `border-primary/40 bg-transparent text-primary`, hover/active = `bg-primary text-primary-foreground border-primary` (як outline button, розмір sm).
- `components/ui/table.tsx`: TableHead h-11 px-4, TableCell px-4 py-3.
- Card глобально **не** чіпали.

## Адмінка spacing

- `admin/layout.tsx`: без `py-8` зверху — лише `pb-8`. Верхній відступ дає глобальний `main > .page-container` (`clamp(2.5rem, 5vw, 3.5rem)`), як на інших внутрішніх сторінках.

## CMS tree

- Шеврон expand: `hover:bg-transparent` — без окремого hover-диска; рядок і так має `hover:bg-secondary/70`.

## UI Lab

Секції Tabs + Table у категорії fields з оновленим hint під outline-стиль.
