# User phone memory (primary + additional)

**Date:** 2026-11-05

## Behavior
- Logged-in user enters phone anywhere (callback CTA, account request with phone) → `rememberUserPhone`.
- Empty `User.phone` → set primary (shows in account settings `#phone`).
- Primary already set and number differs (digit-normalized) → upsert `UserPhone`.
- Account settings / admin edit primary → `setUserPrimaryPhone` (old primary moves to extras; new primary removed from extras if present).

## Schema
- `UserPhone`: userId, phone, phoneNorm, @@unique([userId, phoneNorm])
- Relation: `User.phones`
- Pushed via `prisma db push` to PostgressOps `mtruck_nextjs`.

## Code
- `lib/user-phone.ts` — helpers
- `utils/actions.ts` — callback + request + profile + admin update wired
- `lib/admin/user-row.ts` — `additionalPhones: string[]` on DTO / select
- Admin user sheet: block "Додаткові номери телефонів" under main phone (`Admin.additionalPhones` uk/en/de)

## Note
`prisma generate` needed stop of next process locking `query_engine-windows.dll.node` (EPERM); dev restarted.