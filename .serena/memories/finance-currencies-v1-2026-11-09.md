# Finance currencies list is DB-backed

Updated 2026-11-20.

- Admin list reads `Currency` rows. No static UAH/USD/EUR array in the panel.
- `ensureFinanceCurrencies` only creates UAH + FinanceSettings when the currency table is empty. It does not insert or overwrite USD/EUR.
- EUR seed row removed (no products). USD remains because existing products use it.
