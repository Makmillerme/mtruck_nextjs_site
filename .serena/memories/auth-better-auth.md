# Better-Auth (2026-09-08)

Clerk is fully removed. Auth is **Better-Auth 1.7.1** with Prisma adapter.

## Admin
- Privilege is email-based: `ADMIN_EMAIL` (+ optional `ADMIN_TEST_EMAIL`). Navbar uses `NEXT_PUBLIC_ADMIN_*`.
- Bootstrap lives in `lib/admin.ts`. Seed (`prisma/seed.ts`) creates the admin **User** in Postgres via `auth.api.signUpEmail`.
- Env: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`. Default avatar `/favicon_mtruck.svg` (same as favicon).
- Existing admin is not overwritten on re-seed (password/name/image stay editable later on the site).
- Guest sign-in demo still has `test@admin.com` / `test@user.com` hardcoded in `SignInForm` for the guest selector.
