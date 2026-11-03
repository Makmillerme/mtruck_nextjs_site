# PDP UI Editor: TEXT tab = text area only (2026-11-02)

## Change
- Label `productPageTabKind_TEXT`: uk «Текстова область» / en «Text area» / de «Textbereich» (same wording as CatalogAdmin `textInput.AREA`).
- Eligible sources for TEXT tab look: system DESCRIPTION **or** attributes with `type === TEXT` && `textInput === AREA`.
- Helper: `isTextAreaTabEligibleAttribute` in `lib/catalog/product-page-layout.ts`.
- Enforced in editor picker (`attributesForTabKind` + sanitize on load), save action, and PDP runtime (`buildProductDetailsTabs`).
- Non-AREA attribute on a TEXT tab falls back to DESCRIPTION in editor sanitize / save.
