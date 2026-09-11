# Admin UI normalize via UI Lab — 2026-09

Коміт після `519305c`. План `admin_ui_normalize`.

## Примітиви

- `components/ui/tabs.tsx`: h-11, rounded-sm, bg-secondary list, active = bg-primary text-primary-foreground, ring-1, без shadow. `w-full sm:w-auto`.
- `components/ui/table.tsx`: TableHead h-11 px-4, TableCell px-4 py-3.
- Card глобально **не** чіпали (rounded-xl лишається).

## UI Lab

- `ui-lab-catalog.ts`: секції `tabs` і `table` у категорії `fields`.
- `ui-lab.tsx`: живі демо Tabs (Папки/Поля/Перегляд) і Table у Card shadow-sm.

## Адмінка

- `admin/layout.tsx`: прибрано дубль «Адмінпанель» + Separator; лишилась сітка sticky sidebar + content.
- Sales / products: власний h1 + таблиця в Card shadow-sm p-0.
- create / edit: Card замість border rounded-md; FormContainer у grid gap-6.
- `IconButton`: variant ghost (як CMS іконки).
- CMS tree: h-11 rounded-sm, selected bg-secondary, icon size=icon (9), без size-8.
- native select: focus-visible:ring-1; CatalogFlag checkbox rounded-sm border-primary.

## Перевірено

tsc + eslint OK. Браузер: /admin/catalog (navy tabs), /admin/sales, /admin/products/create, /ui-lab?fields (Tabs/Table). Hydration warning на ui-lab-homepage-close — **не** з цього коміту.
