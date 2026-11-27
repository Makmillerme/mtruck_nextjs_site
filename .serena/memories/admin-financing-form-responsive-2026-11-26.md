Admin financing preset fields share one column rhythm.

`PresetFields` in `components/admin/finance/finance-financing-view.tsx`: rate (and lease residual) use the same `grid-cols-1 md:grid-cols-3` as the term and down-payment triplets. No `sm:max-w-xl` / two-column cap. On desktop each input is one third of the section (verified 249px, left edges aligned). Credit rate occupies the first cell; lease rate and buyout occupy the first two.
