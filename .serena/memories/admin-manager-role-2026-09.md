# Admin Manager role — 2026-09-17

## Role model
- Prisma `UserRole`: `USER | ADMIN | MANAGER`
- **Staff** = ADMIN | MANAGER → admin layout (sales, products, users)
- **ADMIN only**: CMS `/admin/catalog`, all `taxonomy-actions`, staff deletes (products/orders/users), role assignment, `ui-lab`

## Session helpers (`utils/session.ts`)
- `isAdminRole` — ADMIN
- `isStaffRole` — ADMIN | MANAGER
- `getStaffUser()` → `{ user, role }` for admin layout + staff CRUD
- `getAdminUser()` — ADMIN only (CMS / ui-lab)
- `requireAdminMutation()` — staff gate then ADMIN-only; throws `Admin.forbiddenDelete`

## Gates
- Admin layout: `getStaffUser`; Sidebar hides CMS unless `isAdmin`
- Catalog page: `getAdminUser()` at top
- Deletes: `requireAdminMutation` in `deleteProductAction`, `deleteAdminOrderAction`, `deleteAdminUserAction`
- Create/update users: manager forced `USER` on create; cannot change role on update
- Navbar: `isStaffRole` for admin panel link

## UI
- `canDelete` / `canManageRoles` props on users/products/sales views
- Role select shows MANAGER only for ADMIN
- Managers do not see ADMIN users in list/order pickers
- Managers may only edit `USER` (not MANAGER/ADMIN); server enforces `forbiddenEditStaff`

i18n: `roleManager`, `forbiddenDelete`, `forbiddenCms`, `forbiddenEditStaff` (uk/en/de)
