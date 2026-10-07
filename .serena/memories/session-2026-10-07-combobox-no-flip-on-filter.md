# Combobox shrink (2026-10-07)

User asked again to shrink. Jump happened because `side=top` anchors the **bottom** of the panel; search was at the **top**, so shorter list pulled search down.

Fix (no position:fixed):
- Keep freeze side + `avoidCollisions={false}`.
- Remove min-height / `h-[300px]` so CommandList uses `max-h-[300px]` only.
- When `data-side=top`, `[&_[cmdk-root]]:flex-col-reverse` so search sits next to the trigger; list shrinks away from the field. Search row: `data-combobox-search`, border-t when reversed.
