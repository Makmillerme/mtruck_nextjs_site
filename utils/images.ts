import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const PRODUCT_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const PRODUCT_PUBLIC_PREFIX = "/uploads/products";
const AVATAR_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
const AVATAR_PUBLIC_PREFIX = "/uploads/avatars";

function sanitizeFileName(name: string) {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.length > 0 ? base : "image";
}

async function writeUpload(image: File, dir: string, publicPrefix: string) {
  const bytes = Buffer.from(await image.arrayBuffer());
  const fileName = `${Date.now()}-${sanitizeFileName(image.name)}`;
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), bytes);
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

export const PRODUCT_IMAGE_MAX = 15;

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
