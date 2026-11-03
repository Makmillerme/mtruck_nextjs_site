import UiEditorStubPanel from "@/components/admin/ui-editor/ui-editor-stub-panel";
import UiEditorTabs from "@/components/admin/ui-editor/ui-editor-tabs";
import CardPreviewEditor from "@/components/admin/ui-editor/card-preview-editor";
import ProductPageEditor from "@/components/admin/ui-editor/product-page-editor";
import UiEditorUrlSync from "@/components/admin/ui-editor/ui-editor-url-sync";
import { parseUiEditorTab } from "@/lib/admin/ui-editor-tab";
import {
  loadCardPreviewEditorData,
  resolveDefaultCardPreviewNodeId,
  resolveLeafEditorNodeId,
} from "@/lib/admin/card-preview-editor-data";
import {
  loadProductPageEditorData,
  resolveDefaultProductPageNodeId,
} from "@/lib/admin/product-page-editor-data";
import { fetchTaxonomyTree } from "@/lib/catalog/taxonomy";
import { getTranslations } from "next-intl/server";
import { getAdminUser } from "@/utils/session";

export const dynamic = "force-dynamic";

async function AdminUiEditorPage(props: {
  searchParams: Promise<{ tab?: string; node?: string }>;
}) {
  await getAdminUser();
  const searchParams = await props.searchParams;
  const t = await getTranslations("UiEditor");
  const tab = parseUiEditorTab(searchParams.tab);
  const nodeFromUrl = searchParams.node?.trim() || null;

  // Card / product page editors only use leaf folders.
  let resolvedNodeId = nodeFromUrl;
  let needsUrlSync = false;
  if (tab === "cardPreview" || tab === "productCard") {
    const tree = await fetchTaxonomyTree();
    const leafId = resolveLeafEditorNodeId(tree, resolvedNodeId);
    if (resolvedNodeId && !leafId) {
      resolvedNodeId =
        tab === "cardPreview"
          ? await resolveDefaultCardPreviewNodeId(tree)
          : await resolveDefaultProductPageNodeId(tree);
      needsUrlSync = Boolean(resolvedNodeId);
    } else if (!resolvedNodeId) {
      resolvedNodeId =
        tab === "cardPreview"
          ? await resolveDefaultCardPreviewNodeId(tree)
          : await resolveDefaultProductPageNodeId(tree);
      needsUrlSync = Boolean(resolvedNodeId);
    } else {
      resolvedNodeId = leafId;
    }
  }

  const cardPreviewData =
    tab === "cardPreview"
      ? await loadCardPreviewEditorData(resolvedNodeId)
      : null;
  const productPageData =
    tab === "productCard"
      ? await loadProductPageEditorData(resolvedNodeId)
      : null;

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      {needsUrlSync && resolvedNodeId ? (
        <UiEditorUrlSync tab={tab} nodeId={resolvedNodeId} />
      ) : null}
      <UiEditorTabs
        tab={tab}
        cardPreview={
          cardPreviewData ? (
            <CardPreviewEditor
              key={cardPreviewData.selectedNodeId ?? "card-preview"}
              {...cardPreviewData}
            />
          ) : (
            <UiEditorStubPanel
              title={t("tabCardPreview")}
              description={t("stubCardPreview")}
            />
          )
        }
        productCard={
          productPageData ? (
            <ProductPageEditor
              key={productPageData.selectedNodeId ?? "product-page"}
              {...productPageData}
            />
          ) : (
            <UiEditorStubPanel
              title={t("tabProductCard")}
              description={t("stubProductCard")}
            />
          )
        }
        layout={
          <UiEditorStubPanel
            title={t("tabLayout")}
            description={t("stubLayout")}
          />
        }
      />
    </section>
  );
}

export default AdminUiEditorPage;
