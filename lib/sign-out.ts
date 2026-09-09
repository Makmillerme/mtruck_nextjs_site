"use client";

import { authClient } from "@/lib/auth-client";

type SignOutRouter = {
  push: (href: "/") => void;
  refresh: () => void;
};

export async function signOutAndRefresh(router: SignOutRouter) {
  await authClient.signOut();
  router.push("/");
  router.refresh();
}
