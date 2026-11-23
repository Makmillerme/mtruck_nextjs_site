**Дата:** 2026-11-23

Три доробки фінансів / вартості:

1) **Блок «Вартість і ПДВ»** (`finance-pricing-view.tsx`): вертикальний стовпчик `max-w-md` — спосіб введення → ставка ПДВ → валюта сум ПДВ (валюта безпосередньо під ставкою, без двох колонок).

2) **Підколонки таблиці товарів** (`admin-products-view.tsx`): під системною «Вартість» — З ПДВ / Без ПДВ / ПДВ / Акційна знижка. `PRICE_SUB_COLUMN_IDS`, nested checkboxes у sheet колонок, `orderedVisibleSystemColumns`, розрахунок через `splitVat` + `convertViaBasePlain` + `applyPromoPreview` у валюті сум ПДВ кореня.

3) **Storefront / i18n**: основна сума = saleAmount, підпис за `entryMode` (`priceHintIncl/Excl/Plain` → «вартість …»). Три рядки З ПДВ / ПДВ / Без ПДВ лише якщо валюта товару ≠ `vatDisplayCurrencyCode`; інакше пара-комплемент. Admin.uk `price` = «Вартість». `PriceInput` уже показує 2/3 поля за тим самим правилом.
