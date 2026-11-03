# CascadeSelect leafOnly for UI Editor (2026-10-30)

- `CascadeSelect` prop `leafOnly`: parents open cascade but are not selectable; only nodes without children.
- Enabled on card-preview-editor + product-page-editor folder pickers (`variant=tree`).
- Other CascadeSelect call sites unchanged (default leafOnly=false).
