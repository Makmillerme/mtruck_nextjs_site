# Dropdowns inside Sheet/Dialog: scroll fix (2026-10-07)

## Bug
All Popover / DropdownMenu lists opened inside a Sheet or Dialog could not be scrolled with the wheel/touch (search looked dead too).

## Root cause
Those layers use `modal={false}` and portal to `<body>`, i.e. outside the open Sheet. The Sheet's `react-remove-scroll` listens for `wheel`/`touchmove` on `document` (bubble) and `preventDefault`s everything outside its content. Verified: `WheelEvent.defaultPrevented === true` on popover items before fix, `false` after.

## Fix (primitives, covers every dropdown)
- `lib/ui/floating-scroll.ts` — `useFloatingScrollRef(ref)`: callback ref that adds native `wheel`/`touchmove` listeners calling `stopPropagation()` on the layer, so the lock never sees them; native scroll proceeds. Ref assignment via `assignRef` helper (React Compiler forbids mutating hook args).
- `components/ui/popover.tsx` `PopoverContent` uses it.
- `components/ui/dropdown-menu.tsx` `DropdownMenuContent` + `DropdownMenuSubContent` use it; both now `max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto overflow-x-hidden` (was `overflow-hidden`, long menus got clipped). `SubContent` is now portaled so parent's overflow does not clip submenus.
- `Select` untouched: Radix Select is always modal with its own scroll lock.

## Notes
- Focus/typing in search worked in the test; the visible failure was scroll.
- Hydration warnings with `data-cursor-ref` come from the browser automation tool, not app code.
- Do not run global `npx prettier` on `components/ui/*`: no project prettier config, it rewrites the whole file style.
