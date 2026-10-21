# PgBouncer DIRECT_URL session alias (2026-10-20)

## Проблема

`prisma db push` через transaction-mode PgBouncer (`:6432` / `mtruck_nextjs` + `pgbouncer=true`) інколи падав:
`prepared statement "sN" does not exist`.
Postgres `:5432` зовні не опублікований.

## Фікс

На сервері в `/root/apps/PostgressOps/docker/pgbouncer/pgbouncer.ini`:

```
mtruck_nextjs_direct = host=postgres port=5432 dbname=mtruck_nextjs user=mtruck_nextjs pool_mode=session
```

Після зміни — `reload_pgbouncer`.

Локально:
- `DATABASE_URL` → `…/mtruck_nextjs?pgbouncer=true…` (runtime)
- `DIRECT_URL` → `…/mtruck_nextjs_direct?connection_limit=1` (**без** `pgbouncer=true`)

Документація: `.env.example`, `.cursor/rules/prisma-postgres.mdc`.

Перевірено: `npx prisma db push` → «already in sync» без prepared-statement помилки.
