import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { headers } from "next/headers";
import { getLocale } from "next-intl/server";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};

export async function getSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error("getSession failed", error);
    return null;
  }
}

async function redirectHome(): Promise<never> {
  const locale = await getLocale();
  redirect({ href: "/", locale });
  throw new Error("Redirect failed");
}

export async function getAuthUser() {
  const session = await getSession();
  if (!session?.user) {
    return redirectHome();
  }
  return session.user;
}

export function isAdminRole(role: string | null | undefined) {
  return role === "ADMIN";
}

export async function getAdminUser() {
  const user = await getAuthUser();
  const role =
    "role" in user && typeof user.role === "string" ? user.role : null;
  if (!isAdminRole(role)) {
    return redirectHome();
  }
  return user;
}
