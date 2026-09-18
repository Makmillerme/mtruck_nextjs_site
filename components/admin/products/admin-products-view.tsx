"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import EmptyList from "@/components/global/EmptyList";
import ProductFolderPicker from "@/components/admin/catalog/product-folder-picker";
import ProductSpecFields from "@/components/admin/catalog/product-spec-fields";
import { CatalogNativeSelect } from "@/components/admin/catalog/catalog-fields";
import SheetFormActions from "@/components/admin/sheet-form-actions";
import { SubmitButton } from "@/components/form/Buttons";
import { ConfirmDeleteIcon } from "@/components/form/ConfirmDelete";
import CheckboxInput from "@/components/form/CheckboxInput";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import ImageGalleryInput from "@/components/form/ImageGalleryInput";
import PriceInput from "@/components/form/PriceInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import { Button } from "@/components/ui/button";
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
import { formatSpecCell } from "@/lib/catalog/spec-display";
import type { CatalogAttribute, TaxonomyTreeNode } from "@/lib/catalog/types";
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
import Image from "next/image";
import { LuArchive, LuColumns3, LuPen } from "react-icons/lu";

const COLUMNS_STORAGE_KEY = "mtruck.admin.products.visibleColumns";

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
  featured: boolean;
  status: string;
  availability: string;
  description: string;
  image: string;
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
  nameFromDisplayGroup = false,
}: {
  tree: TaxonomyTreeNode[];
  selectedNodeId?: string;
  onFolderChange: (nodeId: string | null) => void;
  attributes: CatalogAttribute[];
  product?: AdminProductRow;
  nameFromDisplayGroup?: boolean;
}) {
  const t = useTranslations("Admin");
  const catalogT = useTranslations("CatalogAdmin");

  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <ProductFolderPicker
          tree={tree}
          selectedId={selectedNodeId}
          onNodeChange={onFolderChange}
        />
        <CatalogNativeSelect
          name="status"
          label={t("status")}
          defaultValue={product?.status ?? "PUBLISHED"}
        >
          <option value="DRAFT">{t("statusDraft")}</option>
          <option value="PUBLISHED">{t("statusPublished")}</option>
          <option value="RESERVED">{t("statusReserved")}</option>
          <option value="PREPARING">{t("statusPreparing")}</option>
          <option value="SOLD">{t("statusSold")}</option>
        </CatalogNativeSelect>
        <CatalogNativeSelect
          name="availability"
          label={t("availability")}
          defaultValue={product?.availability ?? "IN_STOCK"}
        >
          <option value="IN_STOCK">{t("availabilityStock")}</option>
          <option value="TRANSIT">{t("availabilityTransit")}</option>
        </CatalogNativeSelect>
        {nameFromDisplayGroup ? (
          <div className="grid gap-2">
            <p className="text-sm font-medium">{t("productName")}</p>
            <p className="text-sm text-muted-foreground">
              {catalogT("productNameFromDisplayGroup")}
            </p>
            {product?.name ? (
              <p className="rounded-sm border bg-muted/40 px-3 py-2 text-sm">
                {product.name}
              </p>
            ) : null}
            <input
              type="hidden"
              name="name"
              value={product?.name?.trim() || "Авто"}
            />
          </div>
        ) : (
          <FormInput
            type="text"
            name="name"
            label={t("productName")}
            defaultValue={product?.name ?? ""}
          />
        )}
        <input type="hidden" name="company" value={product?.company ?? ""} />
        <PriceInput defaultValue={product?.price} />
        {product ? (
          <div className="relative aspect-[4/3] max-w-xs overflow-hidden rounded-sm border bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="320px"
              className="object-cover"
            />
          </div>
        ) : null}
        <ImageGalleryInput required={!product} />
      </div>
      {attributes.length > 0 ? (
        <ProductSpecFields
          key={`${product?.id ?? "new"}-${selectedNodeId ?? "none"}`}
          attributes={attributes}
          initialValues={product ? specsToInitial(product.specs) : {}}
        />
      ) : selectedNodeId ? (
        <p className="text-sm text-muted-foreground">{catalogT("noOwnFields")}</p>
      ) : null}
      <TextAreaInput
        name="description"
        labelText={t("description")}
        defaultValue={product?.description ?? ""}
      />
      <CheckboxInput
        name="featured"
        label={t("featured")}
        defaultChecked={product?.featured ?? false}
      />
    </div>
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
  nameFromDisplayGroup = false,
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
  nameFromDisplayGroup?: boolean;
  canDelete?: boolean;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [columnsReady, setColumnsReady] = useState(false);

  const editProduct = useMemo(
    () => items.find((item) => item.id === editId) ?? null,
    [items, editId]
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

  function setCreateOpen(open: boolean) {
    if (open) {
      const node = selectedNodeId ? `&node=${selectedNodeId}` : "";
      router.replace(`/admin/products?create=1${node}`, { scroll: false });
      return;
    }
    router.replace("/admin/products", { scroll: false });
  }

  function setEditOpen(open: boolean, productId?: string) {
    if (open && productId) {
      const product = items.find((item) => item.id === productId);
      const node = product?.taxonomyNodeId
        ? `&node=${product.taxonomyNodeId}`
        : "";
      router.replace(`/admin/products?edit=${productId}${node}`, {
        scroll: false,
      });
      return;
    }
    router.replace("/admin/products", { scroll: false });
  }

  function onFolderChange(nodeId: string | null) {
    if (editProduct) {
      router.replace(
        nodeId
          ? `/admin/products?edit=${editProduct.id}&node=${nodeId}`
          : `/admin/products?edit=${editProduct.id}`,
        { scroll: false }
      );
      return;
    }
    router.replace(
      nodeId
        ? `/admin/products?create=1&node=${nodeId}`
        : "/admin/products?create=1",
      { scroll: false }
    );
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

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent>
          <div className="grid gap-6">
            <SheetHeader>
              <SheetTitle>{t("createSheetTitle")}</SheetTitle>
              <SheetDescription>{t("createSheetLede")}</SheetDescription>
            </SheetHeader>
            <FormContainer
              key={createOpen ? "create-open" : "create-closed"}
              action={createProductAction}
            >
              <div className="grid gap-6">
                <ProductSheetFields
                  tree={tree}
                  selectedNodeId={selectedNodeId}
                  onFolderChange={onFolderChange}
                  attributes={attributes}
                  nameFromDisplayGroup={nameFromDisplayGroup}
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
              <SheetDescription>{t("editSheetLede")}</SheetDescription>
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
                      selectedNodeId={selectedNodeId}
                      onFolderChange={onFolderChange}
                      attributes={attributes}
                      product={editProduct}
                      nameFromDisplayGroup={nameFromDisplayGroup}
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
