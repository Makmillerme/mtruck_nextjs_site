import CmsTabs from "@/components/admin/catalog/cms-tabs";
import FieldsPanel from "@/components/admin/catalog/fields-panel";
import FolderTree from "@/components/admin/catalog/folder-tree";
import TemplateFolderPicker from "@/components/admin/catalog/template-folder-picker";
import { Card, CardContent } from "@/components/ui/card";
import {
  fetchAttributesForNode,
  fetchTaxonomyNode,
  fetchTaxonomyTree,
} from "@/lib/catalog/taxonomy";

async function CatalogPage(props: {
  searchParams: Promise<{ tab?: string; node?: string }>;
}) {
  const searchParams = await props.searchParams;
  const tab = searchParams.tab === "fields" ? "fields" : "folders";
  const tree = await fetchTaxonomyTree();
  const selected = searchParams.node
    ? await fetchTaxonomyNode(searchParams.node)
    : null;
  const attributes = selected ? await fetchAttributesForNode(selected.id) : [];

  return (
    <section className="grid gap-6">
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
            <FieldsPanel node={selected} attributes={attributes} />
          </div>
        }
      />
    </section>
  );
}

export default CatalogPage;
