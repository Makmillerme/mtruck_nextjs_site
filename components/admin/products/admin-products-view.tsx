"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import EmptyList from "@/components/global/EmptyList";
import ProductFolderPicker from "@/components/admin/catalog/product-folder-picker";
import ProductSpecFields from "@/components/admin/catalog/product-spec-fields";
import { CatalogMenuSelect } from "@/components/admin/catalog/catalog-fields";
import { Badge } from "@/components/ui/badge";
import { loadProductSheetMetaAction } from "@/lib/catalog/product-sheet-meta";
import SheetFormActions from "@/components/admin/sheet-form-actions";
import { SubmitButton } from "@/components/form/Buttons";
import { ConfirmDeleteIcon } from "@/components/form/ConfirmDelete";
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
import type { AttributeTypeName } from "@/lib/catalog/types";
import {
  archiveProductAction,
  createProductAction,
  updateProductAction,
} from "@/utils/actions";
import type { actionFunction } from "@/utils/types";
import AdminListToolbar, {
  AdminFilterTrigger,
} from "@/components/admin/admin-list-toolbar";
import { LuArchive, LuColumns3, LuPen } from "react-icons/lu";

const COLUMNS_STORAGE_KEY = "mtruck.admin.products.visibleColumns";
const STATUS_COLUMN_STORAGE_KEY = "mtruck.admin.products.showStatusColumn";

function syncProductsSheetUrl(next: {
  create?: boolean;
  edit?: string;
  node?: string | null;
}) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const root = url.searchParams.get("root");
  url.searchParams.delete("create");
  url.searchParams.delete("edit");
  url.searchParams.delete("node");
  if (next.create) url.searchParams.set("create", "1");
  if (next.edit) url.searchParams.set("edit", next.edit);
  if (next.node) url.searchParams.set("node", next.node);
  if (root) url.searchParams.set("root", root);
  window.history.replaceState(null, "", url.toString());
}

export type AdminProductSpec = {
  attributeId: string;
  optionId: string | null;
  numberValue: number | null;
  textValue: string | null;
  booleanValue: boolean | null;
  optionLabel?: string | null;
  attributeKey?: string | null;
  unit?: string | null;
  type?: AttributeTypeName | null;
};

export type AdminProductRow = {
  id: string;
  name: string;
  company: string;
  price: number;
  currency: string;
  featured: boolean;
  status: string;
  availability: string;
  description: string;
  image: string;
  images: { id: string; url: string }[];
  taxonomyNodeId: string | null;
  specs: AdminProductSpec[];
};

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

function ArchiveProduct({ productId }: { productId: string }) {
  const archiveProduct = archiveProductAction.bind(null, {
    productId,
  }) as unknown as actionFunction;
  return <ConfirmDeleteIcon action={archiveProduct} mode="archive" />;
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
  selectedNodeId,
  onFolderChange,
  attributes,
  product,
  nameWriterGroup = null,
  onNameSettingsSaved,
}: {
  tree: TaxonomyTreeNode[];
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
          tree={tree}
          selectedId={selectedNodeId}
          onNodeChange={onFolderChange}
        />
        <CatalogMenuSelect
          name="status"
          label={t("status")}
          defaultValue={product?.status ?? "DRAFT"}
          options={STATUS_KEYS.map((status) => ({
            value: status,
            label: t(STATUS_LABEL[status]),
          }))}
        />
        <CatalogMenuSelect
          name="availability"
          label={t("availability")}
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
        <input type="hidden" name="company" value={product?.company ?? ""} />
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
}) {
  const t = useTranslations("Admin");
  const [search, setSearch] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [showStatusColumn, setShowStatusColumn] = useState(true);
  const [columnsReady, setColumnsReady] = useState(false);
  const [sheetCreateOpen, setSheetCreateOpen] = useState(createOpen);
  const [sheetEditId, setSheetEditId] = useState<string | undefined>(editId);
  const [folderNodeId, setFolderNodeId] = useState<string | undefined>(
    selectedNodeId ?? listRootId
  );
  const [sheetAttributes, setSheetAttributes] =
    useState<CatalogAttribute[]>(attributes);
  const [sheetNameWriterGroup, setSheetNameWriterGroup] =
    useState<CatalogDisplayGroup | null>(nameWriterGroup);

  useEffect(() => {
    if (sheetEditId) return;
    if (!listRootId) return;
    setFolderNodeId(listRootId);
  }, [listRootId, sheetEditId]);

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
      const statusRaw = window.localStorage.getItem(STATUS_COLUMN_STORAGE_KEY);
      if (statusRaw === "0") setShowStatusColumn(false);
      if (statusRaw === "1") setShowStatusColumn(true);
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
      STATUS_COLUMN_STORAGE_KEY,
      showStatusColumn ? "1" : "0"
    );
  }, [showStatusColumn, columnsReady]);

  const visibleAttributes = useMemo(
    () =>
      tableAttributes.filter((attribute) =>
        visibleKeys.includes(attribute.key)
      ),
    [tableAttributes, visibleKeys]
  );

  const companies = useMemo(() => {
    const set = new Set(items.map((item) => item.company).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, "uk"));
  }, [items]);

  const activeFilterCount =
    selectedCompanies.length + selectedStatuses.length + (featuredOnly ? 1 : 0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (q) {
        const specHay = item.specs
          .map((spec) =>
            [spec.optionLabel, spec.textValue, spec.numberValue]
              .filter((value) => value != null && value !== "")
              .join(" ")
          )
          .join(" ")
          .toLowerCase();
        const hay = `${item.name} ${item.company} ${specHay}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (
        selectedCompanies.length > 0 &&
        !selectedCompanies.includes(item.company)
      ) {
        return false;
      }
      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.includes(item.status)
      ) {
        return false;
      }
      if (featuredOnly && !item.featured) return false;
      return true;
    });
  }, [items, search, selectedCompanies, selectedStatuses, featuredOnly]);

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
      const node = folderNodeId ?? listRootId ?? null;
      if (node && node !== folderNodeId) setFolderNodeId(node);
      syncProductsSheetUrl({ create: true, node });
      if (node) void loadSheetMeta(node);
      return;
    }
    syncProductsSheetUrl({});
  }

  function setEditOpen(open: boolean, productId?: string) {
    if (open && productId) {
      const product = items.find((item) => item.id === productId);
      const node = product?.taxonomyNodeId ?? null;
      setSheetCreateOpen(false);
      setSheetEditId(productId);
      setFolderNodeId(node ?? undefined);
      syncProductsSheetUrl({ edit: productId, node });
      void loadSheetMeta(node);
      return;
    }
    setSheetEditId(undefined);
    syncProductsSheetUrl({});
  }

  function onFolderChange(nodeId: string | null) {
    setFolderNodeId(nodeId ?? undefined);
    if (sheetEditId) {
      syncProductsSheetUrl({ edit: sheetEditId, node: nodeId });
    } else if (sheetCreateOpen) {
      syncProductsSheetUrl({ create: true, node: nodeId });
    }
    void loadSheetMeta(nodeId);
  }

  function toggleCompany(company: string, checked: boolean) {
    setSelectedCompanies((current) =>
      checked
        ? [...current, company]
        : current.filter((item) => item !== company)
    );
  }

  function toggleStatus(status: string, checked: boolean) {
    setSelectedStatuses((current) =>
      checked
        ? [...current, status]
        : current.filter((item) => item !== status)
    );
  }

  function clearFilters() {
    setSelectedCompanies([]);
    setSelectedStatuses([]);
    setFeaturedOnly(false);
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
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={showStatusColumn}
                    onCheckedChange={(value) =>
                      setShowStatusColumn(value === true)
                    }
                  />
                  {t("status")}
                </label>
                {tableAttributes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("columnsEmpty")}
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setVisibleKeys(
                            tableAttributes.map((attribute) => attribute.key)
                          )
                        }
                      >
                        {t("columnsSelectAll")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setVisibleKeys([])}
                      >
                        {t("columnsClear")}
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      {tableAttributes.map((attribute) => {
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
                      })}
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        }
        filterSheet={
          <Sheet>
            <SheetTrigger asChild>
              <AdminFilterTrigger
                label={t("filter")}
                count={activeFilterCount}
              />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t("filter")}</SheetTitle>
              </SheetHeader>
              <div className="grid gap-6 overflow-y-auto">
                <div className="grid gap-3">
                  <p className="text-sm font-medium">{t("filterCompany")}</p>
                  {companies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("filterEmptyCompanies")}
                    </p>
                  ) : (
                    companies.map((company) => {
                      const id = `admin-company-${company}`;
                      return (
                        <label
                          key={company}
                          htmlFor={id}
                          className="flex cursor-pointer items-center gap-3 text-sm"
                        >
                          <Checkbox
                            id={id}
                            checked={selectedCompanies.includes(company)}
                            onCheckedChange={(value) =>
                              toggleCompany(company, value === true)
                            }
                          />
                          {company}
                        </label>
                      );
                    })
                  )}
                </div>
                <div className="grid gap-3">
                  <p className="text-sm font-medium">{t("filterStatus")}</p>
                  {STATUS_KEYS.map((status) => {
                    const id = `admin-status-${status}`;
                    return (
                      <label
                        key={status}
                        htmlFor={id}
                        className="flex cursor-pointer items-center gap-3 text-sm"
                      >
                        <Checkbox
                          id={id}
                          checked={selectedStatuses.includes(status)}
                          onCheckedChange={(value) =>
                            toggleStatus(status, value === true)
                          }
                        />
                        {t(STATUS_LABEL[status])}
                      </label>
                    );
                  })}
                </div>
                <label
                  htmlFor="admin-featured"
                  className="flex cursor-pointer items-center gap-3 text-sm"
                >
                  <Checkbox
                    id="admin-featured"
                    checked={featuredOnly}
                    onCheckedChange={(value) => setFeaturedOnly(value === true)}
                  />
                  {t("filterFeatured")}
                </label>
                {activeFilterCount > 0 ? (
                  <Button type="button" variant="outline" onClick={clearFilters}>
                    {t("clearFilters")}
                  </Button>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
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
                  {showStatusColumn ? (
                    <TableHead>{t("status")}</TableHead>
                  ) : null}
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
                    {showStatusColumn ? (
                      <TableCell>
                        <ProductStatusBadge status={item.status} />
                      </TableCell>
                    ) : null}
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
                          <ArchiveProduct productId={item.id} />
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
