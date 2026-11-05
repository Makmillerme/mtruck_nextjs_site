"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import AdminTablePagination from "@/components/admin/admin-table-pagination";
import { ADMIN_LIST_SEARCH_KEY } from "@/lib/admin/list-url";
import {
  adminPageCount,
  adminPaginationParams,
  clampAdminPage,
  type AdminPageSize,
} from "@/lib/admin/list-pagination";
import { useSoftNavOptional } from "@/components/soft-nav/soft-nav";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  catalogDraftToParams,
  parseCatalogQuery,
} from "@/utils/catalog-query";
import { formatCurrency } from "@/utils/format";
import { Link } from "@/i18n/navigation";
import EmptyList from "@/components/global/EmptyList";
import ProductFolderPicker from "@/components/admin/catalog/product-folder-picker";
import {
  firstTreeNodeId,
  getRootChildren,
  isNodeInSubtree,
} from "@/lib/catalog/taxonomy";
import ProductSpecFields from "@/components/admin/catalog/product-spec-fields";
import { CatalogMenuSelect } from "@/components/admin/catalog/catalog-fields";
import { Badge } from "@/components/ui/badge";
import { syncAdminSheetUrl } from "@/lib/admin/sheet-url";
import {
  loadAdminProductSheetAction,
  loadAdminProductsFilterChromeAction,
  loadProductSheetMetaAction,
} from "@/lib/catalog/product-sheet-meta";
import type { AdminProductRowDTO } from "@/lib/admin/product-row";
import type { ActionState } from "@/utils/types";
import SheetFormActions from "@/components/admin/sheet-form-actions";
import { SubmitButton } from "@/components/form/Buttons";
import { ConfirmDeleteCallbackIcon } from "@/components/form/ConfirmDelete";
import { useOptimisticListRemove } from "@/lib/admin/optimistic-list";
import FormContainer from "@/components/form/FormContainer";
import ProductImageGalleryField from "@/components/admin/products/product-image-gallery-field";
import PriceInput from "@/components/form/PriceInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableActionsClassName,
  tableLinkClassName,
} from "@/components/ui/table";
import {
  resolveDisplayGroupString,
  specsFromSheetValues,
} from "@/lib/catalog/display-group";
import { formatSpecCell } from "@/lib/catalog/spec-display";
import type {
  CatalogAttribute,
  CatalogDisplayGroup,
  TaxonomyTreeNode,
} from "@/lib/catalog/types";

function hasNameTemplate(
  group: CatalogDisplayGroup | null | undefined
): group is CatalogDisplayGroup {
  return Boolean(
    group &&
      group.writesProductName &&
      !group.targetAttributeId &&
      group.members.length > 0
  );
}

/** Prefer an in-scope child folder; fall back to root when it has no children. */
function resolveScopedFolderId(
  tree: TaxonomyTreeNode[],
  listRootId: string | undefined,
  preferred: string | undefined
): string | undefined {
  if (!listRootId) return preferred;
  const children = getRootChildren(tree, listRootId);
  if (children.length === 0) return listRootId;
  if (
    preferred &&
    preferred !== listRootId &&
    isNodeInSubtree(tree, listRootId, preferred)
  ) {
    return preferred;
  }
  return firstTreeNodeId(children);
}
import {
  archiveProductAction,
  createProductAction,
  updateProductAction,
} from "@/utils/actions";
import type { actionFunction } from "@/utils/types";
import AdminListToolbar, {
  AdminFilterSheet,
} from "@/components/admin/admin-list-toolbar";
import {
  CatalogFilterFields,
  EMPTY_CATALOG_FILTER_DRAFT,
  LocalCatalogFilterProvider,
  type CatalogFilterDraft,
} from "@/components/products/catalog-filters";
import type { FilterAvailabilityIndex } from "@/lib/catalog/filter-availability";
import type { PublicFilterSchema } from "@/lib/catalog/public-filter";
import { countActiveCatalogFilters } from "@/utils/catalog-query";
import { LuArchive, LuColumns3, LuPen } from "react-icons/lu";

const COLUMNS_STORAGE_KEY = "mtruck.admin.products.visibleColumns";
const SYSTEM_COLUMNS_STORAGE_KEY =
  "mtruck.admin.products.visibleSystemColumns";
/** Legacy single-flag prefs — migrated once into SYSTEM_COLUMNS_STORAGE_KEY. */
const STATUS_COLUMN_STORAGE_KEY = "mtruck.admin.products.showStatusColumn";

const SYSTEM_COLUMN_IDS = ["status", "availability", "price"] as const;

type SystemColumnId = (typeof SYSTEM_COLUMN_IDS)[number];

const SYSTEM_COLUMN_LABEL: Record<SystemColumnId, string> = {
  status: "status",
  availability: "availability",
  price: "price",
};

const AVAILABILITY_LABEL: Record<string, string> = {
  IN_STOCK: "availabilityStock",
  TRANSIT: "availabilityTransit",
};

export type AdminProductSpec = AdminProductRowDTO["specs"][number];
export type AdminProductRow = AdminProductRowDTO;

const STATUS_KEYS = [
  "DRAFT",
  "PUBLISHED",
  "RESERVED",
  "PREPARING",
  "SOLD",
] as const;

const STATUS_LABEL = {
  DRAFT: "statusDraft",
  PUBLISHED: "statusPublished",
  RESERVED: "statusReserved",
  PREPARING: "statusPreparing",
  SOLD: "statusSold",
} as const;

const STATUS_BADGE_CLASS: Record<(typeof STATUS_KEYS)[number], string> = {
  DRAFT: "border-transparent bg-muted text-muted-foreground",
  PUBLISHED: "border-transparent bg-primary/15 text-primary",
  RESERVED:
    "border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-200",
  PREPARING:
    "border-transparent bg-sky-500/15 text-sky-800 dark:text-sky-200",
  SOLD: "border-transparent bg-destructive/15 text-destructive",
};

function ProductStatusBadge({ status }: { status: string }) {
  const t = useTranslations("Admin");
  const key = STATUS_KEYS.includes(status as (typeof STATUS_KEYS)[number])
    ? (status as (typeof STATUS_KEYS)[number])
    : null;
  const label = key ? t(STATUS_LABEL[key]) : status;
  return (
    <Badge
      variant="outline"
      className={key ? STATUS_BADGE_CLASS[key] : undefined}
    >
      {label}
    </Badge>
  );
}

function ArchiveProduct({
  productId,
  onArchive,
}: {
  productId: string;
  onArchive: (productId: string) => void;
}) {
  return (
    <ConfirmDeleteCallbackIcon
      mode="archive"
      onConfirm={() => onArchive(productId)}
    />
  );
}

function specsToInitial(specs: AdminProductSpec[]) {
  const values: Record<string, string> = {};
  for (const spec of specs) {
    if (spec.optionIds && spec.optionIds.length > 0) {
      values[spec.attributeId] = spec.optionIds.join(",");
    } else if (spec.optionId) values[spec.attributeId] = spec.optionId;
    else if (spec.numberValue != null) {
      values[spec.attributeId] = String(spec.numberValue);
    } else if (spec.textValue) values[spec.attributeId] = spec.textValue;
    else if (spec.booleanValue != null) {
      values[spec.attributeId] = spec.booleanValue ? "true" : "";
    }
  }
  return values;
}

function findSpecForAttribute(
  specs: AdminProductSpec[],
  attribute: CatalogAttribute
) {
  return (
    specs.find((spec) => spec.attributeId === attribute.id) ??
    specs.find((spec) => spec.attributeKey === attribute.key)
  );
}

function ProductSheetFields({
  tree,
  listRootId,
  selectedNodeId,
  onFolderChange,
  attributes,
  product,
  nameWriterGroup = null,
  formationTemplates = [],
}: {
  tree: TaxonomyTreeNode[];
  listRootId?: string;
  selectedNodeId?: string;
  onFolderChange: (nodeId: string | null) => void;
  attributes: CatalogAttribute[];
  product?: AdminProductRow;
  nameWriterGroup?: CatalogDisplayGroup | null;
  formationTemplates?: CatalogDisplayGroup[];
}) {
  const t = useTranslations("Admin");
  const catalogT = useTranslations("CatalogAdmin");
  const nameTemplate = hasNameTemplate(nameWriterGroup) ? nameWriterGroup : null;
  const textFormationTemplates = useMemo(
    () =>
      formationTemplates.filter(
        (group) => group.targetAttributeId && group.members.length > 0
      ),
    [formationTemplates]
  );
  const [name, setName] = useState(product?.name ?? "");
  const [nameTouched, setNameTouched] = useState(Boolean(product?.name));
  const lastAutoNameRef = useRef("");
  const [specValues, setSpecValues] = useState<Record<string, string>>(() =>
    product ? specsToInitial(product.specs) : {}
  );

  const pickerTree = useMemo(() => {
    if (!listRootId) return tree;
    return getRootChildren(tree, listRootId);
  }, [tree, listRootId]);

  const sheetSpecs = useMemo(
    () => specsFromSheetValues(attributes, specValues),
    [attributes, specValues]
  );

  const composedName = useMemo(() => {
    if (!nameTemplate) return "";
    return resolveDisplayGroupString(nameTemplate, sheetSpecs);
  }, [nameTemplate, sheetSpecs]);

  const formationAutoValues = useMemo(() => {
    const map: Record<string, string> = {};
    for (const template of textFormationTemplates) {
      if (!template.targetAttributeId) continue;
      const composed = resolveDisplayGroupString(template, sheetSpecs);
      if (composed) map[template.targetAttributeId] = composed;
    }
    return map;
  }, [textFormationTemplates, sheetSpecs]);

  useEffect(() => {
    const initialSpecs = product ? specsToInitial(product.specs) : {};
    setSpecValues(initialSpecs);
    const initialName = product?.name ?? "";
    setName(initialName);
    const initialComposed = nameTemplate
      ? resolveDisplayGroupString(
          nameTemplate,
          specsFromSheetValues(attributes, initialSpecs)
        )
      : "";
    lastAutoNameRef.current = initialComposed;
    // Existing product name is treated as user-owned until specs recompose.
    setNameTouched(Boolean(initialName) && initialName !== initialComposed);
  }, [product?.id, selectedNodeId, nameTemplate?.id, attributes]);

  useEffect(() => {
    if (!nameTemplate) return;
    if (!composedName) return;
    if (
      !nameTouched ||
      name.trim().length === 0 ||
      name === lastAutoNameRef.current
    ) {
      setName(composedName);
      lastAutoNameRef.current = composedName;
      setNameTouched(false);
    }
  }, [composedName, nameTemplate, nameTouched, name]);

  return (
    <Tabs defaultValue="main" className="grid gap-6">
      <TabsList className="w-full">
        <TabsTrigger value="main" className="sm:flex-1">
          {t("sheetTabMain")}
        </TabsTrigger>
        <TabsTrigger value="specs" className="sm:flex-1">
          {t("sheetTabSpecs")}
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="main"
        forceMount
        className="mt-0 grid gap-4 data-[state=inactive]:hidden"
      >
        <ProductFolderPicker
          tree={pickerTree}
          selectedId={selectedNodeId}
          onNodeChange={onFolderChange}
        />
        <CatalogMenuSelect
          name="status"
          label={t("status")}
          searchable={false}
          defaultValue={product?.status ?? "DRAFT"}
          options={STATUS_KEYS.map((status) => ({
            value: status,
            label: t(STATUS_LABEL[status]),
          }))}
        />
        <CatalogMenuSelect
          name="availability"
          label={t("availability")}
          searchable={false}
          defaultValue={product?.availability ?? "IN_STOCK"}
          options={[
            { value: "IN_STOCK", label: t("availabilityStock") },
            { value: "TRANSIT", label: t("availabilityTransit") },
          ]}
        />
        <ProductImageGalleryField
          existing={
            product?.images?.length
              ? product.images
              : product?.image
                ? [{ id: `cover:${product.id}`, url: product.image }]
                : []
          }
          resetKey={product?.id ?? "new"}
          alt={product?.name ?? ""}
        />
        <div className="grid gap-2">
          <Label htmlFor="name">{t("productName")}</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => {
              setNameTouched(true);
              setName(event.target.value);
            }}
            required
          />
        </div>
        <PriceInput
          defaultValue={product?.price}
          defaultCurrency={product?.currency ?? "USD"}
        />
        <TextAreaInput
          name="description"
          labelText={t("description")}
          defaultValue={product?.description ?? ""}
          required={false}
        />
      </TabsContent>

      <TabsContent
        value="specs"
        forceMount
        className="mt-0 data-[state=inactive]:hidden"
      >
        {attributes.length > 0 ? (
          <ProductSpecFields
            key={`${product?.id ?? "new"}-${selectedNodeId ?? "none"}`}
            attributes={attributes}
            initialValues={product ? specsToInitial(product.specs) : {}}
            onValuesChange={setSpecValues}
            formationAutoValues={formationAutoValues}
            showHeading={false}
          />
        ) : selectedNodeId ? (
          <p className="text-sm text-muted-foreground">
            {catalogT("noOwnFields")}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {catalogT("productSpecsNeedFolder")}
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}

export default function AdminProductsView({
  items,
  tree,
  attributes,
  tableAttributes,
  createOpen,
  editId,
  selectedNodeId,
  listRootId,
  nameWriterGroup = null,
  formationTemplates = [],
  canDelete = false,
  totalCount,
  listPage,
  listPageSize,
}: {
  items: AdminProductRow[];
  locale: string;
  tree: TaxonomyTreeNode[];
  attributes: CatalogAttribute[];
  tableAttributes: CatalogAttribute[];
  createOpen: boolean;
  editId?: string;
  selectedNodeId?: string;
  listRootId?: string;
  nameWriterGroup?: CatalogDisplayGroup | null;
  formationTemplates?: CatalogDisplayGroup[];
  canDelete?: boolean;
  /** Server-paginated total (not just current page length). */
  totalCount: number;
  listPage: number;
  listPageSize: AdminPageSize;
}) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const softNav = useSoftNavOptional();
  const searchParams = useSearchParams();
  const [listItems, setListItems] = useState(items);
  const [listTotal, setListTotal] = useState(totalCount);
  useEffect(() => {
    setListItems(items);
    setListTotal(totalCount);
  }, [items, totalCount]);
  const { optimisticItems, removeOptimistically } =
    useOptimisticListRemove(listItems);
  const [sheetProduct, setSheetProduct] = useState<AdminProductRow | null>(
    null
  );
  const [sheetSavePending, setSheetSavePending] = useState(false);
  const [search, setSearch] = useState(
    () => searchParams.get(ADMIN_LIST_SEARCH_KEY) ?? ""
  );
  const [appliedFilter, setAppliedFilter] = useState<CatalogFilterDraft>(() => {
    const parsed = parseCatalogQuery(
      new URLSearchParams(searchParams.toString())
    );
    return {
      folders: parsed.folders,
      scopedFacets: parsed.scopedFacets,
      scopedRanges: parsed.scopedRanges,
    };
  });
  const filterRootRef = useRef(listRootId);
  const [filterSchema, setFilterSchema] = useState<PublicFilterSchema | null>(
    null
  );
  const [filterAvailability, setFilterAvailability] =
    useState<FilterAvailabilityIndex | null>(null);
  const [filterChromeLoading, setFilterChromeLoading] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [visibleSystemKeys, setVisibleSystemKeys] = useState<SystemColumnId[]>(
    () => [...SYSTEM_COLUMN_IDS]
  );
  const [columnsReady, setColumnsReady] = useState(false);
  const [sheetCreateOpen, setSheetCreateOpen] = useState(createOpen);
  const [sheetEditId, setSheetEditId] = useState<string | undefined>(editId);
  const [folderNodeId, setFolderNodeId] = useState<string | undefined>(() =>
    resolveScopedFolderId(tree, listRootId, selectedNodeId)
  );
  const [sheetAttributes, setSheetAttributes] =
    useState<CatalogAttribute[]>(attributes);
  const [sheetNameWriterGroup, setSheetNameWriterGroup] =
    useState<CatalogDisplayGroup | null>(nameWriterGroup);
  const [sheetFormationTemplates, setSheetFormationTemplates] =
    useState<CatalogDisplayGroup[]>(formationTemplates);

  useEffect(() => {
    if (sheetEditId) return;
    setFolderNodeId((current) =>
      resolveScopedFolderId(tree, listRootId, current ?? selectedNodeId)
    );
  }, [listRootId, sheetEditId, tree, selectedNodeId]);

  useEffect(() => {
    if (filterRootRef.current === listRootId) return;
    filterRootRef.current = listRootId;
    setAppliedFilter(EMPTY_CATALOG_FILTER_DRAFT);
    setFilterSchema(null);
    setFilterAvailability(null);
  }, [listRootId]);

  const editProduct = useMemo(() => {
    if (!sheetEditId) return null;
    if (sheetProduct?.id === sheetEditId) return sheetProduct;
    return listItems.find((item) => item.id === sheetEditId) ?? null;
  }, [sheetEditId, sheetProduct, listItems]);

  const tableAttributeKeys = useMemo(
    () => new Set(tableAttributes.map((attribute) => attribute.key)),
    [tableAttributes]
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setVisibleKeys(
            parsed.filter(
              (key): key is string =>
                typeof key === "string" && tableAttributeKeys.has(key)
            )
          );
        }
      }
      const systemRaw = window.localStorage.getItem(SYSTEM_COLUMNS_STORAGE_KEY);
      if (systemRaw) {
        const parsed = JSON.parse(systemRaw) as unknown;
        if (Array.isArray(parsed)) {
          setVisibleSystemKeys(
            parsed.filter((key): key is SystemColumnId =>
              SYSTEM_COLUMN_IDS.includes(key as SystemColumnId)
            )
          );
        }
      } else {
        const statusRaw = window.localStorage.getItem(STATUS_COLUMN_STORAGE_KEY);
        if (statusRaw === "0") {
          setVisibleSystemKeys(
            SYSTEM_COLUMN_IDS.filter((id) => id !== "status")
          );
        } else {
          setVisibleSystemKeys([...SYSTEM_COLUMN_IDS]);
        }
      }
    } catch {
      // ignore invalid prefs
    }
    setColumnsReady(true);
  }, [tableAttributeKeys]);

  useEffect(() => {
    if (!columnsReady) return;
    window.localStorage.setItem(
      COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleKeys)
    );
  }, [visibleKeys, columnsReady]);

  useEffect(() => {
    if (!columnsReady) return;
    window.localStorage.setItem(
      SYSTEM_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleSystemKeys)
    );
  }, [visibleSystemKeys, columnsReady]);

  const visibleAttributes = useMemo(
    () =>
      tableAttributes.filter((attribute) =>
        visibleKeys.includes(attribute.key)
      ),
    [tableAttributes, visibleKeys]
  );

  const activeFilterCount = countActiveCatalogFilters({
    folders: appliedFilter.folders,
    scopedFacets: appliedFilter.scopedFacets,
    scopedRanges: appliedFilter.scopedRanges,
    facets: {},
    ranges: {},
  });

  const page = clampAdminPage(
    listPage,
    adminPageCount(listTotal, listPageSize)
  );
  const pageSize = listPageSize;
  const pageCount = adminPageCount(listTotal, pageSize);
  const pagedItems = optimisticItems;
  const showPagination = listTotal > 0;

  function commitListQuery(next: {
    search?: string;
    filter?: CatalogFilterDraft;
    page?: number;
    pageSize?: AdminPageSize;
  }) {
    const nextSearch = next.search ?? search;
    const nextFilter = next.filter ?? appliedFilter;
    const nextPageSize = next.pageSize ?? pageSize;
    const nextPage = next.page ?? 1;
    const params = new URLSearchParams();
    const root = searchParams.get("root");
    if (root) params.set("root", root);
    const q = nextSearch.trim();
    if (q) params.set(ADMIN_LIST_SEARCH_KEY, q);
    const pagination = adminPaginationParams(nextPage, nextPageSize);
    for (const [key, value] of Object.entries(pagination)) {
      if (value) params.set(key, value);
    }
    for (const [key, value] of Object.entries(
      catalogDraftToParams(nextFilter)
    )) {
      if (value) params.set(key, value);
    }
    // Preserve sheet keys while list query navigates.
    for (const key of ["create", "edit", "node"] as const) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
    const href = params.toString() ? `${pathname}?${params}` : pathname;
    const navigate = () => router.replace(href);
    if (softNav) softNav.startTransition(navigate);
    else navigate();
  }

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    const urlQ = searchParams.get(ADMIN_LIST_SEARCH_KEY) ?? "";
    if (search.trim() === urlQ.trim()) return;
    searchDebounceRef.current = setTimeout(() => {
      commitListQuery({ search, page: 1 });
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce search only
  }, [search]);

  async function ensureFilterChrome() {
    if (filterSchema && filterAvailability) return;
    if (filterChromeLoading) return;
    setFilterChromeLoading(true);
    try {
      const chrome = await loadAdminProductsFilterChromeAction(listRootId);
      setFilterSchema(chrome.schema);
      setFilterAvailability(chrome.availability);
    } finally {
      setFilterChromeLoading(false);
    }
  }

  const scopedFilterSchema = filterSchema;

  async function loadSheetMeta(nodeId: string | null) {
    try {
      const meta = await loadProductSheetMetaAction(nodeId);
      setSheetAttributes(meta.attributes);
      setSheetNameWriterGroup(meta.nameWriterGroup);
      setSheetFormationTemplates(meta.formationTemplates);
    } catch {
      setSheetAttributes([]);
      setSheetNameWriterGroup(null);
      setSheetFormationTemplates([]);
    }
  }

  function onProductSaved(state: ActionState) {
    if (!state.product) return;
    const saved = state.product;
    setListItems((prev) => {
      const index = prev.findIndex((item) => item.id === saved.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setSheetSavePending(false);
    setSheetProduct(null);
    setSheetCreateOpen(false);
    setSheetEditId(undefined);
    syncAdminSheetUrl({});
  }

  function setCreateOpen(open: boolean) {
    if (!open && sheetSavePending) return;
    setSheetCreateOpen(open);
    if (open) {
      setSheetEditId(undefined);
      setSheetProduct(null);
      const node =
        resolveScopedFolderId(tree, listRootId, folderNodeId) ?? null;
      if (node && node !== folderNodeId) setFolderNodeId(node);
      syncAdminSheetUrl({ create: true, node });
      if (node) void loadSheetMeta(node);
      return;
    }
    syncAdminSheetUrl({});
  }

  function setEditOpen(open: boolean, productId?: string) {
    if (!open && sheetSavePending) return;
    if (open && productId) {
      const product = listItems.find((item) => item.id === productId);
      const node = product?.taxonomyNodeId ?? null;
      setSheetCreateOpen(false);
      setSheetEditId(productId);
      setSheetProduct(product ?? null);
      setFolderNodeId(node ?? undefined);
      syncAdminSheetUrl({ edit: productId, node });
      void (async () => {
        try {
          const hydrate = await loadAdminProductSheetAction(productId, node);
          if (hydrate.product) setSheetProduct(hydrate.product);
          setSheetAttributes(hydrate.attributes);
          setSheetNameWriterGroup(hydrate.nameWriterGroup);
          setSheetFormationTemplates(hydrate.formationTemplates);
        } catch {
          void loadSheetMeta(node);
        }
      })();
      return;
    }
    setSheetEditId(undefined);
    setSheetProduct(null);
    syncAdminSheetUrl({});
  }

  function onFolderChange(nodeId: string | null) {
    setFolderNodeId(nodeId ?? undefined);
    if (sheetEditId) {
      syncAdminSheetUrl({ edit: sheetEditId, node: nodeId });
    } else if (sheetCreateOpen) {
      syncAdminSheetUrl({ create: true, node: nodeId });
    }
    void loadSheetMeta(nodeId);
  }

  function clearFilters() {
    setAppliedFilter(EMPTY_CATALOG_FILTER_DRAFT);
    commitListQuery({ filter: EMPTY_CATALOG_FILTER_DRAFT, page: 1 });
  }

  function onFilterApplied(draft: CatalogFilterDraft) {
    setAppliedFilter(draft);
    commitListQuery({ filter: draft, page: 1 });
  }

  function setPage(next: number) {
    commitListQuery({ page: next });
  }

  function setPageSize(next: AdminPageSize) {
    commitListQuery({ pageSize: next, page: 1 });
  }

  function toggleColumn(key: string, checked: boolean) {
    setVisibleKeys((current) =>
      checked
        ? current.includes(key)
          ? current
          : [...current, key]
        : current.filter((item) => item !== key)
    );
  }

  function toggleSystemColumn(id: SystemColumnId, checked: boolean) {
    setVisibleSystemKeys((current) =>
      checked
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((item) => item !== id)
    );
  }

  function selectAllColumns() {
    setVisibleSystemKeys([...SYSTEM_COLUMN_IDS]);
    setVisibleKeys(tableAttributes.map((attribute) => attribute.key));
  }

  function clearAllColumns() {
    setVisibleSystemKeys([]);
    setVisibleKeys([]);
  }

  function renderSystemCell(id: SystemColumnId, item: AdminProductRow) {
    switch (id) {
      case "status":
        return <ProductStatusBadge status={item.status} />;
      case "availability": {
        const key = AVAILABILITY_LABEL[item.availability];
        return key ? t(key) : item.availability;
      }
      case "price": {
        const currency =
          item.currency === "EUR" || item.currency === "UAH"
            ? item.currency
            : "USD";
        return formatCurrency(item.price, locale, currency);
      }
      default:
        return t("columnsEmptyCell");
    }
  }

  const archiveProduct =
    editProduct != null
      ? (archiveProductAction.bind(null, {
          productId: editProduct.id,
        }) as unknown as actionFunction)
      : undefined;

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        createLabel={t("createProduct")}
        onCreate={() => setCreateOpen(true)}
        toolbarActions={
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-2"
              >
                <LuColumns3 className="size-4" />
                {t("columns")}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t("columnsSheetTitle")}</SheetTitle>
                <SheetDescription>{t("columnsSheetLede")}</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllColumns}
                  >
                    {t("columnsSelectAll")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllColumns}
                  >
                    {t("columnsClear")}
                  </Button>
                </div>
                <div className="grid gap-3">
                  <p className="text-sm font-medium">{t("columnsSystemSection")}</p>
                  {SYSTEM_COLUMN_IDS.map((columnId) => {
                    const id = `admin-sys-col-${columnId}`;
                    return (
                      <label
                        key={columnId}
                        htmlFor={id}
                        className="flex cursor-pointer items-center gap-3 text-sm"
                      >
                        <Checkbox
                          id={id}
                          checked={visibleSystemKeys.includes(columnId)}
                          onCheckedChange={(value) =>
                            toggleSystemColumn(columnId, value === true)
                          }
                        />
                        {t(SYSTEM_COLUMN_LABEL[columnId])}
                      </label>
                    );
                  })}
                </div>
                <div className="grid gap-3">
                  <p className="text-sm font-medium">{t("columnsCatalogSection")}</p>
                  {tableAttributes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("columnsEmpty")}
                    </p>
                  ) : (
                    tableAttributes.map((attribute) => {
                      const id = `admin-col-${attribute.key}`;
                      return (
                        <label
                          key={attribute.key}
                          htmlFor={id}
                          className="flex cursor-pointer items-center gap-3 text-sm"
                        >
                          <Checkbox
                            id={id}
                            checked={visibleKeys.includes(attribute.key)}
                            onCheckedChange={(value) =>
                              toggleColumn(attribute.key, value === true)
                            }
                          />
                          {attribute.name}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        }
        filterSheet={
          <AdminFilterSheet
            label={t("filter")}
            count={activeFilterCount}
            clearLabel={t("clearFilters")}
            applyLabel={t("filterApply")}
            onClear={clearFilters}
            hideFooter
            onOpenChange={(open) => {
              if (open) void ensureFilterChrome();
            }}
          >
            {({ close }) =>
              scopedFilterSchema && filterAvailability ? (
                <LocalCatalogFilterProvider
                  key={listRootId ?? "all"}
                  schema={scopedFilterSchema}
                  availability={filterAvailability}
                  applied={appliedFilter}
                  onAppliedChange={onFilterApplied}
                  onSheetApplied={close}
                >
                  <CatalogFilterFields
                    idPrefix="admin-filter"
                    clearBelowApply
                  />
                </LocalCatalogFilterProvider>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {filterChromeLoading ? "…" : t("filter")}
                </p>
              )
            }
          </AdminFilterSheet>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("totalProducts", { count: listTotal })}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/archive?tab=products">
            <LuArchive className="size-4" />
            {t("archive")}
          </Link>
        </Button>
      </div>

      {pagedItems.length === 0 ? (
        <EmptyList />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("productName")}</TableHead>
                  {SYSTEM_COLUMN_IDS.filter((id) =>
                    visibleSystemKeys.includes(id)
                  ).map((columnId) => (
                    <TableHead key={columnId}>
                      {t(SYSTEM_COLUMN_LABEL[columnId])}
                    </TableHead>
                  ))}
                  {visibleAttributes.map((attribute) => (
                    <TableHead key={attribute.key}>{attribute.name}</TableHead>
                  ))}
                  <TableHead className={tableActionsClassName}>
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        asChild
                        className={tableLinkClassName}
                      >
                        <Link href={`/products/${item.id}`}>{item.name}</Link>
                      </Button>
                    </TableCell>
                    {SYSTEM_COLUMN_IDS.filter((id) =>
                      visibleSystemKeys.includes(id)
                    ).map((columnId) => (
                      <TableCell key={columnId}>
                        {renderSystemCell(columnId, item)}
                      </TableCell>
                    ))}
                    {visibleAttributes.map((attribute) => (
                      <TableCell key={attribute.key}>
                        {formatSpecCell(
                          attribute,
                          findSpecForAttribute(item.specs, attribute),
                          t("columnsYes"),
                          t("columnsNo"),
                          t("columnsEmptyCell")
                        )}
                      </TableCell>
                    ))}
                    <TableCell className={tableActionsClassName}>
                      <div className="inline-flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer text-muted-foreground"
                          onClick={() => setEditOpen(true, item.id)}
                          aria-label={t("editProduct")}
                        >
                          <LuPen />
                        </Button>
                        {canDelete ? (
                          <ArchiveProduct
                            productId={item.id}
                            onArchive={(productId) =>
                              removeOptimistically(productId, () =>
                                archiveProductAction({ productId })
                              )
                            }
                          />
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {showPagination ? (
        <AdminTablePagination
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      ) : null}

      <Sheet open={sheetCreateOpen} onOpenChange={setCreateOpen}>
        <SheetContent>
          <div className="grid gap-6">
            <SheetHeader>
              <SheetTitle>{t("createSheetTitle")}</SheetTitle>
            </SheetHeader>
            <FormContainer
              key={sheetCreateOpen ? "create-open" : "create-closed"}
              action={createProductAction}
              onSuccess={onProductSaved}
              onPendingChange={setSheetSavePending}
            >
              {listRootId ? (
                <input type="hidden" name="listRootId" value={listRootId} />
              ) : null}
              <div className="grid gap-6">
                <ProductSheetFields
                  tree={tree}
                  listRootId={listRootId}
                  selectedNodeId={folderNodeId}
                  onFolderChange={onFolderChange}
                  attributes={sheetAttributes}
                  nameWriterGroup={sheetNameWriterGroup}
                  formationTemplates={sheetFormationTemplates}
                />
                <SubmitButton text={t("submitCreate")} className="w-fit" />
              </div>
            </FormContainer>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={Boolean(editProduct)}
        onOpenChange={(open) => setEditOpen(open, editProduct?.id)}
      >
        <SheetContent>
          <div className="grid gap-6">
            <SheetHeader>
              <SheetTitle>{t("editSheetTitle")}</SheetTitle>
            </SheetHeader>
            {editProduct ? (
              <>
                <FormContainer
                  key={editProduct.id}
                  action={updateProductAction}
                  onSuccess={onProductSaved}
                  onPendingChange={setSheetSavePending}
                >
                  <input type="hidden" name="id" value={editProduct.id} />
                  {listRootId ? (
                    <input type="hidden" name="listRootId" value={listRootId} />
                  ) : null}
                  <div className="grid gap-6">
                    <ProductSheetFields
                      tree={tree}
                      listRootId={listRootId}
                      selectedNodeId={folderNodeId}
                      onFolderChange={onFolderChange}
                      attributes={sheetAttributes}
                      product={editProduct}
                      nameWriterGroup={sheetNameWriterGroup}
                      formationTemplates={sheetFormationTemplates}
                    />
                    <SheetFormActions
                      saveLabel={t("submitUpdate")}
                      deleteFormId={
                        canDelete ? "archive-product-form" : undefined
                      }
                    />
                  </div>
                </FormContainer>
                {canDelete && archiveProduct ? (
                  <FormContainer
                    id="archive-product-form"
                    className="hidden"
                    action={archiveProduct}
                  >
                    <input
                      type="hidden"
                      name="productId"
                      value={editProduct.id}
                    />
                  </FormContainer>
                ) : null}
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
