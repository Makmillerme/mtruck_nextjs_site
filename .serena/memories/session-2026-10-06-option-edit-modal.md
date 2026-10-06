# Option edit modal + Dialog popover fix (2026-10-06)

## Done
- Depends-on option tags: corner **LuPen** (neutral outline) opens edit Dialog; independent tags keep ConfirmDeleteIcon trash.
- Shared create/edit Dialog layout in `components/admin/catalog/option-editor.tsx` (`CreateOptionDialog`, `EditOptionDialog`, `DeleteOptionButton`).
- Edit footer: Видалити (AlertDialog confirm → `deleteAttributeOptionAction`) + Скасувати + Зберегти (`updateAttributeOptionAction`).
- Backend: `updateAttributeOptionSchema` + `updateAttributeOptionAction` in `utils/taxonomy-schema.ts` / `utils/taxonomy-actions.ts`; `uniqueOptionSlug(attributeId, label, excludeOptionId?)`.
- i18n CatalogAdmin uk/en/de: `editOptionTitle`, `editOption`, `saveOption`, `optionUpdated`, `optionMissing`.

## Popover stacking root cause
- Dialog `z-[110]` + `overflow-visible` was not enough.
- `app/globals.css` had `body [data-radix-popper-content-wrapper] { z-index: 100 !important; }` → below Dialog.
- Fixed to **`z-index: 220 !important`** (sync with `PopoverContent` / picker).
- Verified in browser: Model create dialog parent list (Scania…MAN) fully above Dialog, clickable; edit TGX·MAN prefill OK.

## Stacking canon
- Sheet `z-50` → Dialog/Alert `z-[110]` → Popper wrapper / Popover `z-[220]`.

## Follow-up audit (edit modal)
- Duplicate `"use client"` removed.
- Global Dialog `overflow-visible` removed — caused white bleed when footer exceeded max-w; Popper portals + z-220 already fix select stacking.
- Edit footer canon = SheetFormActions: CatalogSubmit w-fit + ConfirmDeleteFormButton (destructive, separate hidden delete CatalogForm). No Cancel (Dialog X). Create: only Add w-fit.
