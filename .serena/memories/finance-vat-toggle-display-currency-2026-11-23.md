**Дата:** 2026-11-23

ПДВ за перемикачем (`vatEnabled`) і окрема валюта сум (`vatDisplayCurrencyCode`) на `RootPricing`.

- Схема: `vatEnabled` default true, `vatDisplayCurrencyCode` optional → Currency.
- Фінанси: Switch у блоці «Вартість і ПДВ»; галочки show* прибрані з UI; при збереженні show* виводяться з entryMode.
- Картка товару: `PriceInput` показує пару Без ПДВ+ПДВ (якщо INCL) або З ПДВ+ПДВ (якщо EXCL) у валюті ПДВ; при вимкненому блоці — підпис «Вартість».
- Storefront: основна ціна = saleAmount у main currency; пара рядків ПДВ лише якщо vatEnabled, у vatDisplayCurrency.
- Клієнт: `splitVat` без Prisma Decimal; `convertViaBasePlain` у `lib/finance/convert-plain.ts` (не імпортувати `convert.ts` у клієнт — Prisma/async_hooks); `applyPromoPreview`.

Перевірено: фінанси — Switch ховає/показує поля; лист Scania R500 — «Вартість з ПДВ» + «Без ПДВ» / «ПДВ» у грн.
