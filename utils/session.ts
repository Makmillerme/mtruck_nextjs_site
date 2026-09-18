import { cache } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import db from "@/utils/db";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import type { UserRole } from "@prisma/client";
import { isAdminRole, isStaffRole } from "@/utils/user-roles";

export { canMutateUserArchive, isAdminRole, isStaffRole } from "@/utils/user-roles";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  userCode?: string | null;
};

const getSessionUserContext = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) return null;
    const row = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, archivedAt: true },
    });
    if (!row || row.archivedAt) return null;
    return { session, row };
  } catch (error) {
    console.error("getSession failed", error);
    return null;
  }
});

export const getSession = cache(async () => {
  const ctx = await getSessionUserContext();
  return ctx?.session ?? null;
});

async function redirectHome(): Promise<never> {
  const locale = await getLocale();
  redirect({ href: "/", locale });
  throw new Error("Redirect failed");
}

/** DB is source of truth for role (Better-Auth session may omit additionalFields). */
export const getUserRole = cache(async (userId: string) => {
  const row = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return row?.role ?? null;
});

/** Returns null if the account is archived (soft-deleted). */
export const getActiveUserRow = cache(async (userId: string) => {
  return db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, archivedAt: true },
  });
});

export const getAuthUser = cache(async () => {
  const ctx = await getSessionUserContext();
  if (!ctx) {
    return redirectHome();
  }
  return ctx.session.user;
});

export const getStaffUser = cache(async () => {
  const ctx = await getSessionUserContext();
  if (!ctx) {
    return redirectHome();
  }
  const role = ctx.row.role;
  if (!isStaffRole(role)) {
    return redirectHome();
  }
  return { user: ctx.session.user, role: role as UserRole };
});

/** Full admin only (CMS, deletes, role assignment). */
export const getAdminUser = cache(async () => {
  const ctx = await getSessionUserContext();
  if (!ctx || !isAdminRole(ctx.row.role)) {
    return redirectHome();
  }
  return ctx.session.user;
});

/** Staff allowed in; non-admin get an error (for delete mutations). */
export async function requireAdminMutation() {
  const ctx = await getSessionUserContext();
  if (!ctx || !isStaffRole(ctx.row.role)) {
    return redirectHome();
  }
  if (!isAdminRole(ctx.row.role)) {
    const t = await getTranslations("Admin");
    throw new Error(t("forbiddenDelete"));
  }
  return ctx.session.user;
}
