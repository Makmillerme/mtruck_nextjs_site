# UI primitives (2026-09)

- Buttons 01+03: `--primary` = `--foreground` navy. `default` navy fill on light; white plate on `[data-header-surface=dark]`. No drop-shadow. Sizes default h-11, sm h-9, lg h-12.
- `destructive` = same geometry as `default` (transparent border + solid fill + `/90` hover), pure red. Sign out uses `variant="destructive"` (not outline+red text). Delete confirms use the same variant.
- Header glass: `.site-header-glass` empty pane (blur 40px / saturate 1.6). `.site-header` tokens + transparent bg. Dark fill `rgb(6 16 32 / 0.34)`.
- Hearts: white disk, idle muted, saved navy `foreground`.
- Status dots stay semantic (emerald/amber/sky/red).
- UI Lab is the source of truth for live primitives.
