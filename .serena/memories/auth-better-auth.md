# Better-Auth (2026-08-20)

Clerk is fully removed. Auth is **Better-Auth 1.7.1** with Prisma adapter.

## Providers
- Email + password (min 8). No GitHub.
- Google is wired in `lib/auth.ts` only when both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.
- UI Google button shows a toast until `NEXT_PUBLIC_GOOGLE_AUTH=true`.
- Google redirect URI later: `http://localhost:3000/api/auth/callback/google`

## Key files
- `lib/auth.ts` — server `betterAuth`, `nextCookies()` last plugin
- `lib/auth-client.ts` — `createAuthClient()` from `better-auth/react`
- `utils/session.ts` — `getSession`, `getAuthUser`, `isAdminEmail`, `getAdminUser`
- `app/api/auth/[...all]/route.ts` — `toNextJsHandler(auth)`
- `proxy.ts` — cookie check via `getSessionCookie`; protects `/admin`, `/orders`, `/user-profile`
- Pages: `app/sign-in/page.tsx`, `app/sign-up/page.tsx`, `app/user-profile/page.tsx`

## Admin
Admin is email-based, not Clerk user id:
- `ADMIN_EMAIL` / `ADMIN_TEST_EMAIL` (server)
- `NEXT_PUBLIC_ADMIN_EMAIL` / `NEXT_PUBLIC_ADMIN_TEST_EMAIL` (navbar)
- Seeded admin: `test@admin.com` / `12345678`
- Seeded user: `test@user.com` / `12345678`

## Schema
Shop models use `userId` FK to Better-Auth `User`. `Account.issuer` is required (Better-Auth 1.7 unique `[issuer, accountId]`).

## Env
`.env`: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=http://localhost:3000`, admin emails, empty Google keys.
`.env.local`: public admin emails + `NEXT_PUBLIC_GOOGLE_AUTH=false`.
