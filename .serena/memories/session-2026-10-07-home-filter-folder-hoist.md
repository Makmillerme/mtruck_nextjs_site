# Homepage filter folder hoist (2026-10-07)

`lib/home/home-finder.ts` `mapHomeFilterNodes` mirrors catalog `mapFilterNodes` but uses `showInHomeFilter`:
- inactive skipped
- `!showInHomeFilter` → children hoist to this level
- visible node kept with mapped children

UI (`CategoryFinderPanel`): if a root is a leaf (`children === [self]`), hide the second card row so folders are not duplicated.
