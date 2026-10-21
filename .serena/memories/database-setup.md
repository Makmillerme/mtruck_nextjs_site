# Database — PostgressOps + Prisma (updated 2026-10-20)

## Server
- Host: `173.242.62.135:6432` (PgBouncer). SSH: `root@173.242.62.135`.
- Stack path: `/root/apps/PostgressOps`
- DB + role: `mtruck_nextjs` / `mtruck_nextjs`

## Connection URLs
- `DATABASE_URL` → `mtruck_nextjs?pgbouncer=true&connection_limit=5&pool_timeout=20` (transaction pool, app)
- `DIRECT_URL` → `mtruck_nextjs_direct?connection_limit=1` (**без** `pgbouncer=true`; session alias for schema engine)
- Alias in `docker/pgbouncer/pgbouncer.ini`: `mtruck_nextjs_direct = … dbname=mtruck_nextjs … pool_mode=session`
- Password URL-encoded (`+` → `%2B`). Do not print in chat.
- Prisma pool cap also in `utils/db.ts`

## Notes
- Postgres `:5432` not published externally; schema ops go through session-mode PgBouncer alias.
- If `db push` hits prepared-statement errors again: confirm DIRECT_URL uses `mtruck_nextjs_direct` and reload PgBouncer.
