Financing slider steps are stored on each preset.

`FinancePreset.termMonthsStep` (months, integer, default 1) and `downPaymentPercentStep` (percent, default 1) live on credit and lease. Admin fields are labeled `financingRangeStep` and sit in the same 3-column grid as the range, so the step wraps under the first column. The PDP slider uses those steps; `financingQuote` snaps the value onto the step.

Columns on `RootPricing`: `creditTermMonthsStep`, `creditDownPaymentPercentStep`, `leaseTermMonthsStep`, `leaseDownPaymentPercentStep`. `db push` applied. `prisma generate` hit EPERM because the dev server locks the query engine DLL; a fresh process can read the columns. Restart `npm run dev` once so the running server picks up the new client and a changed step is saved.
