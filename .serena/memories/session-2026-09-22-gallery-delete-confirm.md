# Gallery delete UX (2026-09-22)

## Change
- Thumb delete: circle (`rounded-full` `size-6`) flush on corner (`absolute -right-1.5 -top-1.5`); thumb frame overflow only on inner media so badge can hang on corner.
- Confirm before remove: `ConfirmDeleteCallbackIcon` in `components/form/ConfirmDelete.tsx` — AlertDialog + Common i18n (`confirmDeleteTitle` / Description / confirmDelete / cancel), then client `onConfirm` (no server form).
- Wired in `components/admin/products/product-image-gallery-field.tsx`.

## Verify
Browser sheet: buttons 24×24, borderRadius 9999px, offset -6px; click opens «Видалити?» / «Цю дію не можна скасувати.».
