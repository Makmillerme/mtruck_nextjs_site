# Backlog

Ідеї, які свідомо не впроваджуємо зараз. Агент додає записи за правилом `.cursor/rules/backlog.mdc`.

## PDP універсальний ціновий / фінансовий блок

**Дата:** 2026-11-03

**Суть:** Hero buy-box зараз має статичний price + copy «Фінансування» (лізинг або кредит, орієнтовна сума/міс). Потрібен універсальний блок під будь-який товар (валюта, ПДВ, схеми лізинг/кредит, CMS-слоти, калькуляція, різні офери) без хардкоду під вантажівки.

**Статус:** Відкладено

## Google OAuth

**Дата:** 2026-08-20

**Суть:** Клієнт Google OAuth створено. Ключі в `.env` (`NEXT_PUBLIC_GOOGLE_AUTH=true`). Redirect: `http://localhost:3000/api/auth/callback/google`. Перед продом додати production origin + callback.

**Статус:** Готово до впровадження

## Stripe checkout

**Дата:** 2026-08-20

**Суть:** Онлайн-оплата як у e-commerce не підходить для продажу авто. Stripe, `/checkout`, `/api/payment`, `/api/confirm` видалені. Кошик лишився як залишок шаблону до адаптації під авто.

**Статус:** Скасовано

## Домен «авто» замість furniture Product

**Дата:** 2026-08-20

**Суть:** Шаблон — інтернет-магазин меблів. Ціль — сайт продажу авто. Окрема адаптація моделі/UI.

**Статус:** Відкладено

## Telegram bot / Mini App

**Дата:** 2026-08-20

**Суть:** Не в цьому репозиторії, поки користувач явно не попросить.

**Статус:** Відкладено

## Кошик по категоріях товарів

**Дата:** 2026-09-09

**Оновлено:** 2026-09-14

**Суть:** Кошик і checkout прибрано. Заявки на авто — `Order` (CATALOG з картки товару). Якщо з’являться витратні матеріали — окрема модель, не повертати furniture-cart.

**Статус:** Скасовано

## Збереження заявок (callback / partnership)

**Дата:** 2026-09-09

**Суть:** `submitCallbackInquiryAction` і `submitPartnershipInquiryAction` зараз лише валідують і показують toast — дані не пишуться в БД і не йдуть на email. Потрібен persistence + сповіщення.

**Статус:** Відкладено

## Реальні лічильники CategoryFinder

**Дата:** 2026-09-09

**Оновлено:** 2026-10-07

**Суть:** `getMockOfferCount` / `baseCount` у CategoryFinder — mock. Замінити на Prisma-агрегації по категоріях/марках.

**Статус:** Готово — `fetchHomeFinderPayload` рахує PUBLISHED у subtree; мок лишився лише для UI Lab brands.

## Живий flow замовлень

**Дата:** 2026-09-09

**Оновлено:** 2026-09-11

**Суть:** CATALOG: 1 клік зі сторінки авто (`createCatalogOrderAction`) → кабінет `/account/orders` і адмін `/admin/sales`. REQUEST (папка + CMS-поля, авто ще немає в каталозі) — наступний етап.

**Статус:** CATALOG готово / далі — REQUEST

## Реальні фото кейсів продажів

**Дата:** 2026-09-11

**Суть:** Триптих `#sales-cases` зараз кропає `/images/hero.webp`. Потрібні окремі кадри поставок, коли з’являться.

**Статус:** Відкладено

## Сторінка `/services` під канон головної

**Дата:** 2026-09-11

**Суть:** Головна вже шле на `/services#sale` і `/services#workshop`, але якорі відсутні, сторінка ще Lucide-картки шаблону. Перезбір під UI Lab, коли дійдемо до внутрішніх сторінок.

**Статус:** Відкладено

## Admin optimistic / cache-first mutations

**Дата:** 2026-09-22

**Суть:** Після аудиту адмінки: UI спочатку на фронті, запис у БД асинхронно (архів, sheet CRUD). Зараз списки чекають RSC.

**Статус:** Готово (архів/restore у list + archive; sheet CRUD поза скоупом)

## Shared admin filter-sheet примітив

**Дата:** 2026-09-22

**Суть:** Products і sales мають майже однакові inline filter Sheet; винести спільний компонент.

**Статус:** Готово (`AdminFilterSheet` у `admin-list-toolbar.tsx`)

## CMS delete → AlertDialog канон

**Дата:** 2026-09-22

**Суть:** CMS лишає inline sheet delete / two-step; уніфікація з `ConfirmDelete*` лише за явним запитом.

**Статус:** Готово (folder/fields/groups/options → `ConfirmDeleteIcon`)

## Міні-CRM «Продажі» (A+1)

**Дата:** 2026-10-01

**Суть:** Адмінка продажів як міні-CRM на рівні сайту (відкрите джерело даних). Ядро: `Order` = угода (Deal); `Users` = клієнти; `Products` = склад/облік. Без окремого Lead і без Inbox заявок на старті. Фаза 1 (коли дійдемо): переробити create/edit sheet + таблицю — показати й керувати `status` (NEW/IN_PROGRESS/CLOSED), `kind`, `origin`, `note`, оплату на вже існуючих полях Prisma. Заявки callback/partnership — окремий backlog-запис.

**Статус:** Відкладено

## Адмінка: фікси після аудиту

**Дата:** 2026-10-06

**Суть:** Edit замовлення більше не перетворює REQUEST на CATALOG; для замовлень без авто у таблиці показується папка. Фільтри і пошук products/sales/users у URL. Users мають фільтр за роллю. Переходи сайдбару з soft-nav. Міні-CRM (статус угоди, note, origin у UI) — окремо, вище.

**Статус:** Готово

## CMS → Модель даних + UI редактор

**Дата:** 2026-10-06

**Планова старт:** завтра (коли користувач повернеться до задачі)

**Суть:** Розділити поточний CMS (`/admin/catalog`) на два напрями в сайдбарі адмінки — за зразком «Товари» з вкладеними коренями (`Комерційна техніка` / `Не комерційна техніка`):

1. **Модель даних** — таксономія, поля, опції, групи відображення (те, що зараз у CMS як «структура каталогу»).
2. **UI редактор** — налаштування публічного вигляду, прив’язане до моделі:
   - вигляд і склад **фільтра на головній / у каталозі** (які поля, увімкнення/вимкнення);
   - **прев’ю картки** товару (list/grid);
   - **картка / сторінка товару** (які опції показувати);
   - **візуальний редактор положення компонентів** (layout блоків).

**Навіщо:** щоб адмін міг конфігурувати UX каталогу без коду, окремо від редагування самої схеми даних.

**Залежності / контекст:**
- Сайдбар: `app/[locale]/admin/Sidebar.tsx` + `productRoots` патерн.
- Поточний CMS: `app/[locale]/admin/catalog/page.tsx`, `components/admin/catalog/*`.
- Публічний фільтр: `components/products/catalog-filters.tsx`, `lib/catalog/public-filter.ts`, `utils/catalog-query.ts`.
- Картки: `components/vehicles/vehicle-card.tsx`, `mem:catalog-preview-cards`, `mem:marketing-vehicle-card-ui-spec-2026-09`.
- Display groups уже є в CMS — можлива точка розширення для UI-конфігу.

**Статус:** Фаза 0–2 — сайдбар CMS; фільтри (головна + каталог) у моделі даних (`showInFilter` / `showInHomeFilter` / `isFacet`); `/admin/ui` Filter — заглушка. Далі: превʼю картки, картка товару, visual layout.

## Inline-токени `{поле}` у textarea / TEXT AREA

**Дата:** 2026-10-30

**Суть:** У довгих текстах (`Product.description` або TEXT `textInput=AREA`) дозволити підстановку значень атрибутів через маркери на кшталт `{Пробіг}` / `{mileage}`. Formation templates (`DisplayGroup`) не чіпати — окремий механізм збірки назви/поля. Токени в textarea — окремий реліз після візуального PDP UI Editor.

**Статус:** Відкладено

## PDP «Комплектація» (модель + UI)

**Дата:** 2026-10-26

**Суть:** Модель = `AttributeType.MULTI_SELECT` (одне поле + багато опцій, як SELECT але multi). Зберігання через `ProductSpecOption`. PDP вкладка «Комплектація» показує MULTI_SELECT. Facet-фільтр каталогу по опціях — окремо пізніше.

**Статус:** Готово (v1 без facet)

## DisplayGroup → AttributeType.COMPOSITE

**Дата:** 2026-10-30

**Суть:** Не робити як `AttributeType`. Замість COMPOSITE — **шаблони формування поля** на `DisplayGroup` (`writesProductName` / `targetAttributeId` + члени): системна Назва або TEXT-атрибут, конфіг у CMS «Поля» на будь-якій папці. Підзаголовок картки лишається `CardPreviewLayout`.

**Статус:** Замінено (formation templates)

## UI Editor — Сторінка товару (порядок / видимість характеристик)

**Дата:** 2026-10-30

**Суть:** Таблиця «Детальні характеристики» на PDP — єдиний адаптивний 2-col UI. Модель `ProductPageLayout` + `ProductPageSpecSlot` (order + visible) per taxonomy folder; inheritance по предках як Card Preview. UI Editor → **«Сторінка товару»**: reorder + show/hide. Runtime: `resolveProductPageLayout` → `buildProductSpecGroups`.

**Оновлено:** 2026-10-30 — візуальний редактор: `keyFactsMax` + KeyFactSlots, вкладки TEXT/TABLE/LIST + TabSlots; SpecSlots лишаються legacy sync з першим TABLE.

**Статус:** Готово (візуальний editor)
