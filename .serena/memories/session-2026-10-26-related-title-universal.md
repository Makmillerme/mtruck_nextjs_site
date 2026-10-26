# Related section title — universal copy (2026-10-26)

`Product.relatedTitle` no longer assumes vehicles/equipment:

- uk: **Схожі товари** (was Схожа техніка)
- en: **Similar products** (was Similar vehicles)
- de: **Ähnliche Produkte** (was Ähnliche Fahrzeuge)

Also Lab demo `ui-lab-pdp.tsx` hardcoded title aligned.

Rationale: catalog is taxonomy-agnostic; PDP related is same-folder products, not “техніка”.
