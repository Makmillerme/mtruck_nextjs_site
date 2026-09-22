# Spec number inputs + gallery delete (2026-09-22)

- Shared `lib/ui/number-input.ts` (`numberInputClassName` + `blurNumberInputOnWheel`) used by `PriceInput` and CMS NUMBER/YEAR in `product-spec-fields` (no spinners / wheel).
- Gallery thumbs: red `LuTrash2` top-right; removes from list; `updateProductAction` deletes DB rows + files not kept in `imageOrder` (empty order → cover `/logo_mtruck.svg`).
- i18n `Admin.imagesRemove`.
