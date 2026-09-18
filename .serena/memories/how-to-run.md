# Local env files (2026-09)

Canonical pair:
- `.env.example` — committed template, placeholders only
- `.env` — gitignored secrets; Next.js, Prisma (`--env-file=.env`), seed

`.env.local` removed 2026-09-11: it only duplicated `NEXT_PUBLIC_GOOGLE_AUTH` and leftover Clerk-era `NEXT_PUBLIC_ADMIN_*` (unused; admin is DB role).

Do not rewrite `.env` with PowerShell `Set-Content -Encoding utf8` (BOM + CP1251 mojibake). Next then JSON.parse-fails during `generateStaticParams`. If that happens: restore `.env` as UTF-8 no BOM, delete `.next`, restart `npm run dev`.

Required in `.env`: `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `NEXT_PUBLIC_WEBSITE_URL`.
Optional: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` + `NEXT_PUBLIC_GOOGLE_AUTH=true`; `ADMIN_TEST_EMAIL` (extra email promoted to ADMIN by seed).

Seed creates only the env admin user — no demo `test@user.com` accounts.
