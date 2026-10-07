# Homepage finder nested folders (2026-10-07)

`HomeFinderChild.children` recursive; panel has grandchild card row.

## Root row (follow-up)
Single home-visible root (e.g. Техніка) was hidden: `showRootsBlock: roots.length > 1`.
Now `roots.length > 0` so the root card shows when `showInHomeFilter` is on. Hide the root in the folder sheet flag to hoist children instead.
