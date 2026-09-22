# Product image optimize (2026-09-22)

## Upload pipeline (`utils/images.ts` + `sharp`)
- Every product/avatar upload: EXIF rotate → fit inside 2400px → WebP.
- If output still > 1 MB (`PRODUCT_IMAGE_TARGET_BYTES`): lower quality (82→50), then shrink edge (to ≥1200px).
- Stored as `/uploads/products|<avatars>/<ts>-<name>.webp`.

## Limits (`lib/catalog/product-image-limits.ts`)
- `PRODUCT_IMAGE_MAX` = 15
- `PRODUCT_IMAGE_UPLOAD_MAX_BYTES` = 10 MB (zod in `utils/schemas.ts`)
- `PRODUCT_IMAGE_TARGET_BYTES` = 1 MB
- `PRODUCT_IMAGE_MAX_EDGE` = 2400

## Delivery
- `next/image` on carousel/cards; `next.config.mjs` formats avif+webp, tuned device/imageSizes.
- Server Actions `bodySizeLimit` 32mb for multi-file uploads.

## Dep
- `sharp` in package.json.