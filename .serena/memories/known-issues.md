# Known issues

## Radix overlay layout shift (2026-09-07)

Opening DropdownMenu / Select / Sheet used to shift the whole page left, then restore on close.

### Cause
- `html { scrollbar-gutter: stable }` already reserves the scrollbar (~15px).
- Radix modal uses `react-remove-scroll`, which injects `body[data-scroll-locked] { margin-right: 15px !important }`.
- Double compensation: header/content shrink from the right (looks like a left slide).

### Fix
- Unlayered CSS in `app/globals.css`: `html body[data-scroll-locked] { margin-right: 0 !important; padding-right: 0 !important }`.
- `DropdownMenu` defaults to `modal={false}`.

## False hydration mismatch: `data-cursor-ref` (2026-09-08)

Console may show hydration error on `FeaturedProducts` / homepage with diffs like:

```
- data-cursor-ref="e133"
+ Каталог
```

### Cause
Cursor IDE browser injects `data-cursor-ref` into the live DOM for accessibility snapshots. That is **not** in server HTML, so React reports a mismatch.

### Action
Ignore when the only mismatched attrs are `data-cursor-ref`. Verify in a normal Chrome/Edge window (not Cursor browser). No app code fix.
