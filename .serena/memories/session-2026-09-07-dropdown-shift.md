# Session 2026-09-07: Radix dropdown layout shift

## Audit
Opening any Radix dropdown (locale, theme, sort) shifted the whole page left. Cause: `html { scrollbar-gutter: stable }` plus `react-remove-scroll` injecting `body[data-scroll-locked] { margin-right: 15px !important }`. Measured: scrollbar 15px, header 1221 → 1206 while open.

next-devtools `get_errors`: no config/session errors related to this.

## Fix
- `app/globals.css`: unlayered `html body[data-scroll-locked] { margin-right: 0 !important; padding-right: 0 !important }`.
- `components/ui/dropdown-menu.tsx`: `DropdownMenu` defaults to `modal={false}` so menus do not lock body scroll.
- Select/Sheet still lock; CSS cancels the extra margin. Verified locale + sort: headerW stayed 1220.8, margin 0, not locked.
