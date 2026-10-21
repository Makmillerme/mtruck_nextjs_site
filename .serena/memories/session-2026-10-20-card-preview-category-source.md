# Card preview — categorySource (2026-10-20)

## Що зроблено

Вибір джерела підпису категорії в підзаголовку картки (`рік • категорія`):

- `LAYOUT_FOLDER` — назва папки, якій належить layout (`layout.taxonomyNode.name`)
- `PRODUCT_FOLDER` — назва кінцевої папки товару (`product.taxonomyNode.name`) — default

## Prisma

- `enum CardPreviewCategorySource { LAYOUT_FOLDER, PRODUCT_FOLDER }`
- `CardPreviewLayout.categorySource` `@default(PRODUCT_FOLDER)`
- `db push` + `generate` синхронізовано

## Runtime

- `lib/catalog/card-preview.ts`: `resolveCardPreviewLayout` + `fetchCardPreviewLayoutsByNodeIds` включають `taxonomyNode.name` → `layoutFolderName`
- `lib/catalog/product-to-vehicle.ts`: `categoryLabel` залежить від `categorySource`

## Адмін UI Editor

- Toggle «Папка layout» / «Папка товару» у `card-preview-editor.tsx`
- Save через `saveCardPreviewLayoutAction` (+ zod)
- Payload: `lib/admin/card-preview-editor-data.ts`
- i18n: `UiEditor.categorySource*` + `previewDemoProductFolder` (uk/en/de)

## Нотатка

Layout поки резолвиться строго по `product.taxonomyNodeId` (без walk-up предків). Тому на листку `LAYOUT_FOLDER` і `PRODUCT_FOLDER` часто дають ту саму назву; різниця видна в редакторі (демо-лейбл) і якщо згодом додамо успадкування layout від батьківської папки.
