# Local env files (2026-09)

Canonical pair:
- `.env.example` — committed template, placeholders only
- `.env` — gitignored secrets; Next.js, Prisma (`--env-file=.env`), seed

`.env.local` removed 2026-09-11: it only duplicated `NEXT_PUBLIC_GOOGLE_AUTH` and leftover Clerk-era `NEXT_PUBLIC_ADMIN_*` (unused; admin is DB role).

Required in `.env`: `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `NEXT_PUBLIC_WEBSITE_URL`.
Optional: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` + `NEXT_PUBLIC_GOOGLE_AUTH=true`; `ADMIN_TEST_EMAIL`.
