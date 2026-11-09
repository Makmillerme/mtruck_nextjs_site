# Admin list mobile cards — activate + actions (2026-11-09)

## Canon
`components/admin/admin-list-mobile.tsx`
- `AdminListMobileCard` + optional `onActivate` (whole-card edit on phone)
- Card uses `role="button"`; nested controls use `data-no-card-activate` / real buttons/links
- **Bugfix:** `isInteractiveTarget` must compare hit ≠ `currentTarget` — otherwise the card’s own `role="button"` blocked activate
- `AdminListMobileActions` wraps icon rails (cards + desktop table cells)

## Per-list mobile actions (pencil removed; edit via card tap)
- **Products:** archive (admin) + card → edit sheet
- **Users:** shopping bag (create order) + archive when allowed + card → edit when `canEditUser`
- **Sales orders:** archive (admin) + card → edit sheet
- **Archive:** restore + hard-delete when `canDelete` (admin); users also need `canMutateUserArchive` / empty product+order counts for hard delete
- **Inquiries:** call button (no edit sheet)

## Desktop
Tables keep pencil + secondary actions (bag/archive).

## Notes
Archive soft-delete / restore / hard-delete still gated by `requireAdminMutation` (= ADMIN). Managers do not see those icons.
