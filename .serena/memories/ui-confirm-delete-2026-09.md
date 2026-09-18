# Confirm delete (2026-09-17)

## Rule
Every destructive delete needs explicit confirmation before submit.

## Primitives
- `components/ui/alert-dialog.tsx` — shadcn AlertDialog; overlay/content `z-[110]` (above Sheet z-100).
- `components/form/ConfirmDelete.tsx`:
  - `ConfirmDeleteIcon` — trash icon opens dialog, then FormContainer + server action.
  - `ConfirmDeleteFormButton` — destructive button submits external form by `formId` after confirm.
- `components/admin/sheet-form-actions.tsx` — save + optional `ConfirmDeleteFormButton` via `deleteFormId`.

## Wired call sites
- Admin table icons: users, sales/orders, products → `ConfirmDeleteIcon`
- Account: orders delete, favorites remove → `ConfirmDeleteIcon`
- Reviews: `components/reviews/DeleteReviewButton.tsx`
- Sheet footers: SheetFormActions (users/sales/products/account orders)

## Already OK (left as-is)
- CMS catalog: folder-tree, fields-panel, display-groups, option-editor — inline two-step confirm in sheet (not AlertDialog).

## i18n (Common)
`cancel`, `confirmDeleteTitle`, `confirmDeleteDescription`, `confirmDelete` — uk/en/de.

## UI Lab
Overlays section documents the rule + live AlertDialog demo.
