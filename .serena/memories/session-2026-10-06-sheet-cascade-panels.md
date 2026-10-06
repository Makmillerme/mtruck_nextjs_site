# Sheet cascade = CMS menu look (2026-10-06)

`components/form/cascade-select.tsx`, `variant="tree"` (Sheet/Dialog-safe; Radix DropdownMenu Sub is flaky inside modal Sheet because body pointer-events:none).

`CascadePanels` mimics Radix DropdownMenu Sub:
- Popover content transparent (`w-auto border-0 bg-transparent p-0 shadow-none`); each column is its own `rounded-sm border bg-popover p-1` card, `-ml-1` overlap.
- Column top aligned to trigger row via useLayoutEffect offsets (`clientTop + offsetTop - scrollTop`).
- Rows: role=menuitem, Radix item classes, `bg-accent` on open parent, `ChevronRightIcon` (@radix-ui/react-icons) for parents, LuCheck for selected.
- Hover: `onPointerMove` (mouse only) opens path; focus opens path too (popover autofocus opens first branch).
- Touch/pen: first tap on a closed parent opens submenu, second tap selects (pointerTypeRef from onPointerDown).
- Keyboard: ArrowUp/Down in column, ArrowRight opens + focuses first child, ArrowLeft back to parent row; Enter selects.
- `allowEmpty` -> `emptyRow` as `leading` of column 0.

Verified in browser: product sheet (create/edit) and move dialog; click on child selects full path; submenu top == parent row top.
