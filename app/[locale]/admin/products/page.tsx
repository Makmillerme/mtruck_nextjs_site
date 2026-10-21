import AdminProductsView from "@/components/admin/products/admin-products-view";
import { fetchAdminFilterAvailabilityIndex } from "@/lib/catalog/filter-availability";
import { fetchPublicFilterSchema } from "@/lib/catalog/public-filter";
import { fetchRootCatalogAttributes } from "@/lib/catalog/root-attributes-cache";
import {
  collectSubtreeNodeIds,
  fetchAttributesForNode,
  fetchDisplayGroupsForNode,
  fetchTaxonomyTree,
  flattenTaxonomyTree,
  resolveAttributesByKey,
  resolveDisplayGroupsByKey,
} from "@/lib/catalog/taxonomy";
import { fetchAdminProducts } from "@/utils/actions";
import { getLocale } from "next-intl/server";
import { getStaffUser, isAdminRole } from "@/utils/session";

async function AdminProductsPage(props: {
  searchParams: Promise<{
    create?: string;
    edit?: string;
    node?: string;
    root?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const locale = await getLocale();
  const { role } = await getStaffUser();
  const [items, tree, tableAttributes, filterSchema, filterAvailability] =
    await Promise.all([
      fetchAdminProducts(),
      fetchTaxonomyTree(),
      fetchRootCatalogAttributes(),
      fetchPublicFilterSchema(),
      fetchAdminFilterAvailabilityIndex(),
    ]);
  const flatFolders = flattenTaxonomyTree(tree);
  const rootParam = searchParams.root?.trim() || undefined;
  const listRootId =
    rootParam && tree.some((node) => node.id === rootParam)
      ? rootParam
      : undefined;
  const subtreeIds = listRootId
    ? collectSubtreeNodeIds(tree, listRootId)
    : null;
  const scopedItems = subtreeIds
    ? items.filter(
        (item) =>
          item.taxonomyNodeId != null && subtreeIds.has(item.taxonomyNodeId)
      )
    : items;
  const createOpen = searchParams.create === "1";
  const editId = searchParams.edit?.trim() || undefined;
  const editProduct = editId
    ? scopedItems.find((item) => item.id === editId) ??
      items.find((item) => item.id === editId)
    : undefined;
  const selectedId =
    searchParams.node ||
    (editProduct?.taxonomyNodeId ?? undefined) ||
    (createOpen ? listRootId : undefined);
  const selectedExists = selectedId
    ? flatFolders.some((folder) => folder.id === selectedId)
    : false;
  const sheetOpen = createOpen || Boolean(editProduct);
  const attributes =
    sheetOpen && selectedExists && selectedId
      ? resolveAttributesByKey(await fetchAttributesForNode(selectedId))
      : [];
  const displayGroups =
    sheetOpen && selectedExists && selectedId
      ? resolveDisplayGroupsByKey(await fetchDisplayGroupsForNode(selectedId))
      : [];
  const writers = displayGroups.filter((group) => group.writesProductName);
  const nameWriterGroup =
    writers.find((group) => !group.inherited) ?? writers[0] ?? null;

  return (
    <AdminProductsView
      locale={locale}
      createOpen={createOpen}
      editId={editProduct?.id}
      selectedNodeId={selectedExists ? selectedId : undefined}
      listRootId={listRootId}
      tree={tree}
      attributes={attributes}
      tableAttributes={tableAttributes}
      nameWriterGroup={nameWriterGroup}
      canDelete={isAdminRole(role)}
      filterSchema={filterSchema}
      filterAvailability={filterAvailability}
      items={scopedItems}
    />
  );
}

export default AdminProductsPage;
