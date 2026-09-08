import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const PUBLIC_PREFIX = "/uploads/products";

function sanitizeFileName(name: string) {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.length > 0 ? base : "image";
}

export const uploadImage = async (image: File) => {
  const bytes = Buffer.from(await image.arrayBuffer());
  const fileName = `${Date.now()}-${sanitizeFileName(image.name)}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, fileName), bytes);
  return `${PUBLIC_PREFIX}/${fileName}`;
};

export const deleteImage = async (url: string) => {
  try {
    if (!url.startsWith(`${PUBLIC_PREFIX}/`)) {
      return;
    }
    const fileName = path.basename(url);
    await unlink(path.join(UPLOAD_DIR, fileName));
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};
