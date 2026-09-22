import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  PRODUCT_IMAGE_MAX,
  PRODUCT_IMAGE_MAX_EDGE,
  PRODUCT_IMAGE_TARGET_BYTES,
} from "@/lib/catalog/product-image-limits";

export {
  PRODUCT_IMAGE_MAX,
  PRODUCT_IMAGE_MAX_EDGE,
  PRODUCT_IMAGE_TARGET_BYTES,
  PRODUCT_IMAGE_UPLOAD_MAX_BYTES,
} from "@/lib/catalog/product-image-limits";

const PRODUCT_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "products"
);
const PRODUCT_PUBLIC_PREFIX = "/uploads/products";
const AVATAR_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "avatars"
);
const AVATAR_PUBLIC_PREFIX = "/uploads/avatars";

function sanitizeBaseName(name: string) {
  const base = path
    .basename(name, path.extname(name))
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.length > 0 ? base : "image";
}

/**
 * Normalize EXIF orientation, fit inside max edge, encode WebP.
 * If output stays over 1 MB, lower quality then shrink edges until under target.
 */
async function optimizeImageBuffer(input: Buffer): Promise<Buffer> {
  let quality = 82;
  let edge = PRODUCT_IMAGE_MAX_EDGE;

  const render = async (maxEdge: number, q: number) =>
    sharp(input)
      .rotate()
      .resize({
        width: maxEdge,
        height: maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: q, effort: 4 })
      .toBuffer();

  let out = await render(edge, quality);

  while (out.length > PRODUCT_IMAGE_TARGET_BYTES && quality > 50) {
    quality -= 8;
    out = await render(edge, quality);
  }

  while (out.length > PRODUCT_IMAGE_TARGET_BYTES && edge > 1200) {
    edge = Math.round(edge * 0.85);
    out = await render(edge, Math.min(quality, 75));
  }

  return out;
}

async function writeUpload(image: File, dir: string, publicPrefix: string) {
  const raw = Buffer.from(await image.arrayBuffer());
  const optimized = await optimizeImageBuffer(raw);
  const fileName = `${Date.now()}-${sanitizeBaseName(image.name)}.webp`;
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), optimized);
  return `${publicPrefix}/${fileName}`;
}

async function removeUpload(url: string, publicPrefix: string, dir: string) {
  try {
    if (!url.startsWith(`${publicPrefix}/`)) {
      return;
    }
    const fileName = path.basename(url);
    await unlink(path.join(dir, fileName));
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}

export const uploadImage = async (image: File) => {
  return writeUpload(image, PRODUCT_UPLOAD_DIR, PRODUCT_PUBLIC_PREFIX);
};

export const uploadProductImages = async (files: File[]) => {
  const urls: string[] = [];
  for (const file of files.slice(0, PRODUCT_IMAGE_MAX)) {
    urls.push(await writeUpload(file, PRODUCT_UPLOAD_DIR, PRODUCT_PUBLIC_PREFIX));
  }
  return urls;
};

export const deleteImage = async (url: string) => {
  await removeUpload(url, PRODUCT_PUBLIC_PREFIX, PRODUCT_UPLOAD_DIR);
};

export const deleteImages = async (urls: string[]) => {
  await Promise.all(urls.map((url) => deleteImage(url)));
};

export const uploadAvatarImage = async (image: File) => {
  return writeUpload(image, AVATAR_UPLOAD_DIR, AVATAR_PUBLIC_PREFIX);
};

export const deleteAvatarImage = async (url: string) => {
  await removeUpload(url, AVATAR_PUBLIC_PREFIX, AVATAR_UPLOAD_DIR);
};
