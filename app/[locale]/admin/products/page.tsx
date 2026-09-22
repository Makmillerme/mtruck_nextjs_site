import AdminProductsView from "@/components/admin/products/admin-products-view";
import {
  collectSubtreeNodeIds,
  fetchAttributesForNode,
  fetchDisplayGroupsForNode,
  fetchRootCatalogAttributes,
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
  const [items, tree, tableAttributes] = await Promise.all([
    fetchAdminProducts(),
    fetchTaxonomyTree(),
    fetchRootCatalogAttributes(),
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
      items={scopedItems.map((item) => ({
        id: item.id,
        name: item.name,
        company: item.company,
        price: item.price,
        currency: item.currency,
        featured: item.featured,
        status: item.status,
        availability: item.availability,
        description: item.description,
        image: item.image,
        images: item.images.map((image) => ({
          id: image.id,
          url: image.url,
        })),
        taxonomyNodeId: item.taxonomyNodeId,
        specs: item.specs.map((spec) => ({
          attributeId: spec.attributeId,
          optionId: spec.optionId,
          numberValue: spec.numberValue,
          textValue: spec.textValue,
          booleanValue: spec.booleanValue,
          optionLabel: spec.option?.label ?? null,
          attributeKey: spec.attribute?.key ?? null,
          unit: spec.attribute?.unit ?? null,
          type: spec.attribute?.type ?? null,
        })),
      }))}
    />
  );
}

export default AdminProductsPage;
