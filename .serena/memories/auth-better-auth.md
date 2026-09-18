# Better-Auth

- Privilege is DB role: `User.role` enum `USER | ADMIN | MANAGER` (default USER). Session exposes `role` via Better-Auth `user.additionalFields` (`input: false`).
- Server: `getAdminUser()` / `getStaffUser()` — see `utils/session.ts`. Bootstrap emails in `ADMIN_EMAIL` / `ADMIN_TEST_EMAIL` promoted by seed only (`lib/admin.ts` `isAdminEmail`).
- Seed creates **only** the env admin (`ADMIN_EMAIL` + `ADMIN_PASSWORD` + `ADMIN_NAME`). No `test@user.com` / `test@admin.com` stubs.
- Sign-in form: email/password (+ Google if configured). No test-account Select / `?guest=` presets.
- Navbar gets `isAdmin` / staff flags from server — no `NEXT_PUBLIC_ADMIN_*`.
- Admin layout and `ui-lab/layout.tsx` call staff/admin guards; Proxy also guards `/ui-lab`.
