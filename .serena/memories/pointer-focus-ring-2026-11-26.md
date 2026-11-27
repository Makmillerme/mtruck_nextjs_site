Click focus ring (2026-11-26).

The black rectangle on click is the shadcn focus ring, not a border. TabsTrigger / Button use `focus-visible:ring-1 focus-visible:ring-ring`. `--ring` is `222 47% 11%` (rgb(15, 23, 41)). Tailwind `outline-none` is `outline: 2px solid transparent; outline-offset: 2px`, not `outline: none`.

Radix Tabs calls `element.focus()` in onMouseDown (`@radix-ui/react-tabs`). Chrome then matches `:focus-visible` on a mouse click, so the 1px navy ring paints. Measured on the PDP «Характеристики» tab and on «Отримати рішення»: keyboard focus shadow `rgb(15, 23, 41) 0 0 0 1px`; with `html[data-pointer-focus]` the ring variables are `0 0 #0000` and outline-style is `none`.

Fix: `PointerFocus` in `app/providers.tsx` sets `data-pointer-focus` on pointerdown (mouse/touch/pen, capture) and removes it on Tab/arrows/Home/End/PageUp/PageDown. Rule at the end of `app/globals.css` (unlayered) zeroes outline and `--tw-ring-shadow` / `--tw-ring-offset-shadow` for `:focus` except `input`, `textarea`, `select`, `[contenteditable=true]`. Text fields keep the ring. Keyboard focus ring stays. Active tab underline `border-b-2 border-foreground` is unchanged.
