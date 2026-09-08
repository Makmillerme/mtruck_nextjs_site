import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export default async function OrdersRedirectPage() {
  const locale = await getLocale();
  redirect({ href: "/account/orders", locale });
}
