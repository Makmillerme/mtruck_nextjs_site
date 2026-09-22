## Name chip input (2026-09-22)

Product name with writer template is one input shell (`h-11` border):
`[prefix text] [tags…] [suffix text]` + gear.

- Tags inline inside the shell (`ProductNameTags inline`).
- Free text before and after tags (not a separate extra field below).
- Final name = `joinProductName(prefix, composed, suffix)` → **trim + single spaces** between non-empty parts.
- UI spacers (transparent space) between text and tags so visual matches saved string.
- Form: `namePrefix`, `nameSuffix`; server `resolveProductNameWithExtra({ prefix, suffix })`.
- Edit restore: `splitProductNameAroundComposed` (trimmed).