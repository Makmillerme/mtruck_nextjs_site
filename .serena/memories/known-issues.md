# Radix overlay layout shift (2026-09-07)

Opening DropdownMenu / Select / Sheet used to shift the whole page left, then restore on close.

## Cause
- `html { scrollbar-gutter: stable }` already reserves the scrollbar (~15px).
- Radix modal uses `react-remove-scroll`, which injects `body[data-scroll-locked] { margin-right: 15px !important }`.
- Double compensation: header/content shrink from the right (looks like a left slide).

## Fix
- Unlayered CSS in `app/globals.css`: `html body[data-scroll-locked] { margin-right: 0 !important; padding-right: 0 !important }` — higher specificity than the injected rule, not inside `@layer` so it wins.
- `DropdownMenu` primitive defaults to `modal={false}` so menus do not lock body scroll. Sheets/Dialogs still lock; CSS prevents their shift too.

Do not remove `scrollbar-gutter: stable` (needed to avoid 100vw/full-bleed overflow).
