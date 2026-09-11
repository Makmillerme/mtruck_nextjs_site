import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

/** Create flow lives in a sheet on /admin/products. */
async function CreateProductPage(props: {
  searchParams: Promise<{ node?: string }>;
}) {
  const searchParams = await props.searchParams;
  const locale = await getLocale();
  const href = searchParams.node
    ? `/admin/products?create=1&node=${searchParams.node}`
    : "/admin/products?create=1";
  redirect({ href, locale });
}

export default CreateProductPage;
