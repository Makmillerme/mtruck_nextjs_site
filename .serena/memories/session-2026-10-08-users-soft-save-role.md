# Session 2026-10-08 — Admin users soft-save (role table refresh)

## Bug
Role change saved in DB but table badge stayed old until hard reload. Redirect to `/admin/users` did not reliably refresh client list props.

## Fix
- Soft-save `createAdminUserAction` / `updateAdminUserAction` → `{ ok, message, user }` via `mapAdminUserRow`
- `lib/admin/user-row.ts` shared DTO + select
- `ActionState.user`
- `admin-users-view`: local `listItems` + `onUserSaved` patch + close sheet (same pattern as products)
- `revalidatePath('/admin/users')` in `after()`

## Note
Earlier CatalogMenuSelect `options` dep reset was a real selection bug; this ticket was the missing list patch after save.
