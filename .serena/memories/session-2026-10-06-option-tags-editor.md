# Option values as tags (2026-10-06)

## Change
`components/admin/catalog/option-editor.tsx`:
- Removed `optionsTitle` heading
- Form (label «Значення» + Додати) first; tags below
- Options = `Badge variant="tag"` in `flex flex-wrap`
- Delete = `ConfirmDeleteIcon` gallery corner style (24px circle)
- Depends-on groups: form then tags under `optionsForParent`

`ConfirmDeleteIcon`: added `iconClassName` (parity with callback variant).

## Verify
Admin catalog → Марка sheet: form before tags; 5 brand tags; delete btn absolute rounded-full 24×24.