# Admin archive (soft-delete via archivedAt)

**Немає окремої таблиці Archive.** Статус архіву — nullable `archivedAt DateTime?` на `User`, `Product`, `Order`.

## User archive guards (2026-09)
- `assertUserArchiveMutationAllowed` у `utils/actions.ts` для archive/restore/delete.
- **ADMIN** (`role === ADMIN`): заборона архіву, відновлення та видалення — `Admin.userArchiveAdminProtected`.
- **Self staff**: якщо `target.id === actor.id` і `isStaffRole` (ADMIN/MANAGER) — `Admin.userDeleteSelf`.
- UI: `canMutateUserArchive` у **`utils/user-roles.ts`** (client-safe, без next/headers); кнопки приховані в `admin-users-view` та `admin-archive-view`. `currentUserId` з `getStaffUser()`.
- `utils/session.ts` re-export `isAdminRole`, `isStaffRole`, `canMutateUserArchive` з `user-roles.ts` для server pages.

## Дії / UI / deep-link
Archive/restore/permanent actions, `/admin/archive` tabs, sales→users `?edit=`, i18n, login block for archived users.