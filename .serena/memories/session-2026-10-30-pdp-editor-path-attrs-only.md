# PDP UI Editor attributes = path only (2026-10-30)

User rejected subtree field hoist for product-page layout editor.

- Editor + save use `fetchAttributesForNode` (folder + ancestors only).
- Bare roots with no fields on path correctly show empty picker + hint to pick a folder that has fields.
- Removed `fetchAttributesForNodeSubtree`.
- Kept: TEXT empty→DESCRIPTION, key-facts opt-in (no preselect-all).
