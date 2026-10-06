# Modal footer button canon (2026-10-06)

## Canon
Dialog / AlertDialog footer buttons:
- **size** `default` → `h-11 px-5` (never mix with `lg` h-12 in the same footer)
- **layout** `DialogFooter` / `AlertDialogFooter` → row, `sm:justify-end`
- **variants**: primary Save; outline Cancel; destructive Delete/Archive (trigger + confirm)

UI Lab live samples: `components/dev/ui-lab-dialog-footer.tsx` (Overlays section).

## Root fixes
- `ConfirmDeleteFormButton`: default size `default`; archive trigger also `destructive` (was outline)
- Confirm submit in AlertDialog: explicit `size="default"`
- `SheetFormActions`: `SubmitButton size="default"` (sheet layout stays flex gap-2 left)

## Migrated Dialogs
- `option-editor` create/edit — no justify-start wrapper; Save + Delete in DialogFooter
- `product-name-settings-dialog` — submit in DialogFooter
- `AccountSettingsForms` avatar/password — DialogFooter + SubmitButton size default
- move-folder Dialog already outline+primary justify-end

## Out of scope
- Command palette Dialog
- Global SubmitButton default (still lg elsewhere)

## Verified
Option edit FH16: Save + Delete both height 44px, right-aligned.
