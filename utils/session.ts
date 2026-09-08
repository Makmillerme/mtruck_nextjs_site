import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
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

export async function getAuthUser() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }
  return session.user;
}

function getAdminEmails() {
  return [process.env.ADMIN_EMAIL, process.env.ADMIN_TEST_EMAIL].filter(
    Boolean
  ) as string[];
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return getAdminEmails().includes(email);
}

export async function getAdminUser() {
  const user = await getAuthUser();
  if (!isAdminEmail(user.email)) {
    redirect("/");
  }
  return user;
}
