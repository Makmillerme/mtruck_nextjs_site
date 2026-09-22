import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export default async function AccountSettingsRedirect() {
  const locale = await getLocale();
  redirect({ href: "/account?tab=settings", locale });
}
