"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import EmptyList from "@/components/global/EmptyList";
import ProductFolderPicker from "@/components/admin/catalog/product-folder-picker";
import ProductSpecFields from "@/components/admin/catalog/product-spec-fields";
import { CatalogNativeSelect } from "@/components/admin/catalog/catalog-fields";
import SheetFormActions from "@/components/admin/sheet-form-actions";
import { IconButton, SubmitButton } from "@/components/form/Buttons";
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
} from "@/components/ui/table";
import type { CatalogAttribute, TaxonomyTreeNode } from "@/lib/catalog/types";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/utils/actions";
import { formatCurrency } from "@/utils/format";
import type { actionFunction } from "@/utils/types";
import AdminListToolbar, {
  AdminFilterTrigger,
} from "@/components/admin/admin-list-toolbar";
import Image from "next/image";
import { LuPen } from "react-icons/lu";

export type AdminProductSpec = {
  attributeId: string;
  optionId: string | null;
  numberValue: number | null;
  textValue: string | null;
  booleanValue: boolean | null;
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

function DeleteProduct({ productId }: { productId: string }) {
  const deleteProduct = deleteProductAction.bind(null, {
    productId,
  }) as unknown as actionFunction;
  return (
    <FormContainer action={deleteProduct}>
      <IconButton actionType="delete" />
    </FormContainer>
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

function ProductSheetFields({
  tree,
  selectedNodeId,
  onFolderChange,
  attributes,
  product,
}: {
  tree: TaxonomyTreeNode[];
  selectedNodeId?: string;
  onFolderChange: (nodeId: string | null) => void;
  attributes: CatalogAttribute[];
  product?: AdminProductRow;
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
        <FormInput
          type="text"
          name="name"
          label={t("productName")}
          defaultValue={product?.name ?? ""}
        />
        <FormInput
          type="text"
          name="company"
          label={t("company")}
          defaultValue={product?.company ?? ""}
        />
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
  locale,
  tree,
  attributes,
  createOpen,
  editId,
  selectedNodeId,
}: {
  items: AdminProductRow[];
  locale: string;
  tree: TaxonomyTreeNode[];
  attributes: CatalogAttribute[];
  createOpen: boolean;
  editId?: string;
  selectedNodeId?: string;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const editProduct = useMemo(
    () => items.find((item) => item.id === editId) ?? null,
    [items, editId]
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
        const hay = `${item.name} ${item.company}`.toLowerCase();
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

  const deleteProduct =
    editProduct != null
      ? (deleteProductAction.bind(null, {
          productId: editProduct.id,
        }) as unknown as actionFunction)
      : undefined;

  return (
    <section className="grid min-w-0 gap-6">
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        createLabel={t("createProduct")}
        onCreate={() => setCreateOpen(true)}
        filterSheet={
          <Sheet>
            <SheetTrigger asChild>
              <AdminFilterTrigger
                label={t("filter")}
                count={activeFilterCount}
              />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-full flex-col gap-6 sm:max-w-sm"
            >
              <SheetHeader className="text-left">
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

      <p className="text-sm text-muted-foreground">
        {t("totalProducts", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <EmptyList />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("productName")}</TableHead>
                  <TableHead>{t("company")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("price")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/products/${item.id}`}
                        className="tracking-wide text-muted-foreground underline capitalize"
                      >
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell>{item.company}</TableCell>
                    <TableCell>
                      {t(
                        STATUS_LABEL[
                          item.status as keyof typeof STATUS_LABEL
                        ] ?? "statusPublished"
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(item.price, locale)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
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
                        <DeleteProduct productId={item.id} />
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
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg"
        >
          <div className="grid gap-6 p-6">
            <SheetHeader className="text-left">
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
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg"
        >
          <div className="grid gap-6 p-6">
            <SheetHeader className="text-left">
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
                    />
                    <SheetFormActions
                      saveLabel={t("submitUpdate")}
                      deleteFormId="delete-product-form"
                    />
                  </div>
                </FormContainer>
                {deleteProduct ? (
                  <FormContainer
                    id="delete-product-form"
                    className="hidden"
                    action={deleteProduct}
                  >
                    <input type="hidden" name="productId" value={editProduct.id} />
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
