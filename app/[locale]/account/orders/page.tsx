import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export default async function AccountOrdersRedirect(props: {
  searchParams: Promise<{ create?: string }>;
}) {
  const locale = await getLocale();
  const searchParams = await props.searchParams;
  const qs = new URLSearchParams({ tab: "orders" });
  if (searchParams.create === "1") qs.set("create", "1");
  redirect({ href: `/account?${qs.toString()}`, locale });
}
