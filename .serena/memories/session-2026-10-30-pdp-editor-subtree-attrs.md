# Fix: PDP details empty + key facts picker (2026-10-30)

## Root causes
1. Layout on root «Техніка» used `fetchAttributesForNode` (path only) → 0 attrs; fields live on children (12 in subtree). MemberOrderPicker had nothing to pick.
2. Saved TEXT tab «Опис» with 0 slots → PDP skipped empty TEXT → no details card.
3. Key facts seeded all-visible when unset → picker add list empty (everything already selected).

## Fixes
- `fetchAttributesForNodeSubtree` + use in editor load/save allowed set
- Key facts: seed hidden; runtime falls back to sortOrder top-N if none visible
- TEXT empty slots → DESCRIPTION on save/load/kind-switch; runtime empty TEXT uses Product.description
- i18n hint `productPageNoSubtreeFields`
