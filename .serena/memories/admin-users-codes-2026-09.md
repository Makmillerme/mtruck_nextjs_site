# Admin Users + коди + combobox — реалізовано 2026-09-17

## Schema
- `User.userCode String @unique`, `User.phone String?` (+ index)
- `Product.productCode String @unique`
- Push + backfill: `scripts/backfill-entity-codes.ts` (`npx tsx --env-file=.env scripts/backfill-entity-codes.ts`)
- Helper: `lib/codes.ts` — `generateUniqueUserCode/ProductCode`, `ensureUserCode/ProductCode`, `backfillEntityCodes`

## Auth
- `lib/auth.ts`: additionalFields `userCode` (input:false), `phone` (input:true)
- `databaseHooks.user.create.before` призначає `userCode` (signup + Google)
- `createProductAction` + seed-demo призначають `productCode`

## Admin Users `/admin/users`
- Link у `utils/links.ts` (`users`)
- Page + `components/admin/users/admin-users-view.tsx`
- Actions: `fetchAdminUsers`, `createAdminUserAction` (hashPassword + Account issuer `local:credential`), `updateAdminUserAction`, `deleteAdminUserAction` (блок якщо є products / self)
- Кнопка замовлення → `/admin/sales?create=1&userId=`

## Cabinet
- Settings: one Save via `updateAccountProfileAction` (name+phone); password in Dialog; `userCode` in chrome (`UserCodeChip`), not in settings form

## Sales combobox
- shadcn `command` + `dialog` (іконки → react-icons)
- `components/admin/searchable-entity-picker.tsx`
- OrderFormFields: пошу search by code/name/email/phone / productCode/name/company/status
- `preselectedUserId` з searchParams

## i18n
uk/en/de: Admin.users* + AccountCabinet phone/code/copy + Actions.profileUpdated/userRemoved

## Note
Для `prisma generate` при lock DLL треба коротко зупинити `next dev`.
