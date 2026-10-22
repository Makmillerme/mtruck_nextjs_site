import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

async function BreadCrumbs({
  name,
  categoryLabel,
  categorySlug,
}: {
  name: string;
  categoryLabel?: string | null;
  /** Taxonomy slug for `?folder=` catalog deep-link. */
  categorySlug?: string | null;
}) {
  const t = await getTranslations("Product");
  const categoryHref = categorySlug
    ? `/products?folder=${encodeURIComponent(categorySlug)}`
    : "/products";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{t("home")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/products">{t("catalog")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {categoryLabel ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={categoryHref}>{categoryLabel}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ) : null}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
export default BreadCrumbs;
