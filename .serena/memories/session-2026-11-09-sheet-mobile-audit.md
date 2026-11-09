# Sheet mobile audit (2026-11-09)

## Canon (unchanged)
`components/ui/sheet.tsx` right/left: `w-[min(100%-4.5rem,28rem)]` + `sm:max-w-lg`, safe-area pt/pb, outside-close guard 400ms, floating-layer dismiss block.
Dialog/AlertDialog: inset `w-[calc(100%-2rem)]`, safe-area, z-[110] (nested over sheet z-50).

## Inventory (SheetContent callers)
| Caller | Override | Status |
|---|---|---|
| Admin products/sales/users create+edit | default | OK peek+safe-area |
| Admin columns sheet | default | OK |
| AdminFilterSheet | `overflow-hidden` | OK sticky footer |
| CMS fields/folders/display-groups | default | OK |
| UserAccountSheet (nav menu) | default | OK |
| order-added-sheet | default (removed redundant flex) | OK |
| CatalogFilterSheet | `p-0` + sticky | **fixed** re-add safe-area pt/pb |
| ui/sidebar mobile | `p-0` + `--sidebar-width` 18rem | allowed exception |
| UI Lab demos | default | OK |

## Fixes applied this audit
1. Catalog filter SheetContent: restore `pt/pb` safe-area when `p-0` (was zeroing insets).
2. `SheetFormActions` + create SubmitButtons (products/sales/users) + CMS CatalogSubmit: `w-full sm:w-fit` for phone tap targets.
3. `ConfirmDeleteFormButton` optional `className` for full-width archive on mobile.
4. order-added: drop redundant `flex flex-col` className.
5. CMS display-groups sheet save Button: `w-full sm:w-fit` (was `w-fit` only).

## Runtime (next-devtools :3000)
- projectPath = mtruck_nextjs_site
- get_errors: configErrors=[], sessionErrors=[]

## Verified
- Product edit sheet @390px: peek ≈72px (4.5rem), paddingTop 32px — matches canon.
- next-devtools `get_errors`: clean at audit time (session later mixed with other :3000 app / phone-dev).
- Hydration overlays in browser often from Cursor `data-cursor-ref`, not app.

## Follow-ups (not blocking)
- Admin CRUD sheets scroll whole panel (actions not sticky) — OK vs filter sticky pattern; sticky save footer would be a separate UX pass.
- Specs tab already stacks `<md` (`mem:session-2026-11-09-product-specs-mobile-stack`).
- Do not add `w-full` / `w-screen` on SheetContent callers (fights peek).
