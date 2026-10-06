"use client";

import SearchableEntityPicker from "@/components/admin/searchable-entity-picker";
import { SheetDateField } from "@/components/form/sheet-date-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sheetScrollBodyClassName } from "@/lib/ui/sheet-field";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
export type SalesFilterDraft = {
  paid: "all" | "paid" | "unpaid";
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  kind: "all" | "CATALOG" | "REQUEST";
  vehicle: "all" | "with" | "without";
};

export const EMPTY_SALES_FILTER: SalesFilterDraft = {
  paid: "all",
  kind: "all",
  vehicle: "all",
};

export function countSalesFilter(draft: SalesFilterDraft): number {
  let count = 0;
  if (draft.paid !== "all") count += 1;
  if (draft.dateFrom || draft.dateTo) count += 1;
  if (draft.amountMin != null || draft.amountMax != null) count += 1;
  if (draft.kind !== "all") count += 1;
  if (draft.vehicle !== "all") count += 1;
  return count;
}

function dayStamp(iso: string): string {
  return iso.slice(0, 10);
}

export function orderMatchesSalesFilter(
  order: {
    isPaid: boolean;
    kind: "CATALOG" | "REQUEST";
    productId: string | null;
    orderTotal: number;
    createdAt: string;
  },
  filter: SalesFilterDraft
): boolean {
  if (filter.paid === "paid" && !order.isPaid) return false;
  if (filter.paid === "unpaid" && order.isPaid) return false;

  if (filter.kind !== "all" && order.kind !== filter.kind) return false;

  if (filter.vehicle === "with" && !order.productId) return false;
  if (filter.vehicle === "without" && order.productId) return false;

  const created = dayStamp(order.createdAt);
  if (filter.dateFrom && created < filter.dateFrom) return false;
  if (filter.dateTo && created > filter.dateTo) return false;

  if (filter.amountMin != null && order.orderTotal < filter.amountMin) {
    return false;
  }
  if (filter.amountMax != null && order.orderTotal > filter.amountMax) {
    return false;
  }

  return true;
}

export function salesFiltersEqual(
  a: SalesFilterDraft,
  b: SalesFilterDraft
): boolean {
  return (
    a.paid === b.paid &&
    a.kind === b.kind &&
    a.vehicle === b.vehicle &&
    (a.dateFrom ?? "") === (b.dateFrom ?? "") &&
    (a.dateTo ?? "") === (b.dateTo ?? "") &&
    (a.amountMin ?? null) === (b.amountMin ?? null) &&
    (a.amountMax ?? null) === (b.amountMax ?? null)
  );
}

function parseAmount(raw: string): number | undefined {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  return Number(digits);
}

export const SALES_FILTER_URL_KEYS = [
  "paid",
  "kind",
  "vehicle",
  "dateFrom",
  "dateTo",
  "amountMin",
  "amountMax",
] as const;

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function pick<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T
): T {
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function salesFilterFromParams(
  params: URLSearchParams
): SalesFilterDraft {
  const day = (key: string) => {
    const value = params.get(key);
    return value && DAY_RE.test(value) ? value : undefined;
  };
  return {
    paid: pick(params.get("paid"), ["all", "paid", "unpaid"], "all"),
    kind: pick(params.get("kind"), ["all", "CATALOG", "REQUEST"], "all"),
    vehicle: pick(params.get("vehicle"), ["all", "with", "without"], "all"),
    dateFrom: day("dateFrom"),
    dateTo: day("dateTo"),
    amountMin: parseAmount(params.get("amountMin") ?? ""),
    amountMax: parseAmount(params.get("amountMax") ?? ""),
  };
}

export function salesFilterToParams(
  draft: SalesFilterDraft
): Record<(typeof SALES_FILTER_URL_KEYS)[number], string | undefined> {
  return {
    paid: draft.paid === "all" ? undefined : draft.paid,
    kind: draft.kind === "all" ? undefined : draft.kind,
    vehicle: draft.vehicle === "all" ? undefined : draft.vehicle,
    dateFrom: draft.dateFrom,
    dateTo: draft.dateTo,
    amountMin: draft.amountMin == null ? undefined : String(draft.amountMin),
    amountMax: draft.amountMax == null ? undefined : String(draft.amountMax),
  };
}

export function SalesFilterFields({
  draft,
  onChange,
  onApply,
  onClear,
  isDirty,
  canClear,
}: {
  draft: SalesFilterDraft;
  onChange: (next: SalesFilterDraft) => void;
  onApply: () => void;
  onClear: () => void;
  isDirty: boolean;
  canClear: boolean;
}) {
  const t = useTranslations("Admin");

  const paidOptions = [
    { value: "all", label: t("filterPaymentAll"), keywords: [] as string[] },
    { value: "paid", label: t("paid"), keywords: [] },
    { value: "unpaid", label: t("unpaid"), keywords: [] },
  ];

  const kindOptions = [
    { value: "all", label: t("filterKindAll"), keywords: [] as string[] },
    { value: "CATALOG", label: t("filterKindCatalog"), keywords: [] },
    { value: "REQUEST", label: t("filterKindRequest"), keywords: [] },
  ];

  const vehicleOptions = [
    { value: "all", label: t("filterVehicleAll"), keywords: [] as string[] },
    { value: "with", label: t("filterVehicleWith"), keywords: [] },
    { value: "without", label: t("filterVehicleWithout"), keywords: [] },
  ];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6 overflow-hidden">
      <div className={cn(sheetScrollBodyClassName, "pr-1")}>
        <div className="grid gap-4">
          <SearchableEntityPicker
            name="sales-filter-paid"
            label={t("filterPayment")}
            placeholder={t("filterPaymentAll")}
            searchPlaceholder={t("filterPayment")}
            emptyLabel="—"
            options={paidOptions}
            value={draft.paid}
            onValueChange={(value) =>
              onChange({
                ...draft,
                paid: value as SalesFilterDraft["paid"],
              })
            }
            allowClear={false}
            searchable={false}
          />

          <div className="grid gap-2">
            <p className="text-sm font-medium">{t("filterPeriod")}</p>
            <div className="grid grid-cols-2 gap-2">
              <SheetDateField
                label={`${t("filterPeriod")} ${t("filterFrom")}`}
                hideLabel
                placeholder={t("filterFrom")}
                value={draft.dateFrom}
                onValueChange={(value) =>
                  onChange({
                    ...draft,
                    dateFrom: value,
                  })
                }
                clearLabel={t("filterFrom")}
              />
              <SheetDateField
                label={`${t("filterPeriod")} ${t("filterTo")}`}
                hideLabel
                placeholder={t("filterTo")}
                value={draft.dateTo}
                onValueChange={(value) =>
                  onChange({
                    ...draft,
                    dateTo: value,
                  })
                }
                clearLabel={t("filterTo")}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium">{t("filterAmount")}</p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                inputMode="numeric"
                value={draft.amountMin ?? ""}
                placeholder={t("filterFrom")}
                aria-label={`${t("filterAmount")} ${t("filterFrom")}`}
                className={cn(
                  "h-11",
                  draft.amountMin != null && "border-foreground/30"
                )}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    amountMin: parseAmount(event.target.value),
                  })
                }
              />
              <Input
                type="text"
                inputMode="numeric"
                value={draft.amountMax ?? ""}
                placeholder={t("filterTo")}
                aria-label={`${t("filterAmount")} ${t("filterTo")}`}
                className={cn(
                  "h-11",
                  draft.amountMax != null && "border-foreground/30"
                )}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    amountMax: parseAmount(event.target.value),
                  })
                }
              />
            </div>
          </div>

          <SearchableEntityPicker
            name="sales-filter-kind"
            label={t("filterKind")}
            placeholder={t("filterKindAll")}
            searchPlaceholder={t("filterKind")}
            emptyLabel="—"
            options={kindOptions}
            value={draft.kind}
            onValueChange={(value) =>
              onChange({
                ...draft,
                kind: value as SalesFilterDraft["kind"],
              })
            }
            allowClear={false}
            searchable={false}
          />

          <SearchableEntityPicker
            name="sales-filter-vehicle"
            label={t("filterVehicle")}
            placeholder={t("filterVehicleAll")}
            searchPlaceholder={t("filterVehicle")}
            emptyLabel="—"
            options={vehicleOptions}
            value={draft.vehicle}
            onValueChange={(value) =>
              onChange({
                ...draft,
                vehicle: value as SalesFilterDraft["vehicle"],
              })
            }
            allowClear={false}
            searchable={false}
          />
        </div>
      </div>

      <div className="mt-auto shrink-0 space-y-2 p-px">
        <Button
          type="button"
          variant={isDirty ? "default" : "outline"}
          className="h-11 w-full"
          disabled={!isDirty}
          onClick={onApply}
        >
          {t("filterApply")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          disabled={!canClear}
          onClick={onClear}
        >
          {t("clearFilters")}
        </Button>
      </div>
    </div>
  );
}
