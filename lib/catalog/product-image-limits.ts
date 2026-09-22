/** Client-safe image limits (no Node fs / sharp). */

/** Max gallery photos per product. */
export const PRODUCT_IMAGE_MAX = 15;

/** Max raw upload size before server-side optimize (10 MB). */
export const PRODUCT_IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

/** Target max size after optimize; files over this are re-compressed. */
export const PRODUCT_IMAGE_TARGET_BYTES = 1024 * 1024;

/** Longest edge for stored product photos. */
export const PRODUCT_IMAGE_MAX_EDGE = 2400;
