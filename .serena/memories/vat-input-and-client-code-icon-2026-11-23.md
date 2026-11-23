# VAT field and client-code icon (2026-11-23)

`finance-pricing-view` VAT percent is a text field (`vatText`) so the value can be cleared. Empty or `.` saves as 0; other text must be 0–100. Scope change reloads the text from that root. The old controlled `Number(value || 0)` put 0 back on every delete.

`UserCodeChip` non-compact: copy icon sits on the same row as the code, under the «Номер клієнта» label. Compact menu stays number + icon on one line.
