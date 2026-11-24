# PDP VAT dedupe + currency narrowSymbol (2026-11-24)

## VAT column vs left stack
Same-currency rule already hid the main amount from VAT when `!vatCurrenciesDiffer` (resolve pushes complement only).
When main currency ≠ VAT currency but a **STACKED extra** equals a VAT line (e.g. main USD + extra UAH = «Без ПДВ»), PDP now filters VAT lines whose `currency+amount` already appear as `main` or `extra` (`app/[locale]/products/[id]/page.tsx`).

## Symbols mode
`formatProductPrice` SYMBOL uses Intl `currencyDisplay: "narrowSymbol"` (not `symbol`). For `uk-UA`/`de-DE`, CLDR `symbol` for USD/EUR/GBP is the ISO code; `narrowSymbol` yields `$`/`€`/`£`. UAH stays `₴`.

Related: `mem:currency-display-mode-and-pdp-price-canon-2026-11-23`, `mem:pdp-extra-currencies-under-main-2026-11-23`.