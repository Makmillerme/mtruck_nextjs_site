import AdminProductsView from "@/components/admin/products/admin-products-view";
import {
  fetchAttributesForNode,
  fetchTaxonomyTree,
  flattenTaxonomyTree,
  resolveAttributesByKey,
} from "@/lib/catalog/taxonomy";
import { fetchAdminProducts } from "@/utils/actions";
import { getLocale } from "next-intl/server";

async function AdminProductsPage(props: {
  searchParams: Promise<{ create?: string; node?: string }>;
}) {
  const searchParams = await props.searchParams;
  const locale = await getLocale();
  const items = await fetchAdminProducts();
  const tree = await fetchTaxonomyTree();
  const folders = flattenTaxonomyTree(tree).map((node) => ({
    id: node.id,
    name: node.name,
    depth: node.depth,
  }));
  const createOpen = searchParams.create === "1";
  const selectedId = searchParams.node;
  const selectedExists = selectedId
    ? folders.some((folder) => folder.id === selectedId)
    : false;
  const attributes =
    createOpen && selectedExists && selectedId
      ? resolveAttributesByKey(await fetchAttributesForNode(selectedId))
      : [];

  return (
    <AdminProductsView
      locale={locale}
      createOpen={createOpen}
      selectedNodeId={selectedExists ? selectedId : undefined}
      folders={folders}
      attributes={attributes}
      defaults={{
        name: "",
        company: "",
        description: "",
      }}
      items={items.map((item) => ({
        id: item.id,
        name: item.name,
        company: item.company,
        price: item.price,
        featured: item.featured,
        status: item.status,
      }))}
    />
  );
}

export default AdminProductsPage;
