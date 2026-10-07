# Homepage finder: L2 fill plates (2026-10-07)

User rejected pill chips for L2 types. Keep **plates** (`rounded-sm` cards with count), distinguish from L3 by fill interaction:

- L2 types: `FinderFolderCard` `tone="fill"` — hover/active `bg-primary text-primary-foreground`
- L3 subtypes: `tone="outline"` (default) — border only, no fill
- Catalog roots stay chips (`chipClass`)

Previous commit `9c2104c` had turned L2 into chips; reverted that shape, kept the fill idea on plates.