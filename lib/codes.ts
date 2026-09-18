import db from "@/utils/db";

const CODE_MIN = 10000;
const CODE_MAX = 99999;
const MAX_ATTEMPTS = 40;

function randomFiveDigitCode() {
  const value =
    CODE_MIN + Math.floor(Math.random() * (CODE_MAX - CODE_MIN + 1));
  return String(value);
}

async function generateUniqueCode(
  exists: (code: string) => Promise<boolean>
): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const code = randomFiveDigitCode();
    if (!(await exists(code))) return code;
  }
  throw new Error("Failed to allocate a unique 5-digit code");
}

export async function generateUniqueUserCode() {
  return generateUniqueCode(async (code) => {
    const row = await db.user.findUnique({
      where: { userCode: code },
      select: { id: true },
    });
    return Boolean(row);
  });
}

export async function generateUniqueProductCode() {
  return generateUniqueCode(async (code) => {
    const row = await db.product.findUnique({
      where: { productCode: code },
      select: { id: true },
    });
    return Boolean(row);
  });
}

export async function ensureUserCode(userId: string) {
  const existing = await db.user.findUnique({
    where: { id: userId },
    select: { userCode: true },
  });
  if (existing?.userCode) return existing.userCode;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const userCode = await generateUniqueUserCode();
    try {
      const updated = await db.user.update({
        where: { id: userId },
        data: { userCode },
        select: { userCode: true },
      });
      return updated.userCode!;
    } catch {
      // unique race — retry
    }
  }
  throw new Error("Failed to assign userCode");
}

export async function ensureProductCode(productId: string) {
  const existing = await db.product.findUnique({
    where: { id: productId },
    select: { productCode: true },
  });
  if (existing?.productCode) return existing.productCode;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const productCode = await generateUniqueProductCode();
    try {
      const updated = await db.product.update({
        where: { id: productId },
        data: { productCode },
        select: { productCode: true },
      });
      return updated.productCode!;
    } catch {
      // unique race — retry
    }
  }
  throw new Error("Failed to assign productCode");
}

/** Backfill missing codes for existing rows. */
export async function backfillEntityCodes() {
  const usersMissing = (
    await db.user.findMany({ select: { id: true, userCode: true } })
  ).filter((row) => !/^\d{5}$/.test(row.userCode ?? ""));
  for (const user of usersMissing) {
    await db.user.update({
      where: { id: user.id },
      data: { userCode: await generateUniqueUserCode() },
    });
  }
  const productsMissing = (
    await db.product.findMany({ select: { id: true, productCode: true } })
  ).filter((row) => !/^\d{5}$/.test(row.productCode ?? ""));
  for (const product of productsMissing) {
    await db.product.update({
      where: { id: product.id },
      data: { productCode: await generateUniqueProductCode() },
    });
  }
  return { users: usersMissing.length, products: productsMissing.length };
}
