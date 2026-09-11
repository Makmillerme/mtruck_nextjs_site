import AttributePanel from "@/components/admin/catalog/attribute-panel";
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
  searchParams: Promise<{ node?: string }>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations("CatalogAdmin");
  const tree = await fetchTaxonomyTree();
  const selectedId = searchParams.node;
  const selected = selectedId ? await fetchTaxonomyNode(selectedId) : null;
  const path = selected ? await getPathNodes(selected.id) : [];
  const attributes = selected ? await fetchAttributesForNode(selected.id) : [];

  return (
    <section className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("lede")}</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>{t("foldersTitle")}</CardTitle>
            <CardDescription>{t("foldersLede")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FolderTree tree={tree} selectedId={selected?.id} />
          </CardContent>
        </Card>
        <div className="xl:col-span-8">
          {selected ? (
            <AttributePanel node={selected} path={path} attributes={attributes} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t("pickFolderTitle")}</CardTitle>
                <CardDescription>{t("pickFolderLede")}</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}

export default CatalogPage;
