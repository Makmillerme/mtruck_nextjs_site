import CmsTabs from "@/components/admin/catalog/cms-tabs";
import FieldsPanel from "@/components/admin/catalog/fields-panel";
import FolderTree from "@/components/admin/catalog/folder-tree";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  fetchAttributesForNode,
  fetchTaxonomyNode,
  fetchTaxonomyTree,
  getPathNodes,
} from "@/lib/catalog/taxonomy";
import { getTranslations } from "next-intl/server";

async function CatalogPage(props: {
  searchParams: Promise<{ tab?: string; node?: string }>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations("CatalogAdmin");
  const tab = searchParams.tab === "fields" ? "fields" : "folders";
  const tree = await fetchTaxonomyTree();
  const selected = searchParams.node
    ? await fetchTaxonomyNode(searchParams.node)
    : null;
  const path = selected ? await getPathNodes(selected.id) : [];
  const attributes = selected ? await fetchAttributesForNode(selected.id) : [];

  return (
    <section className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("lede")}</p>
      </div>
      <CmsTabs
        tab={tab}
        nodeId={selected?.id}
        folders={
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t("foldersTitle")}</CardTitle>
              <CardDescription>{t("foldersHint")}</CardDescription>
            </CardHeader>
            <CardContent>
              <FolderTree tree={tree} />
            </CardContent>
          </Card>
        }
        fields={
          <div className="grid gap-6 xl:grid-cols-12">
            <Card className="shadow-sm xl:col-span-4">
              <CardHeader>
                <CardTitle>{t("templateFolderTitle")}</CardTitle>
                <CardDescription>{t("templateFolderLede")}</CardDescription>
              </CardHeader>
              <CardContent>
                <FolderTree tree={tree} selectedId={selected?.id} mode="pick" />
              </CardContent>
            </Card>
            <div className="min-w-0 xl:col-span-8">
              <FieldsPanel
                node={selected}
                pathLabel={path.map((item) => item.name).join(" / ")}
                attributes={attributes}
              />
            </div>
          </div>
        }
      />
    </section>
  );
}

export default CatalogPage;
