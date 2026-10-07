# Combobox no longer jumps when the list shrinks (2026-10-07)

Filtering cut CommandList height; Radix Popper re-ran collision and flipped `side` top↔bottom.

- `PopoverContent`: `sticky="always"` so placement stays on the chosen side.
- Searchable lists (`SearchableEntityPicker`, catalog filter combobox): `CommandList` `h-[300px]` while search is shown, so filter does not change popover size. Empty space below few matches is expected.
