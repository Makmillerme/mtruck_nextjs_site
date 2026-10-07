# Combobox shrink without jump (2026-10-07)

User: list may shrink on filter, but must not flip/jump.

Flip lock: freeze `data-side`, then `avoidCollisions={false}`.

Jump when `side=top`: floating-ui keeps the **bottom** on the trigger, so shorter content moves the **top** (search) down.

Fix: after first placement, pin the popper wrapper to `position:fixed; top/left` from the first `getBoundingClientRect()`, `transform:none`. Filter can change height; origin stays. Re-applied in `useLayoutEffect` each commit so Radix cannot overwrite transform.

Removed `min-h-[21.25rem]` / `h-[300px]` so the list actually shrinks (`max-h-[300px]` remains).
