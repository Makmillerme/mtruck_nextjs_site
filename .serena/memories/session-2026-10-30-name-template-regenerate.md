# Name template disconnect / regenerate — 2026-10-30

- Clear all member fields + save → deletes template; Product.name in DB unchanged.
- Save with members → AlertDialog warning → save template + `regenerateProductNamesInFolderSubtree` (folder + descendants).
- Toast: `productNameTemplateSavedRegenerated` with count.
- UI hint: `productNameTemplateDisconnectHint`.
