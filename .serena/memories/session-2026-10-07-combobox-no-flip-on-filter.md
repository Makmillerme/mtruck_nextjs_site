# Combobox jump on filter (2026-10-07)

First attempt (`sticky="always"` + CommandList `h-[300px]`) failed:
- Radix `sticky` only changes **shift** limiter, not **flip**. Flip still re-runs when size/space changes.
- Command `h-full` on a parent with auto height can collapse the 300px list so the popover still shrinks. When `side=top`, shrinking moves the **top** edge down — looks like a jump top→bottom.

## Actual fix
- `PopoverContent` freezes `data-side` after first layout, then `avoidCollisions={false}` so flip cannot run again this open.
- Search pickers: `min-h-[21.25rem]` on **Content** (the node floating-ui measures) + Command `h-auto`.
