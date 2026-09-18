import AdminProductsView from "@/components/admin/products/admin-products-view";
import {
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
  searchParams: Promise<{ create?: string; edit?: string; node?: string }>;
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
  const createOpen = searchParams.create === "1";
  const editId = searchParams.edit?.trim() || undefined;
  const editProduct = editId
    ? items.find((item) => item.id === editId)
    : undefined;
  const selectedId =
    searchParams.node ||
    (editProduct?.taxonomyNodeId ?? undefined);
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
  const nameFromDisplayGroup = displayGroups.some(
    (group) => group.writesProductName
  );

  return (
    <AdminProductsView
      locale={locale}
      createOpen={createOpen}
      editId={editProduct?.id}
      selectedNodeId={selectedExists ? selectedId : undefined}
      tree={tree}
      attributes={attributes}
      tableAttributes={tableAttributes}
      nameFromDisplayGroup={nameFromDisplayGroup}
      canDelete={isAdminRole(role)}
      items={items.map((item) => ({
        id: item.id,
        name: item.name,
        company: item.company,
        price: item.price,
        featured: item.featured,
        status: item.status,
        availability: item.availability,
        description: item.description,
        image: item.image,
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
