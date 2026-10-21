# showSpecs Unknown arg — stale Next Prisma (2026-10-21)

## Симптом
`Invalid prisma.cardPreviewLayout.upsert(): Unknown arg 'showSpecs'`

## Факти
- Колонки в БД є (`showSpecs`, `specsGridCount`).
- `@prisma/client` на диску вже знає поля (node script update OK).
- `npx prisma generate` → EPERM на DLL, бо тримає `npm run dev`.
- Next тримає старий Prisma singleton / require cache без `showSpecs`.

## Фікс
1. `utils/db.ts`: `PRISMA_CLIENT_GEN` — скидання global singleton після зміни схеми.
2. Користувач: один раз зупинити `npm run dev` → `npx prisma generate` → знову `npm run dev`.
Не вбивати node агентом (`Stop-Process`).
