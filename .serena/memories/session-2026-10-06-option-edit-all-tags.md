# Option edit for all SELECT tags (2026-10-06)

## Decision
All SELECT option tags use corner **LuPen** → `EditOptionDialog`. Tag-level `ConfirmDeleteIcon` removed; delete only from dialog footer (`ConfirmDeleteFormButton`).

## Behavior
- **Independent** (e.g. Марка / make): dialog = label + Save / Delete — no `ParentSelect`.
- **Depends-on** (e.g. Модель / model): dialog = parent `CatalogMenuSelect` + label + Save / Delete. Tag display still `label · parentLabel`.

## File
`components/admin/catalog/option-editor.tsx`
- `OptionTag`: always `LuPen` → `onEdit(option)`.
- `OptionTagList`: no `dependsOnParent` / delete props.
- `EditOptionDialog` / create: `ParentSelect` only if `dependsOnParent`.
- Delete stays in edit footer via `deleteAttributeOptionAction`.

## Backend
`updateAttributeOptionAction` already allows update without parent for non-depends — no change.

## Verified (browser)
- Марка sheet: all tags «Редагувати значення»; Mercedes-Benz edit → only «Значення», Зберегти, Видалити — no parent.
- Модель sheet: tags with `· parent`; Actros 1845 edit → «Батьківське значення» (Mercedes-Benz) + «Значення» + footer.

## Related
- Modal footer canon: `mem:session-2026-10-06-modal-footer-canon`
- Option edit modal earlier: `mem:session-2026-10-06-option-edit-modal`

## Deferred (not this task)
CMS folders/fields toolbar unify + search.
