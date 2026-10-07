# Homepage finder nested folders (2026-10-07)

## Bug
`showInHomeFilter` hoist kept full tree, but `mapRoot` only mapped **one** child level. Deeper folders (Тягачі, Фургони…) never became cards — unlike catalog filter.

## Fix
- `HomeFinderChild.children` recursive
- `mapFolderNode` maps full depth after hoist
- `CategoryFinderPanel`: third card row for grandchildren; facets/CTA from deepest selection
- defaults include `grandchildId`

Tree example: Техніка → Вантажні/Причепи/Спецтехніка → leaf cards.
