# Cascade panels in Sheet + company/featured note (2026-09-29)

## Cascade / folder picker
DropdownMenu `menu` variant breaks inside product Sheet (Radix Sub + Dialog). ProductFolderPicker + move dialog use `variant="tree"` again.

`tree` is now **side panels** (hover opens next column, click selects) — same mental model as CMS cascade, but Popover-based so it works in Sheet.
CMS TemplateFolderPicker stays `menu`.

## company + featured
NOT CMS attribute fields. Columns on Prisma `Product` from the e-commerce furniture template:
- `company` String — filled from identity SELECT (`companyFromIdentity`); also search/filter/sales labels
- `featured` Boolean — homepage/catalog «recommended» + admin filter

Removed from table column picker earlier. **Do not drop from DB** without a dedicated migration plan (identity, public filter, seed demos all depend on them). They are internal product columns, not user-facing CMS fields.
