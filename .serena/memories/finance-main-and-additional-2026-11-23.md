## Finance currencies: main + additional (2026-11-23)

UI `finance-currencies-view.tsx` splits the tab into «Основна валюта» (select, autosave, rate always 1) and «Додаткові валюти» (every other row). No single «Валюта покупця» picker or «Для покупця» badge.

Data: `siteCurrencyCode` is kept equal to `baseCurrencyCode` (`getFinanceSettings` aligns once; `updateFinanceSettings` always writes site = base). Default storefront price is the main currency. Header switch (`allowBuyerCurrencySwitch`) lists every active currency. New and updated currencies are `isBuyerVisible: true`. Delete/disable protection is only the main currency, plus product usage for delete.

Checked live: directory had only USD, shown as main; additional section empty. `tsc --noEmit` clean. No commit.
