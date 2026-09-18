import CmsTabs from "@/components/admin/catalog/cms-tabs";
import FieldsPanel from "@/components/admin/catalog/fields-panel";
import FolderTree from "@/components/admin/catalog/folder-tree";
import TemplateFolderPicker from "@/components/admin/catalog/template-folder-picker";
import { Card, CardContent } from "@/components/ui/card";
import {
  fetchAttributesForNode,
  fetchDisplayGroupsForNode,
  fetchTaxonomyNode,
  fetchTaxonomyTree,
} from "@/lib/catalog/taxonomy";
import { getAdminUser } from "@/utils/session";

async function CatalogPage(props: {
  searchParams: Promise<{ tab?: string; node?: string }>;
}) {
  await getAdminUser();
  const searchParams = await props.searchParams;
  const tab = searchParams.tab === "fields" ? "fields" : "folders";
  const tree = await fetchTaxonomyTree();
  const selected = searchParams.node
    ? await fetchTaxonomyNode(searchParams.node)
    : null;
  const attributes = selected ? await fetchAttributesForNode(selected.id) : [];
  const displayGroups = selected
    ? await fetchDisplayGroupsForNode(selected.id)
    : [];

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      <CmsTabs
        tab={tab}
        nodeId={selected?.id}
        folders={
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <FolderTree tree={tree} />
            </CardContent>
          </Card>
        }
        fields={
          <div className="grid gap-6">
            <TemplateFolderPicker
              tree={tree}
              selectedId={selected?.id}
            />
            <FieldsPanel
              node={selected}
              attributes={attributes}
              displayGroups={displayGroups}
            />
          </div>
        }
      />
    </section>
  );
}

export default CatalogPage;
