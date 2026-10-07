# Homepage finder 3-level nested folder plates (2026-10-07)

All three folder levels render in one nested stack with progressive `border-l` indent (`folderNestClass`):

1. **Root** — `tone="fill"` `size="sm"` (compact)
2. **Type** — nested under root, `tone="fill"` `size="md"`
3. **Subtype** — nested under type, `tone="outline"` `size="lg"`

`FinderFolderCard` has explicit `size: sm|md|lg` independent of tone.

For root+type+subtype to appear together, the CMS root folder must have `showInHomeFilter` on (otherwise hoist lifts types to root row).
