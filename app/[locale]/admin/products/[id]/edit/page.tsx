import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

/** Edit flow lives in a sheet on /admin/products. */
async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const locale = await getLocale();
  redirect({ href: `/admin/products?edit=${id}`, locale });
}

export default EditProductPage;
