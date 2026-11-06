# Mobile gutter symmetry (2026-11-06)

## Cause
`html { scrollbar-gutter: stable }` + forced 8px `::-webkit-scrollbar` reserved a right strip on phones → content L/R insets looked unequal (and not canon).

## Fix (`app/globals.css`)
- Thin scrollbar canon on `html` + `.app-scroll` at all breakpoints (same Lab look).
- `scrollbar-gutter: auto` by default; `stable` only from `min-width: 768px` (avoids right strip / asymmetric gutters on phones).
- Locale `viewport.viewportFit: "cover"` so `env(safe-area-inset-*)` works on modern Android (OnePlus etc.).
- Note: some Android Chrome builds still use overlay OS scrollbars and may ignore `::-webkit-scrollbar` on the document — sheets (`.app-scroll`) still get the thin bar.
- `.page-container` / `.page-content`: `padding-inline: max(canon, safe-area-L, safe-area-R)`.

## PDP sticky CTA
Was `px-4` (16px) vs canon 20px. Now outer `py-3` + inner `.page-container` (no `!px-0`).

## Canon unchanged
Mobile 1.25rem / tablet+ clamp 2–2.25rem.