import AdminProductsView from "@/components/admin/products/admin-products-view";
import { fetchRootCatalogAttributes } from "@/lib/catalog/root-attributes-cache";
import {
  isActiveFormationTemplate,
  resolveFormationTemplates,
} from "@/lib/catalog/display-group";
import {
  collectSubtreeNodeIds,
  fetchAttributesForNode,
  fetchDisplayGroupsForNode,
  fetchTaxonomyTree,
  flattenTaxonomyTree,
  resolveAttributesByKey,
} from "@/lib/catalog/taxonomy";
import {
  ADMIN_DEFAULT_PAGE_SIZE,
  parseAdminPage,
  parseAdminPageSize,
} from "@/lib/admin/list-pagination";
import { ADMIN_LIST_SEARCH_KEY } from "@/lib/admin/list-url";
import { fetchAdminProducts } from "@/utils/actions";
import { parseCatalogQuery } from "@/utils/catalog-query";
import { getLocale } from "next-intl/server";
import { getStaffUser, isAdminRole } from "@/utils/session";

async function AdminProductsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const locale = await getLocale();
  const { role } = await getStaffUser();

  const rawQuery: Record<string, string | string[] | undefined> = {
    ...searchParams,
  };
  const parsed = parseCatalogQuery(rawQuery);
  const q =
    typeof searchParams.q === "string"
      ? searchParams.q
      : typeof searchParams[ADMIN_LIST_SEARCH_KEY] === "string"
        ? searchParams[ADMIN_LIST_SEARCH_KEY]
        : "";
  const page = parseAdminPage(
    typeof searchParams.page === "string" ? searchParams.page : undefined
  );
  const pageSize = parseAdminPageSize(
    typeof searchParams.pageSize === "string"
      ? searchParams.pageSize
      : undefined
  );

  const [tree, tableAttributes] = await Promise.all([
    fetchTaxonomyTree(),
    fetchRootCatalogAttributes(),
  ]);
  const flatFolders = flattenTaxonomyTree(tree);
  const rootParam =
    typeof searchParams.root === "string"
      ? searchParams.root.trim() || undefined
      : undefined;
  const listRootId =
    rootParam && tree.some((node) => node.id === rootParam)
      ? rootParam
      : undefined;
  const subtreeIds = listRootId
    ? [...collectSubtreeNodeIds(tree, listRootId)]
    : null;

  const { items, total } = await fetchAdminProducts({
    page,
    pageSize: pageSize ?? ADMIN_DEFAULT_PAGE_SIZE,
    q: q.trim() || parsed.search,
    subtreeIds,
    folders: parsed.folders,
    scopedFacets: parsed.scopedFacets,
    scopedRanges: parsed.scopedRanges,
  });

  const createOpen = searchParams.create === "1";
  const editId =
    typeof searchParams.edit === "string"
      ? searchParams.edit.trim() || undefined
      : undefined;
  const editProduct = editId
    ? items.find((item) => item.id === editId)
    : undefined;
  const selectedId =
    (typeof searchParams.node === "string"
      ? searchParams.node
      : undefined) ||
    (editProduct?.taxonomyNodeId ?? undefined) ||
    (createOpen ? listRootId : undefined);
  const selectedExists = selectedId
    ? flatFolders.some((folder) => folder.id === selectedId)
    : false;
  const sheetOpen = createOpen || Boolean(editId);
  const attributes =
    sheetOpen && selectedExists && selectedId
      ? resolveAttributesByKey(await fetchAttributesForNode(selectedId))
      : [];
  const displayGroups =
    sheetOpen && selectedExists && selectedId
      ? await fetchDisplayGroupsForNode(selectedId)
      : [];
  const formationAll = resolveFormationTemplates(displayGroups);
  const nameWriterGroup =
    formationAll.find(
      (group) => group.writesProductName && !group.targetAttributeId
    ) ?? null;
  const formationTemplates = formationAll.filter(isActiveFormationTemplate);

  return (
    <AdminProductsView
      locale={locale}
      createOpen={createOpen}
      editId={editId}
      selectedNodeId={selectedExists ? selectedId : undefined}
      listRootId={listRootId}
      tree={tree}
      attributes={attributes}
      tableAttributes={tableAttributes}
      nameWriterGroup={nameWriterGroup}
      formationTemplates={formationTemplates}
      canDelete={isAdminRole(role)}
      items={items}
      totalCount={total}
      listPage={page}
      listPageSize={pageSize}
    />
  );
}

export default AdminProductsPage;
