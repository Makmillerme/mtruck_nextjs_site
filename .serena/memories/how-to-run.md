# How to run

## Dev
- `npm run dev` (only when user asks)
- Env: `.env` + `.env.local`

## Database
- PostgressOps PgBouncer: `173.242.62.135:6432`
- DB/role: `mtruck_nextjs`
- `npx prisma generate` / `npx prisma db push` / `npm run db:seed`

## Admin bootstrap
- Privilege: email listed in `ADMIN_EMAIL` (optional `ADMIN_TEST_EMAIL`)
- Seed creates the user in DB from `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`
- Default avatar: `/favicon_mtruck.svg`
- Re-seed does **not** overwrite password, name, or image if the user already exists

## Test accounts (after seed)
- Admin: values from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- `test@user.com` / `12345678`
