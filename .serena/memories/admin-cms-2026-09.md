# Адмінка CMS (таби Папки / Поля) — 2026-09

Коміт: `519305c` (локальний, після `315d03b`). Продовження `catalog-constructor-2026-09`.

## Що змінилось у UI

- `/admin/catalog` тепер називається **CMS** (`Admin.catalog` = "CMS" у uk/en/de). URL не змінювався.
- Сторінка розділена табами через `?tab=folders|fields` — `components/admin/catalog/cms-tabs.tsx` (client, `router.push`, зберігає `&node=`).
- Сайдбар адмінки — sticky `Card` як `CatalogFilterSidebar` (`app/[locale]/admin/Sidebar.tsx`), сітка лейауту `lg:grid-cols-[16rem_minmax(0,1fr)]`.
- `attribute-panel.tsx` **видалено**, замінено на `fields-panel.tsx`.

## Таб «Папки»

`components/admin/catalog/folder-tree.tsx` — тепер **client**, режими `manage` / `pick`.

- Згорнуте за замовчуванням; клік по назві або шеврону розкриває підпапки. Предки вибраної папки розкриті на старті.
- У рядку: `LuArrowUp`, `LuArrowDown`, `LuPlus` (підпапка), `LuPen`, `LuTrash2`. Кнопка «Коренева папка» — у тулбарі зверху.
- Усі форми — у правому `Sheet` (`sm:max-w-md`): створення, перейменування, видалення.
- У режимі `pick` (таб Поля) клік по назві робить `push('/admin/catalog?tab=fields&node=ID')`.

## Таб «Поля»

`components/admin/catalog/fields-panel.tsx` (client) + дерево в режимі `pick` зліва.

- Списком: спершу власні поля папки, потім наслідувані з підписом «з папки X» (тільки читання).
- Бейджі: обов’язкове / фільтр / ідентичність / кількість значень.
- Sheet створення: name, type, dependsOn (усі SELECT у гілці), unit, прапорці. Sheet редагування: name, unit, прапорці + `OptionEditor`.
- `option-editor.tsx` переписано на client; видалення значення — інлайн-підтвердження (без вкладених Sheet).
- Sheet тримає `attributeId`, а не знімок атрибута, тому після додавання опції список оновлюється без перевідкриття.

## Серверна частина

- `utils/taxonomy-action-state.ts` — `TaxonomyActionState { message, ok? }`, `TaxonomyAction`, `initialTaxonomyActionState`. Типи винесені окремо, бо файл дій — `"use server"`.
- Усі дії в `utils/taxonomy-actions.ts` повертають `ok`, завдяки чому `CatalogForm` (`components/admin/catalog/catalog-form.tsx`) закриває Sheet лише при успіху й показує toast `destructive` при помилці.
- **`moveTaxonomyNodeAction`** — `up`/`down`, нормалізує `sortOrder` сусідів 0..n у `db.$transaction`. Цей порядок піде і в публічний фільтр.
- **`deleteTaxonomyNodeAction`** — каскад підпапок і полів через FK, але **блокує**, якщо в гілці є товари (`getSubtreeStats().productCount`). Старий `folderHasChildren` прибрано.
- `lib/catalog/taxonomy.ts`: `fetchAttributeCountByNode`, `collectSubtreeIds`, `getSubtreeStats`, `fetchSiblingNodes`. `buildTaxonomyTree` рахує `attributeCount`, `subtreeProductCount`, `subtreeAttributeCount`, `descendantCount` — з них Sheet видалення показує, що саме зникне.
- `utils/taxonomy-schema.ts`: `moveTaxonomyNodeSchema`.
- `components/admin/catalog/catalog-fields.tsx`: додано `CatalogSubmit` (варіанти кнопки + `useFormStatus`).

## Перевірено

`npx tsc --noEmit` і `npx eslint` — чисто. Ключі `CatalogAdmin` у uk/en/de збігаються (89 шт.).

## Не в цьому обсязі

Публічні фасети `/products`, finder з БД (`FINDER_CATEGORIES` — мок), i18n назв папок, кошик по папках, специфікації у формі редагування товару.
