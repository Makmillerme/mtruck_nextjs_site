# Sheet popover search was unclickable (2026-10-07)

## User report
Search row in combobox (`SearchableEntityPicker`, e.g. Локація) looks dead: no caret, no typing. Scroll was a separate bug (already fixed via `useFloatingScrollRef`). This is the focus issue.

## Root cause
1. Duplicate Radix internals: Dialog used nested `@radix-ui/react-focus-scope@1.1.16` (from `react-dialog/node_modules`), Popover used top-level `1.1.7`. Nested FocusScope stacks did not pause each other, so Sheet yanked focus out of the portaled search.
2. Callers then set `Popover modal={false}` as a workaround, which **removed** Popover’s FocusScope entirely. Sheet trap still treated the portaled input as outside and stole focus on real mouse clicks.

## Fix
- Deduped Radix: `npm ls` now shows one `react-focus-scope@1.2.0` and one `react-dismissable-layer@1.1.20` shared by Dialog, Popover, DropdownMenu, Select.
- `Popover` primitive defaults `modal={true}` so nested trap pauses the Sheet.
- Removed `modal={false}` from pickers, catalog filter combobox, sheet date, cascade tree popover.
- Search `Input` `onPointerDown`: stopPropagation + `focus()`.

## Verify
Hard refresh. Open product sheet → Характеристики → Локація. Click the search field: caret must appear, typing filters the list.
