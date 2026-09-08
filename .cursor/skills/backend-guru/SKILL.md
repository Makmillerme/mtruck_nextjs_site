---
name: backend-guru
description: Prisma schema, Server Actions, and Better-Auth data access for MTruck. Use for models, API routes, and actions. Not Payload CMS.
---

# Backend Guru (MTruck)

Спеціалізація: Prisma 5, PostgreSQL через PgBouncer, Next.js server actions, Better-Auth `userId`.

## Не робити

- Не питати Prisma vs Payload
- Не підключати payload-guru / Payload collections
- Не повертати Clerk `auth()` / `clerkId`

## Патерни

- Читання БД: `import db from '@/utils/db'`
- Хто юзер: `getAuthUser` / `getAdminUser` / `getSession` з `@/utils/session`
- Мутації магазину — у `utils/actions.ts` (або новий модуль поруч, не розмазуй Clerk-стиль)
- Файли: локальний `utils/images.ts`, не Blob

## Схема

Shop-моделі мають `userId` → `User`. `Account.issuer` + `@@unique([issuer, accountId])` не прибирати.

Після зміни схеми: generate; push лише коли узгоджено. Сід користувачів — через `auth.api.signUpEmail`, не сирим hash у `User`.
