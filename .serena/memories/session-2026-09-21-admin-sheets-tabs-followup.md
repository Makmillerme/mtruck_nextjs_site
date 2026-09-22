# Admin sheets / tabs / cascade follow-up (2026-09-21)

## Fixes
1. **CascadeSelect** rewritten to **Popover + expandable tree** (works inside Sheet; DropdownMenu Sub did not open).
2. **Sales + Users** sheets: local open state + `history.replaceState` (same as products). Users role → `CatalogMenuSelect`.
3. **CMS tabs** (`cms-tabs.tsx`): local tab + `replaceState` (both panels already SSR’d).
4. **Account cabinet**: single `/account?tab=` page loads orders+favorites+settings once; client tabs like archive. Old `/account/orders|favorites|settings` redirect. Shell `showTabs={false}`. Orders sheets use `onSheetUrlChange` / replaceState.

## Links
- `utils/links.ts` account nav → `/account?tab=…`
