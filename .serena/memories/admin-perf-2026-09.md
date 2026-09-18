# Admin performance (2026-09)

## Проблема
Адмінка ~600–1900ms; таби `/admin/archive` кожен клік = повний GET (router.replace).

## Фікси
1. **`utils/session.ts`**: `React.cache()` на `getSession`, `getStaffUser`, `getAuthUser`, `getAdminUser`; один `getSessionUserContext` = 1× Better-Auth session + 1× DB `{ role, archivedAt }` на request (layout + page + fetch* більше не дублюють 5–10 запитів).
2. **`admin-archive-view.tsx`**: таби через `useState` + `history.replaceState` (без server navigation); дані всіх табів завантажуються один раз на SSR.

## Наступне (якщо ще повільно)
- `fetchAdminProducts` з повними specs — важкий; lazy load sheet attributes вже частково.
- Remote PgBouncer latency — основний floor для DB-heavy pages.