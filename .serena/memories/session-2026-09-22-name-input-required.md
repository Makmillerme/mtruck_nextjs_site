## Name field + required set (2026-09-22)

### Name
`ProductNameInput`: one h-11 field (input chrome). Editable text before template tags and after them. Hidden `namePrefix` / `nameSuffix` / `name`.

### Gear
`size="icon"` + `size-11` (no default `px-5` on a square).

### Required on product sheet
- Structural: folder, status (create default DRAFT), availability, price.
- Specs: **from CMS field flag `isRequired`** (UI + `specsFromFormData`). Not forced all-optional.
- Name, photos, description remain optional. Empty create cover: `/logo_mtruck.svg`.
