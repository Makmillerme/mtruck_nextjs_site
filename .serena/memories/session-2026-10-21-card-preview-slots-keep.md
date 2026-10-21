# Card preview: slots keep on style switch (2026-10-21)

## Чому «скидалось до хардкоду»
- Хардкод seed: `DEFAULT_CARD_PREVIEW_KEYS` у `lib/catalog/card-preview.ts` = `mileage, transmission, euro, feature` (Пробіг, КПП, Євронорма, Особливість). Використовується лише коли layout ще немає або slots порожні.
- Баг UX: `onSpecsStyleChange` / `onSpecsGridCountChange` робили `slice(0, slotMax)` і **знищували** зайві поля в стейті. При GRID=4 перші 4 часто збігалися з seed → виглядало як reset до дефолту. Save теж писав лише `max` слотів у БД.

## Фікс
- Стиль/кількість лише обмежують **відображення** на картці (`slice` у preview / `resolveCardPreviewLayout`).
- Повний список слотів лишається в редакторі й у БД (до `CARD_PREVIEW_SLOT_MAX`).
- Файли: `card-preview-editor.tsx`, `card-preview-editor-data.ts`, `card-preview-actions.ts`, i18n `specSlotsHintVisible`.
