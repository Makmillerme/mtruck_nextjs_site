# Admin: Фінанси — таби + валюти

**Дата:** 2026-11-09

## Навігація
- Child у CMS-акордеоні: `/admin/finance` (`CMS_NAV_CHILDREN`).

## UI
- Сторінка: `app/[locale]/admin/finance/page.tsx` — Card + title + `FinanceTabs` (`?tab=`).
- Таби: `currencies` | `pricing` | `taxes` | `financing` (`lib/admin/finance-tab.ts`).
- Компоненти: `components/admin/finance/finance-tabs.tsx`, `finance-currencies-panel.tsx` (UAH/USD/EUR mock), `finance-stub-panel.tsx` для інших табів.
- Канон табів: shadcn `Tabs` як у CMS/UI editor.
- i18n: `FinanceAdmin.*` (uk/en/de).

## Дані
Поки UI-приклад (disclaimer `uiExampleNote`), без Prisma/курсів.
