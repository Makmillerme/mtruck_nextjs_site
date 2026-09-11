"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import EmptyList from "@/components/global/EmptyList";
import ProductFolderPicker from "@/components/admin/catalog/product-folder-picker";
import ProductSpecFields from "@/components/admin/catalog/product-spec-fields";
import {
  CatalogNativeSelect,
} from "@/components/admin/catalog/catalog-fields";
import { IconButton, SubmitButton } from "@/components/form/Buttons";
import CheckboxInput from "@/components/form/CheckboxInput";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import ImageInput from "@/components/form/ImageInput";
import PriceInput from "@/components/form/PriceInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CatalogAttribute } from "@/lib/catalog/types";
import { createProductAction, deleteProductAction } from "@/utils/actions";
import { formatCurrency } from "@/utils/format";
import { LuListFilter, LuPlus, LuSearch } from "react-icons/lu";

export type AdminProductRow = {
  id: string;
  name: string;
  company: string;
  price: number;
  featured: boolean;
  status: string;
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
  const deleteProduct = deleteProductAction.bind(null, { productId });
  return (
    <FormContainer action={deleteProduct}>
      <IconButton actionType="delete" />
    </FormContainer>
  );
}

export default function AdminProductsView({
  items,
  locale,
  folders,
  attributes,
  createOpen,
  selectedNodeId,
  defaults,
}: {
  items: AdminProductRow[];
  locale: string;
  folders: { id: string; name: string; depth: number }[];
  attributes: CatalogAttribute[];
  createOpen: boolean;
  selectedNodeId?: string;
  defaults: {
    name: string;
    company: string;
    description: string;
  };
}) {
  const t = useTranslations("Admin");
  const catalogT = useTranslations("CatalogAdmin");
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);

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

  function onFolderChange(nodeId: string | null) {
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

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            placeholder={t("searchPlaceholder")}
            className="h-9 pl-9"
            onChange={(event) => setSearch(event.target.value)}
            aria-label={t("searchPlaceholder")}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="relative h-9 gap-2"
                aria-label={t("filter")}
              >
                <LuListFilter className="size-4" />
                <span className="hidden sm:inline">{t("filter")}</span>
                {activeFilterCount > 0 ? (
                  <Badge className="h-5 min-w-5 border-0 bg-primary-foreground px-1.5 text-primary hover:bg-primary-foreground">
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                  >
                    {t("clearFilters")}
                  </Button>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>

          <Button
            type="button"
            size="sm"
            className="h-9 gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <LuPlus className="size-4" />
            <span className="hidden sm:inline">{t("createProduct")}</span>
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {t("totalProducts", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <EmptyList />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableCaption>
                {t("totalProducts", { count: filtered.length })}
              </TableCaption>
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
                        <Link href={`/admin/products/${item.id}/edit`}>
                          <IconButton actionType="edit" />
                        </Link>
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
            <FormContainer key={createOpen ? "open" : "closed"} action={createProductAction}>
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <ProductFolderPicker
                    folders={folders}
                    selectedId={selectedNodeId}
                    onNodeChange={onFolderChange}
                  />
                  <CatalogNativeSelect
                    name="status"
                    label={t("status")}
                    defaultValue="PUBLISHED"
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
                    defaultValue="IN_STOCK"
                  >
                    <option value="IN_STOCK">{t("availabilityStock")}</option>
                    <option value="TRANSIT">{t("availabilityTransit")}</option>
                  </CatalogNativeSelect>
                  <FormInput
                    type="text"
                    name="name"
                    label={t("productName")}
                    defaultValue={defaults.name}
                  />
                  <FormInput
                    type="text"
                    name="company"
                    label={t("company")}
                    defaultValue={defaults.company}
                  />
                  <PriceInput />
                  <ImageInput />
                </div>
                {attributes.length > 0 ? (
                  <ProductSpecFields attributes={attributes} />
                ) : selectedNodeId ? (
                  <p className="text-sm text-muted-foreground">
                    {catalogT("noOwnFields")}
                  </p>
                ) : null}
                <TextAreaInput
                  name="description"
                  labelText={t("description")}
                  defaultValue={defaults.description}
                />
                <CheckboxInput name="featured" label={t("featured")} />
                <SubmitButton text={t("submitCreate")} className="w-fit" />
              </div>
            </FormContainer>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
