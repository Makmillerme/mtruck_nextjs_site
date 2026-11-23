## Finance settings apply immediately; delete lock; price needs a currency (2026-11-23)

### Autosave
`components/admin/finance/finance-currencies-view.tsx`: Основна валюта, валюта покупця і перемикач покупця викликають `updateFinanceSettingsAction` одразу. Кнопки «Зберегти налаштування» немає. Черга `settingsChain` + `settingsDraft`/`lastConfirmed`, щоб швидкі зміни не затирали одна одну. Після успіху — toast і `router.refresh()`. Зміна основної як і раніше обнуляє курси інших валют.

### Delete
`listCurrencies` додає `productCount` (groupBy Product.currency). Смітник схований, якщо код — основна, валюта покупця (чернетка або збережена) або `productCount > 0`. Сервер `deleteCurrency` лишає `CANNOT_DELETE_PROTECTED_CURRENCY` і `CURRENCY_IN_USE`.

### Product price without currencies
`PriceInput`: якщо `currencyOptions` порожній — поле ціни disabled, без name, текст `Admin.priceNeedsCurrency` і `Link` на `/admin/finance` (напис `Admin.finance`). Немає фейкового USD. Кнопка створення товару disabled, коли немає опцій. `createProductAction` відхиляє валюту, якої немає серед активних. `productSchema.currency` більше не має `.default("USD")`.

### Verified
На `/admin/finance` зміна валюти покупця UAH↔USD застосувалась без кнопки збереження; після перевірки повернуто на USD. Смітника немає на UAH (основна) і USD (покупець + товари). Форма «Новий товар» має поле ціни, бо валюти вже є. `tsc --noEmit` чистий. Коміт не робився.
