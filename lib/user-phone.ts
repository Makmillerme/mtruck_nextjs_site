import db from "@/utils/db";
import { getSession } from "@/utils/session";

/** Primary phone for the current session user, or null. */
export async function fetchSessionPrimaryPhone(): Promise<string | null> {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) return null;
  const row = await db.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  const phone = row?.phone?.trim() || "";
  return phone || null;
}

/** Digits-only key for compare / unique extras. */
export function normalizePhoneKey(raw: string): string {
  return raw.replace(/\D/g, "");
}

function cleanPhoneDisplay(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * Remember a phone for a logged-in user:
 * - empty primary → set `User.phone`
 * - same as primary → no-op
 * - different → upsert into `UserPhone` (admin "additional phones")
 */
export async function rememberUserPhone(
  userId: string,
  rawPhone: string
): Promise<void> {
  const phone = cleanPhoneDisplay(rawPhone);
  if (!phone) return;
  const phoneNorm = normalizePhoneKey(phone);
  if (phoneNorm.length < 10) return;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  if (!user) return;

  const primaryNorm = user.phone ? normalizePhoneKey(user.phone) : "";
  if (!user.phone) {
    await db.user.update({
      where: { id: userId },
      data: { phone },
    });
    return;
  }
  if (primaryNorm === phoneNorm) return;

  await db.userPhone.upsert({
    where: {
      userId_phoneNorm: { userId, phoneNorm },
    },
    create: { userId, phone, phoneNorm },
    update: { phone },
  });
}

/**
 * Explicit primary phone from account settings / admin.
 * Previous primary (if different) moves to additional phones.
 */
export async function setUserPrimaryPhone(
  userId: string,
  rawPhone: string | null | undefined
): Promise<void> {
  const phone = rawPhone ? cleanPhoneDisplay(rawPhone) : "";
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  if (!user) return;

  const previous = user.phone?.trim() || null;
  const previousNorm = previous ? normalizePhoneKey(previous) : "";
  const nextNorm = phone ? normalizePhoneKey(phone) : "";

  if (!phone) {
    await db.user.update({
      where: { id: userId },
      data: { phone: null },
    });
    return;
  }

  if (previous && previousNorm && previousNorm !== nextNorm) {
    await db.userPhone.upsert({
      where: {
        userId_phoneNorm: { userId, phoneNorm: previousNorm },
      },
      create: {
        userId,
        phone: previous,
        phoneNorm: previousNorm,
      },
      update: { phone: previous },
    });
  }

  await db.user.update({
    where: { id: userId },
    data: { phone },
  });
  if (nextNorm) {
    await db.userPhone.deleteMany({
      where: { userId, phoneNorm: nextNorm },
    });
  }
}
