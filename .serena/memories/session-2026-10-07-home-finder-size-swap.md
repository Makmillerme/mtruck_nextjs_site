# Homepage finder card size swap (2026-10-07)

User asked to swap sizes of L2 type cards vs L3 subtype cards in `CategoryFinderPanel`.

- L2 types (`Вантажні авто` / `Спецтехніка`): now `size="sm"` (compact)
- L3 subtypes (`Фургони` / nested under selected type): now default `md` (larger)

Indent (`border-l-2`) still marks nesting; size hierarchy is inverted vs previous canon.