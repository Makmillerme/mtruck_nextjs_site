import CategoryFinderPanel from "@/components/catalog/CategoryFinderPanel";
import CatalogFeaturedGrid from "@/components/catalog/CatalogFeaturedGrid";
import LoadingContainer from "@/components/global/LoadingContainer";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function CatalogBlock() {
  const t = await getTranslations("CategoryFinder");

  return (
    <section
      id="catalog"
      aria-label={t("aria")}
      className="full-bleed scroll-mt-16 bg-secondary"
    >
      <div className="page-container py-16 md:py-24">
        <CategoryFinderPanel />
        <div id="inventory" className="mt-12 scroll-mt-16 md:mt-16">
          <Suspense fallback={<LoadingContainer />}>
            <CatalogFeaturedGrid />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
