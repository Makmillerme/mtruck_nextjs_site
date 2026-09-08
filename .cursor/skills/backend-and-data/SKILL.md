---
name: backend-and-data
description: Prisma + PostgreSQL (PostgressOps) data layer for MTruck. Use when changing schema, seed, server actions, or DB access. Do not offer Payload CMS.
---

# Backend and Data (MTruck)

Цей репозиторій — **тільки Prisma**. Не питай «Prisma чи Payload». Не викликай payload-guru.

## Джерела

- Схема: `prisma/schema.prisma`
- Клієнт: `utils/db.ts`
- Дії: `utils/actions.ts` (session з `utils/session.ts`)
- Сід: `prisma/seed.ts` + `npm run db:seed`
- Правила: `.cursor/rules/prisma-postgres.mdc`, `.cursor/rules/auth-better-auth.mdc`

## Процес

1. Прочитай поточні моделі (`User` Better-Auth + shop з `userId`).
2. Опиши зміну схеми користувачу, якщо вона ламає дані.
3. Правки через Serena. Потім `npx prisma generate`. `db push` — зі згодою / як частина узгодженої схеми.
4. `--force-reset` лише після явного «так».
5. Нові сутності: FK на `User.id`, не `clerkId`.

## Заборонено

- Payload collections / payload-guru
- Локальний Windows Postgres, поки користувач не попросить
- Друкувати `DATABASE_URL` з паролем
