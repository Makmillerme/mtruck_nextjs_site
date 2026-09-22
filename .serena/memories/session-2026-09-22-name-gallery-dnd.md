# Product name spaces + admin gallery DnD (2026-09-22)

## Name
- `joinProductName` / `splitProductNameAroundComposed` in `lib/catalog/display-group.ts`: trim + join non-empty parts with a single space (UI CSS gap no longer the only spacing).
- `ProductNameInput`: transparent space spacers between free text and tags so display matches saved string.

## Gallery
- New `components/admin/products/product-image-gallery-field.tsx`: PhotoCarousel (card) + framer-motion `Reorder` thumbs + trailing `+` (hidden file input).
- Hidden `imageOrder` JSON: `{t:'e',id}` | `{t:'n'}` | `{t:'c'}` (cover-only without ProductImage row).
- New files synced into `input[name=images]` via DataTransfer in current new-file order.
- Sheet: replaced static cover + `ImageGalleryInput`.
- `fetchAdminProducts` includes `images`; `AdminProductRow.images`; page maps them.
- `updateProductAction`: applies sortOrder from imageOrder, creates new slots, cover = first in order.
- PhotoCarousel: optional `startIndex` for thumb click sync.
- UI Lab blocks: Admin gallery (DnD) sample under PhotoCarousel.
- i18n: `Admin.imagesAdd` + hint about drag reorder (uk/en/de).

## Out of scope
- Deleting photos from the gallery (add + reorder only).

## Follow-up (grid DnD)
- Framer `Reorder` + `axis="x"` fails on multi-row CSS grid. Replaced with native HTML5 drag-and-drop on thumbs (reorder on dragOver across rows); `+` stays last non-draggable cell.

## Follow-up (gallery layout)
- Logs OK: updateProductAction 200; serverActions bodySizeLimit active; LCP lazy warning only (gallery now `priority` on carousel).
- Thumbs: one `Reorder.Group` grid `grid-cols-4 sm:grid-cols-5` full sheet width; `+` is last non-draggable `li` (always end of list).
- Carousel: `w-full`, no `max-w-xs`.

## Follow-up (body limit)
- Server Action default 1MB body blocked multi-image save. `next.config.mjs` → `experimental.serverActions.bodySizeLimit: "20mb"` (15×1MB zod per-file + multipart overhead). Restart `next dev` after change.

## Follow-up (Turbopack + tags)
- Turbopack: client gallery imported `PRODUCT_IMAGE_MAX` from `utils/images` → `node:fs/promises` in browser chunk. Constant: `lib/catalog/product-image-limits.ts`.
- Name chips: always UI Lab `Badge variant="tag"` via `ProductNameTagChips` (no soft/tag flip).