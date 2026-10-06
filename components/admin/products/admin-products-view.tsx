"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ADMIN_LIST_SEARCH_KEY, syncAdminListUrl } from "@/lib/admin/list-url";
import {
  catalogDraftToParams,
  isCatalogFilterParam,
  parseCatalogQuery,
} from "@/utils/catalog-query";
import { formatCurrency } from "@/utils/format";
import { Link } from "@/i18n/navigation";
import EmptyList from "@/components/global/EmptyList";
import ProductFolderPicker from "@/components/admin/catalog/product-folder-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CascadeSelect from "@/components/form/cascade-select";
import {
  firstTreeNodeId,
  getRootChildren,
  isNodeInSubtree,
  taxonomyToCascadeItems,
} from "@/lib/catalog/taxonomy";
import ProductSpecFields from "@/components/admin/catalog/product-spec-fields";
import { CatalogMenuSelect } from "@/components/admin/catalog/catalog-fields";
import { Badge } from "@/components/ui/badge";
import { syncAdminSheetUrl } from "@/lib/admin/sheet-url";
import { loadProductSheetMetaAction } from "@/lib/catalog/product-sheet-meta";
import SheetFormActions from "@/components/admin/sheet-form-actions";
import { SubmitButton } from "@/components/form/Buttons";
import { ConfirmDeleteCallbackIcon } from "@/components/form/ConfirmDelete";
import { useOptimisticListRemove } from "@/lib/admin/optimistic-list";
import FormContainer from "@/components/form/FormContainer";
import ProductImageGalleryField from "@/components/admin/products/product-image-gallery-field";
import PriceInput from "@/components/form/PriceInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import ProductNameSettingsDialog from "@/components/admin/products/product-name-settings-dialog";
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
import { ProductNameInput } from "@/components/admin/products/product-name-tags";
import {
  joinProductName,
  resolveDisplayGroupParts,
  resolveDisplayGroupString,
  specsFromSheetValues,
  splitProductNameAroundComposed,
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
  return Boolean(group && group.members.length > 0);
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
import type { AttributeTypeName } from "@/lib/catalog/types";
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
import {
  buildPathSlugs,
  type FilterAvailabilityIndex,
  type FilterAvailabilityRow,
} from "@/lib/catalog/filter-availability";
import { productMatchesCatalogDraft } from "@/lib/catalog/narrow-facets";
import {
  scopeFilterSchemaToRoot,
  type PublicFilterSchema,
} from "@/lib/catalog/public-filter";
import { flattenTaxonomyTree } from "@/lib/catalog/taxonomy";
import { countActiveCatalogFilters } from "@/utils/catalog-query";
import { LuArchive, LuArrowRight, LuColumns3, LuPen } from "react-icons/lu";

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

export type AdminProductSpec = {
  attributeId: string;
  optionId: string | null;
  numberValue: number | null;
  textValue: string | null;
  booleanValue: boolean | null;
  optionLabel?: string | null;
  optionSlug?: string | null;
  attributeKey?: string | null;
  unit?: string | null;
  type?: AttributeTypeName | null;
};

export type AdminProductRow = {
  id: string;
  name: string;
  price: number;
  currency: string;
  status: string;
  availability: string;
  description: string;
  image: string;
  images: { id: string; url: string }[];
  taxonomyNodeId: string | null;
  specs: AdminProductSpec[];
};

function adminItemToFilterRow(
  item: AdminProductRow,
  byId: Map<string, { id: string; slug: string; parentId: string | null }>
): FilterAvailabilityRow {
  const specs: Record<string, string | number | boolean> = {};
  for (const spec of item.specs) {
    const key = spec.attributeKey;
    if (!key) continue;
    if (spec.optionSlug) {
      specs[key] = spec.optionSlug;
    } else if (
      (spec.type === "NUMBER" || spec.type === "YEAR") &&
      spec.numberValue != null
    ) {
      specs[key] = spec.numberValue;
    } else if (spec.type === "BOOLEAN" && spec.booleanValue != null) {
      specs[key] = spec.booleanValue;
    }
  }
  return {
    pathSlugs: buildPathSlugs(item.taxonomyNodeId, byId),
    specs,
  };
}

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
    if (spec.optionId) values[spec.attributeId] = spec.optionId;
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
  onNameSettingsSaved,
}: {
  tree: TaxonomyTreeNode[];
  listRootId?: string;
  selectedNodeId?: string;
  onFolderChange: (nodeId: string | null) => void;
  attributes: CatalogAttribute[];
  product?: AdminProductRow;
  nameWriterGroup?: CatalogDisplayGroup | null;
  onNameSettingsSaved: () => void;
}) {
  const t = useTranslations("Admin");
  const catalogT = useTranslations("CatalogAdmin");
  const nameTemplate = hasNameTemplate(nameWriterGroup) ? nameWriterGroup : null;
  const [name, setName] = useState(product?.name ?? "");
  const [namePrefix, setNamePrefix] = useState("");
  const [nameSuffix, setNameSuffix] = useState("");
  const [specValues, setSpecValues] = useState<Record<string, string>>(() =>
    product ? specsToInitial(product.specs) : {}
  );
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveDraftId, setMoveDraftId] = useState<string | null>(
    selectedNodeId ?? null
  );

  const pickerTree = useMemo(() => {
    if (!listRootId) return tree;
    return getRootChildren(tree, listRootId);
  }, [tree, listRootId]);

  useEffect(() => {
    const initialSpecs = product ? specsToInitial(product.specs) : {};
    setSpecValues(initialSpecs);
    setName(product?.name ?? "");
    if (!product || !nameTemplate) {
      setNamePrefix("");
      setNameSuffix("");
      return;
    }
    const composed = resolveDisplayGroupString(
      nameTemplate,
      specsFromSheetValues(attributes, initialSpecs)
    );
    const split = splitProductNameAroundComposed(product.name, composed);
    setNamePrefix(split.prefix);
    setNameSuffix(split.suffix);
  }, [product?.id, selectedNodeId, nameTemplate?.id, attributes]);

  const nameParts = useMemo(() => {
    if (!nameTemplate) return [];
    return resolveDisplayGroupParts(
      nameTemplate,
      specsFromSheetValues(attributes, specValues)
    );
  }, [nameTemplate, attributes, specValues]);

  const composedName = useMemo(() => {
    if (!nameTemplate) return "";
    return resolveDisplayGroupString(
      nameTemplate,
      specsFromSheetValues(attributes, specValues)
    );
  }, [nameTemplate, attributes, specValues]);

  const submittedName = nameTemplate
    ? joinProductName(namePrefix, composedName, nameSuffix)
    : name;

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
          trailing={
            product ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-11 w-11 shrink-0"
                aria-label={t("moveProductFolder")}
                onClick={() => {
                  setMoveDraftId(selectedNodeId ?? null);
                  setMoveOpen(true);
                }}
              >
                <LuArrowRight className="size-4" aria-hidden />
              </Button>
            ) : null
          }
        />
        <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
          <DialogContent className="z-[110]">
            <DialogHeader>
              <DialogTitle>{t("moveProductFolderTitle")}</DialogTitle>
              <DialogDescription>
                {t("moveProductFolderDescription")}
              </DialogDescription>
            </DialogHeader>
            <CascadeSelect
              items={taxonomyToCascadeItems(tree)}
              value={moveDraftId}
              onValueChange={setMoveDraftId}
              placeholder={catalogT("templateFolderPlaceholder")}
              emptyLabel={catalogT("emptyFolders")}
              variant="tree"
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMoveOpen(false)}
              >
                {catalogT("cancel")}
              </Button>
              <Button
                type="button"
                disabled={!moveDraftId}
                onClick={() => {
                  if (!moveDraftId) return;
                  onFolderChange(moveDraftId);
                  setMoveOpen(false);
                }}
              >
                {t("moveProductFolderConfirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
          <div className="flex items-center gap-2">
            {nameTemplate ? (
              <>
                <ProductNameInput
                  resetKey={`${product?.id ?? "new"}-${nameTemplate.id}`}
                  tags={nameParts.map((part) => ({
                    id: part.attributeId,
                    label: part.value ?? part.name,
                    filled: Boolean(part.value),
                  }))}
                  separator={nameTemplate.separator}
                  prefix={namePrefix}
                  suffix={nameSuffix}
                  onPrefixChange={setNamePrefix}
                  onSuffixChange={setNameSuffix}
                />
                <input type="hidden" name="namePrefix" value={namePrefix} />
                <input type="hidden" name="nameSuffix" value={nameSuffix} />
                <input type="hidden" id="name" name="name" value={submittedName} />
              </>
            ) : (
              <Input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="min-w-0 flex-1"
              />
            )}
            <ProductNameSettingsDialog
              folderNodeId={selectedNodeId}
              attributes={attributes}
              writerGroup={nameWriterGroup}
              onSaved={onNameSettingsSaved}
            />
          </div>
          {!selectedNodeId ? (
            <p className="text-xs text-muted-foreground">
              {catalogT("productNameSettingsNeedFolder")}
            </p>
          ) : null}
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
  canDelete = false,
  filterSchema,
  filterAvailability,
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
  canDelete?: boolean;
  filterSchema: PublicFilterSchema;
  filterAvailability: FilterAvailabilityIndex;
}) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const { optimisticItems, removeOptimistically } =
    useOptimisticListRemove(items);
  const searchParams = useSearchParams();
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

  useEffect(() => {
    syncAdminListUrl(
      [ADMIN_LIST_SEARCH_KEY],
      {
        ...catalogDraftToParams(appliedFilter),
        [ADMIN_LIST_SEARCH_KEY]: search.trim() || undefined,
      },
      isCatalogFilterParam
    );
  }, [appliedFilter, search]);
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
  }, [listRootId]);

  const scopedFilterSchema = useMemo(
    () => scopeFilterSchemaToRoot(filterSchema, listRootId),
    [filterSchema, listRootId]
  );

  const editProduct = useMemo(
    () => items.find((item) => item.id === sheetEditId) ?? null,
    [items, sheetEditId]
  );

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

  const taxonomyById = useMemo(() => {
    const map = new Map<
      string,
      { id: string; slug: string; parentId: string | null }
    >();
    for (const node of flattenTaxonomyTree(tree)) {
      map.set(node.id, {
        id: node.id,
        slug: node.slug,
        parentId: node.parentId,
      });
    }
    return map;
  }, [tree]);

  const activeFilterCount = countActiveCatalogFilters({
    folders: appliedFilter.folders,
    scopedFacets: appliedFilter.scopedFacets,
    scopedRanges: appliedFilter.scopedRanges,
    facets: {},
    ranges: {},
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const catalogActive = activeFilterCount > 0;
    return optimisticItems.filter((item) => {
      if (q) {
        const specHay = item.specs
          .map((spec) =>
            [spec.optionLabel, spec.textValue, spec.numberValue]
              .filter((value) => value != null && value !== "")
              .join(" ")
          )
          .join(" ")
          .toLowerCase();
        const hay = `${item.name} ${specHay}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (catalogActive) {
        const row = adminItemToFilterRow(item, taxonomyById);
        if (!productMatchesCatalogDraft(row, appliedFilter)) return false;
      }
      return true;
    });
  }, [
    optimisticItems,
    search,
    appliedFilter,
    activeFilterCount,
    taxonomyById,
  ]);

  async function loadSheetMeta(nodeId: string | null) {
    try {
      const meta = await loadProductSheetMetaAction(nodeId);
      setSheetAttributes(meta.attributes);
      setSheetNameWriterGroup(meta.nameWriterGroup);
    } catch {
      setSheetAttributes([]);
      setSheetNameWriterGroup(null);
    }
  }

  function setCreateOpen(open: boolean) {
    setSheetCreateOpen(open);
    if (open) {
      setSheetEditId(undefined);
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
    if (open && productId) {
      const product = items.find((item) => item.id === productId);
      const node = product?.taxonomyNodeId ?? null;
      setSheetCreateOpen(false);
      setSheetEditId(productId);
      setFolderNodeId(node ?? undefined);
      syncAdminSheetUrl({ edit: productId, node });
      void loadSheetMeta(node);
      return;
    }
    setSheetEditId(undefined);
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
          >
            {({ close }) => (
              <LocalCatalogFilterProvider
                key={listRootId ?? "all"}
                schema={scopedFilterSchema}
                availability={filterAvailability}
                applied={appliedFilter}
                onAppliedChange={setAppliedFilter}
                onSheetApplied={close}
              >
                <CatalogFilterFields
                  idPrefix="admin-filter"
                  clearBelowApply
                />
              </LocalCatalogFilterProvider>
            )}
          </AdminFilterSheet>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("totalProducts", { count: filtered.length })}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/archive?tab=products">
            <LuArchive className="size-4" />
            {t("archive")}
          </Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
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
                {filtered.map((item) => (
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

      <Sheet open={sheetCreateOpen} onOpenChange={setCreateOpen}>
        <SheetContent>
          <div className="grid gap-6">
            <SheetHeader>
              <SheetTitle>{t("createSheetTitle")}</SheetTitle>
            </SheetHeader>
            <FormContainer
              key={sheetCreateOpen ? "create-open" : "create-closed"}
              action={createProductAction}
            >
              <div className="grid gap-6">
                <ProductSheetFields
                  tree={tree}
                  listRootId={listRootId}
                  selectedNodeId={folderNodeId}
                  onFolderChange={onFolderChange}
                  attributes={sheetAttributes}
                  nameWriterGroup={sheetNameWriterGroup}
                  onNameSettingsSaved={() => void loadSheetMeta(folderNodeId ?? null)}
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
                >
                  <input type="hidden" name="id" value={editProduct.id} />
                  <div className="grid gap-6">
                    <ProductSheetFields
                      tree={tree}
                      listRootId={listRootId}
                      selectedNodeId={folderNodeId}
                      onFolderChange={onFolderChange}
                      attributes={sheetAttributes}
                      product={editProduct}
                      nameWriterGroup={sheetNameWriterGroup}
                      onNameSettingsSaved={() =>
                        void loadSheetMeta(folderNodeId ?? null)
                      }
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
