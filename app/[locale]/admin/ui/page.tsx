import FilterSettingsPanel from "@/components/admin/ui-editor/filter-settings-panel";
import UiEditorStubPanel from "@/components/admin/ui-editor/ui-editor-stub-panel";
import UiEditorTabs from "@/components/admin/ui-editor/ui-editor-tabs";
import { parseUiEditorTab } from "@/lib/admin/ui-editor-tab";
import {
  fetchAttributesForNode,
  fetchTaxonomyTree,
  findNodeInTree,
} from "@/lib/catalog/taxonomy";
import { getTranslations } from "next-intl/server";
import { getAdminUser } from "@/utils/session";

async function AdminUiEditorPage(props: {
  searchParams: Promise<{ tab?: string; node?: string }>;
}) {
  await getAdminUser();
  const searchParams = await props.searchParams;
  const t = await getTranslations("UiEditor");
  const tab = parseUiEditorTab(searchParams.tab);
  const tree = await fetchTaxonomyTree();
  const nodeId = searchParams.node?.trim() || undefined;
  const selected = nodeId ? findNodeInTree(tree, nodeId) : null;
  const resolvedNodeId = selected?.id;
  const attributes = resolvedNodeId
    ? (await fetchAttributesForNode(resolvedNodeId)).filter(
        (attribute) => !attribute.inherited
      )
    : [];

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      <UiEditorTabs
        tab={tab}
        nodeId={resolvedNodeId}
        filter={
          <FilterSettingsPanel
            tree={tree}
            selectedNodeId={resolvedNodeId}
            attributes={attributes.map((attribute) => ({
              id: attribute.id,
              name: attribute.name,
              key: attribute.key,
              type: attribute.type,
              isFacet: attribute.isFacet,
            }))}
            tab={tab}
          />
        }
        cardPreview={
          <UiEditorStubPanel
            title={t("tabCardPreview")}
            description={t("stubCardPreview")}
          />
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
