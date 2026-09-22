import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export default async function AccountFavoritesRedirect() {
  const locale = await getLocale();
  redirect({ href: "/account?tab=favorites", locale });
}
