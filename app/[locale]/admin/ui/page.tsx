import UiEditorStubPanel from "@/components/admin/ui-editor/ui-editor-stub-panel";
import UiEditorTabs from "@/components/admin/ui-editor/ui-editor-tabs";
import CardPreviewEditor from "@/components/admin/ui-editor/card-preview-editor";
import { parseUiEditorTab } from "@/lib/admin/ui-editor-tab";
import {
  loadCardPreviewEditorData,
  resolveDefaultCardPreviewNodeId,
} from "@/lib/admin/card-preview-editor-data";
import { fetchTaxonomyTree } from "@/lib/catalog/taxonomy";
import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getAdminUser } from "@/utils/session";

async function AdminUiEditorPage(props: {
  searchParams: Promise<{ tab?: string; node?: string }>;
}) {
  await getAdminUser();
  const searchParams = await props.searchParams;
  const t = await getTranslations("UiEditor");
  const tab = parseUiEditorTab(searchParams.tab);

  if (tab === "cardPreview" && !searchParams.node) {
    const tree = await fetchTaxonomyTree();
    const defaultNodeId = await resolveDefaultCardPreviewNodeId(tree);
    if (defaultNodeId) {
      const locale = await getLocale();
      redirect({
        href: `/admin/ui?tab=cardPreview&node=${defaultNodeId}`,
        locale,
      });
    }
  }

  const cardPreviewData =
    tab === "cardPreview"
      ? await loadCardPreviewEditorData(searchParams.node)
      : null;

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      <UiEditorTabs
        tab={tab}
        cardPreview={
          cardPreviewData ? (
            <CardPreviewEditor {...cardPreviewData} />
          ) : (
            <UiEditorStubPanel
              title={t("tabCardPreview")}
              description={t("stubCardPreview")}
            />
          )
        }
        productCard={
          <UiEditorStubPanel
            title={t("tabProductCard")}
            description={t("stubProductCard")}
          />
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
