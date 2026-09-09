# Better-Auth

- Privilege is DB role: `User.role` enum `USER | ADMIN` (default USER). Session exposes `role` via Better-Auth `user.additionalFields` (`input: false`).
- Server: `getAdminUser()` checks `role === "ADMIN"`. Bootstrap emails in `ADMIN_EMAIL` / `ADMIN_TEST_EMAIL` promoted by seed only (`lib/admin.ts` `isAdminEmail`).
- Navbar gets `isAdmin` boolean from server — no `NEXT_PUBLIC_ADMIN_*`.
- Admin layout calls `getAdminUser()`; product create/image actions require admin.
