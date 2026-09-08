# Session 2026-08-20 — Clerk → Better-Auth

User: Better-Auth, no GitHub.

Done:
- Installed better-auth + prisma adapter; uninstalled `@clerk/nextjs`
- Server/client auth, `/api/auth/[...all]`, `proxy.ts` cookie gate
- Flattened `/sign-in`, `/sign-up`, `/user-profile` (removed Clerk catch-alls)
- Shop schema `clerkId` → `userId`; Account.issuer added for Better-Auth 1.7
- Seeded `test@admin.com` and `test@user.com` / `12345678` plus 4 products
- Google button present but inactive until OAuth env is set
- tsc + eslint clean

Not done: Google credentials, Stripe, `npm run dev`, vehicle domain model.
