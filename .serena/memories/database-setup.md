# Database — PostgressOps + Prisma (updated 2026-09-07)

## Server (new after VPS migration)
- Host: `173.242.62.135:6432` (PgBouncer). SSH: `root@173.242.62.135`.
- Stack path: `/root/apps/PostgressOps`
- DB + role: `mtruck_nextjs` / `mtruck_nextjs` (provisioned via `provision-db.sh`)

## Connection URLs
- `DATABASE_URL` and `DIRECT_URL` in `.env`: `?pgbouncer=true&connection_limit=5&pool_timeout=20`
- Prisma pool cap also in `utils/db.ts`
- Password URL-encoded (`+` → `%2B`). Do not print in chat.

## Applied 2026-09-07
- healthcheck OK (postgres, pgbouncer, backup)
- `npx prisma db push` — schema synced
- `npm run db:seed` — test users + products

Old server `91.239.232.91` — deprecated.
