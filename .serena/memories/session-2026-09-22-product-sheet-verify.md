## Product sheet UX verify (2026-09-22 follow-up)

### Findings
- DB has attributes (10 defs; 9 on «Вантажні авто»). Display groups: 0.
- Screenshot Name→Description with no specs = **no folder selected** (`selectedNodeId` falsy). Gear correctly `disabled` until folder chosen.
- Height bug: Input `h-11`, Button `size-icon` = `size-9` → misaligned.

### Fixes
- Gear button `h-11 w-11`, row `items-center`; controlled Dialog (no DialogTrigger).
- Hints: `productNameSettingsNeedFolder` under name; `productSpecsNeedFolder` when no folder.
- `setCreateOpen` reloads meta if folder already set; `loadSheetMeta` try/catch clears on error.

### Usage
Select folder «Вантажні авто» (or child with attrs) → specs load via `loadProductSheetMetaAction`; gear enables.
