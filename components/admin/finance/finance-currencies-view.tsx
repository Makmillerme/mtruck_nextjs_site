"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { LuPencil, LuPlus } from "react-icons/lu";
import AdminInfoTip from "@/components/admin/catalog/admin-info-tip";
import { ConfirmDeleteIcon } from "@/components/form/ConfirmDelete";
import {
  createCurrencyAction,
  deleteCurrencyAction,
  updateCurrencyAction,
  updateFinanceSettingsAction,
} from "@/lib/finance/actions";
import type { actionFunction } from "@/utils/types";
import { notify } from "@/lib/ui/notify";
import { ISO_4217_CATALOG } from "@/lib/finance/iso-4217";
import { CatalogMenuSelect } from "@/components/admin/catalog/catalog-fields";
import SheetFormActions from "@/components/admin/sheet-form-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  blurNumberInputOnWheel,
  numberInputClassName,
} from "@/lib/ui/number-input";
import { cn } from "@/lib/utils";

export type FinanceCurrencyRow = {
  code: string;
  name: string;
  nameEn: string;
  isActive: boolean;
  isBuyerVisible: boolean;
  rateToBase: string | null;
  rateUpdatedAt: string | null;
  productCount: number;
};

export type FinanceSettingsRow = {
  baseCurrencyCode: string;
  siteCurrencyCode: string;
  allowBuyerCurrencySwitch: boolean;
};

type SheetMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; code: string };

const ERROR_KEYS = {
  VALIDATION: "errorVALIDATION",
  CURRENCY_DUPLICATE: "errorCURRENCY_DUPLICATE",
  UNKNOWN_ISO_CURRENCY: "errorUNKNOWN_ISO_CURRENCY",
  CURRENCY_NOT_FOUND: "errorCURRENCY_NOT_FOUND",
  CANNOT_DISABLE_PROTECTED_CURRENCY: "errorCANNOT_DISABLE_PROTECTED_CURRENCY",
  SITE_CURRENCY_MUST_BE_BUYER_VISIBLE: "errorSITE_CURRENCY_MUST_BE_BUYER_VISIBLE",
  CURRENCY_INACTIVE: "errorCURRENCY_INACTIVE",
  INVALID_RATE: "errorINVALID_RATE",
  SAVE_FAILED: "errorSAVE_FAILED",
} as const;

function formatStoredQuote(value: string) {
  if (!value.includes(".")) return value;
  return value.replace(/0+$/, "").replace(/\.$/, "");
}

function errorMessage(
  t: ReturnType<typeof useTranslations<"FinanceAdmin">>,
  code?: string
) {
  if (!code) return t("errorSaveFailed");
  const key = ERROR_KEYS[code as keyof typeof ERROR_KEYS];
  return key ? t(key) : t("errorSaveFailed");
}

function TipLabel({
  htmlFor,
  label,
  tip,
}: {
  htmlFor?: string;
  label: string;
  tip: string;
}) {
  const t = useTranslations("FinanceAdmin");
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      <AdminInfoTip label={t("helpLabel")} size="sm">
        <p>{tip}</p>
      </AdminInfoTip>
    </div>
  );
}

export default function FinanceCurrenciesView({
  currencies,
  settings,
}: {
  currencies: FinanceCurrencyRow[];
  settings: FinanceSettingsRow | null;
}) {
  const t = useTranslations("FinanceAdmin");
  const router = useRouter();
  const [settingsSaving, startSettingsSave] = useTransition();
  const [sheet, setSheet] = useState<SheetMode>({ type: "closed" });
  const [createState, createAction, createPending] = useActionState(
    createCurrencyAction,
    null
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateCurrencyAction,
    null
  );
  const existingCodes = useMemo(
    () => new Set(currencies.map((c) => c.code)),
    [currencies]
  );

  const addOptions = useMemo(
    () =>
      ISO_4217_CATALOG.filter((c) => !existingCodes.has(c.code)).map((c) => ({
        value: c.code,
        label: `${c.code} — ${c.name}`,
      })),
    [existingCodes]
  );

  const currencyOptions = useMemo(
    () =>
      currencies.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` })),
    [currencies]
  );

  const editing = sheet.type === "edit"
    ? currencies.find((c) => c.code === sheet.code)
    : null;

  const [isActive, setIsActive] = useState(true);
  const savedBase = settings?.baseCurrencyCode ?? "";
  const [allowSwitch, setAllowSwitch] = useState(
    settings?.allowBuyerCurrencySwitch ?? false
  );
  const [baseCode, setBaseCode] = useState(savedBase);
  const [createCode, setCreateCode] = useState("");
  const initialSettings = {
    base: savedBase,
    site: savedBase,
    allow: settings?.allowBuyerCurrencySwitch ?? false,
  };
  const lastConfirmed = useRef(initialSettings);
  const settingsDraft = useRef({ ...initialSettings });
  const settingsChain = useRef(Promise.resolve());

  useEffect(() => {
    if (sheet.type === "create") {
      setCreateCode("");
      setIsActive(true);
    } else if (sheet.type === "edit" && editing) {
      setIsActive(editing.isActive);
    }
  }, [sheet, editing]);

  useEffect(() => {
    const pending =
      settingsDraft.current.base !== lastConfirmed.current.base ||
      settingsDraft.current.site !== lastConfirmed.current.site ||
      settingsDraft.current.allow !== lastConfirmed.current.allow;
    if (pending) return;
    const allow = settings?.allowBuyerCurrencySwitch ?? false;
    setAllowSwitch(allow);
    setBaseCode(savedBase);
    settingsDraft.current = { base: savedBase, site: savedBase, allow };
    lastConfirmed.current = { base: savedBase, site: savedBase, allow };
  }, [savedBase, settings?.allowBuyerCurrencySwitch]);

  useEffect(() => {
    if (createState?.ok) {
      notify.success(t("toastSaved"));
      setSheet({ type: "closed" });
    } else if (createState && !createState.ok) {
      notify.error(errorMessage(t, createState.error));
    }
  }, [createState, t]);

  useEffect(() => {
    if (updateState?.ok) {
      notify.success(t("toastSaved"));
      setSheet({ type: "closed" });
    } else if (updateState && !updateState.ok) {
      notify.error(errorMessage(t, updateState.error));
    }
  }, [updateState, t]);

  function persistSettings(nextBase: string, nextSite: string, nextAllow: boolean) {
    const attempt = { base: nextBase, site: nextSite, allow: nextAllow };
    settingsDraft.current = attempt;
    setBaseCode(attempt.base);
    setAllowSwitch(attempt.allow);
    const confirmed = lastConfirmed.current;
    if (
      attempt.base === confirmed.base &&
      attempt.site === confirmed.site &&
      attempt.allow === confirmed.allow
    ) {
      return;
    }
    const formData = new FormData();
    formData.set("baseCurrencyCode", attempt.base);
    formData.set("siteCurrencyCode", attempt.site);
    formData.set(
      "allowBuyerCurrencySwitch",
      attempt.allow ? "true" : "false"
    );
    settingsChain.current = settingsChain.current
      .catch(() => undefined)
      .then(async () => {
        const stillCurrent = () =>
          settingsDraft.current.base === attempt.base &&
          settingsDraft.current.site === attempt.site &&
          settingsDraft.current.allow === attempt.allow;
        try {
          const result = await updateFinanceSettingsAction(null, formData);
          if (result.ok) {
            lastConfirmed.current = attempt;
            if (stillCurrent()) {
              notify.success(t("toastSaved"));
              router.refresh();
            }
            return;
          }
          if (stillCurrent()) {
            const back = lastConfirmed.current;
            settingsDraft.current = { ...back };
            setBaseCode(back.base);
            setAllowSwitch(back.allow);
            notify.error(errorMessage(t, result.error));
          }
        } catch {
          if (stillCurrent()) {
            const back = lastConfirmed.current;
            settingsDraft.current = { ...back };
            setBaseCode(back.base);
            setAllowSwitch(back.allow);
            notify.error(t("errorSaveFailed"));
          }
        }
      });
    startSettingsSave(async () => {
      await settingsChain.current;
    });
  }

  const rateSubject = sheet.type === "edit" ? (editing?.code ?? "") : createCode;
  const baseDirty = Boolean(savedBase) && baseCode !== savedBase;

  function rateHint(row: FinanceCurrencyRow) {
    if (row.code === baseCode) {
      return t("hintBase", { code: baseCode });
    }
    if (baseDirty || !row.rateToBase) {
      return t("rateNotSetToBase", { code: baseCode });
    }
    return t("hintRate", {
      base: baseCode,
      quote: formatStoredQuote(row.rateToBase),
      code: row.code,
    });
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {currencies.length === 0
              ? t("emptyCurrencies")
              : t("currenciesMeta", {
                  count: currencies.length,
                  base: 1,
                })}
          </p>
          <AdminInfoTip label={t("helpLabel")}>
            <p>{t("helpList1")}</p>
            <p>{t("helpList2")}</p>
            <p>{t("helpList3")}</p>
          </AdminInfoTip>
        </div>
        <Button
          type="button"
          className="gap-2"
          onClick={() => setSheet({ type: "create" })}
          disabled={addOptions.length === 0}
        >
          <LuPlus className="size-4" aria-hidden />
          {t("addCurrency")}
        </Button>
      </div>

      {currencies.length > 0 ? (
        <>
          <section className="grid gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">
                {t("baseCurrency")}
              </h3>
              <AdminInfoTip label={t("helpLabel")} size="sm">
                <p>{t("helpSectionMain")}</p>
              </AdminInfoTip>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <CatalogMenuSelect
                name="baseCurrencyCode"
                label={t("baseCurrency")}
                hideLabel
                required
                allowClear={false}
                searchable={false}
                value={baseCode}
                onValueChange={(next) => {
                  persistSettings(next, next, settingsDraft.current.allow);
                }}
                disabled={settingsSaving || !settings}
                options={currencyOptions}
                emptyLabel="—"
                className="min-w-0 flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={t("editCurrency")}
                disabled={!baseCode}
                onClick={() => setSheet({ type: "edit", code: baseCode })}
              >
                <LuPencil className="size-4" aria-hidden />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("hintBase", { code: baseCode })}
            </p>
          </section>

          <section className="grid gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">
                {t("sectionAdditional")}
              </h3>
              <AdminInfoTip label={t("helpLabel")} size="sm">
                <p>{t("helpSectionAdditional")}</p>
              </AdminInfoTip>
            </div>
            {currencies.some((row) => row.code !== baseCode) ? (
              <ul className="grid gap-3">
                {currencies
                  .filter((row) => row.code !== baseCode)
                  .map((row) => (
                    <li
                      key={row.code}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-sm border border-border px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="w-12 shrink-0 text-base font-semibold tracking-tight">
                          {row.code}
                        </span>
                        <div className="grid min-w-0 gap-0.5">
                          <p className="truncate text-sm font-semibold tracking-tight">
                            {row.name}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {rateHint(row)}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {!row.isActive ? (
                          <Badge variant="outline">{t("badgeInactive")}</Badge>
                        ) : null}
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={t("editCurrency")}
                          onClick={() =>
                            setSheet({ type: "edit", code: row.code })
                          }
                        >
                          <LuPencil className="size-4" aria-hidden />
                        </Button>
                        {row.productCount > 0 ? null : (
                          <ConfirmDeleteIcon
                            action={
                              deleteCurrencyAction as unknown as actionFunction
                            }
                            title={t("deleteCurrencyTitle", { code: row.code })}
                            description={t("deleteCurrencyDescription")}
                          >
                            <input type="hidden" name="code" value={row.code} />
                          </ConfirmDeleteIcon>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("emptyAdditional")}
              </p>
            )}
          </section>


        </>
      ) : null}

      <Sheet
        open={sheet.type !== "closed"}
        onOpenChange={(open) => {
          if (!open) setSheet({ type: "closed" });
        }}
      >
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>
              {sheet.type === "create" ? t("addCurrency") : t("editCurrency")}
            </SheetTitle>
            <SheetDescription>
              {sheet.type === "create"
                ? t("addCurrencyHint")
                : t("editCurrencyHint")}
            </SheetDescription>
          </SheetHeader>

          <form
            action={sheet.type === "create" ? createAction : updateAction}
            className="grid flex-1 content-start gap-4"
          >
            {sheet.type === "create" ? (
              <CatalogMenuSelect
                name="code"
                label={t("currencyCode")}
                required
                allowClear={false}
                searchable
                options={addOptions}
                emptyLabel="—"
                searchPlaceholder={t("searchCurrency")}
                onValueChange={setCreateCode}
              />
            ) : (
              <>
                <input type="hidden" name="code" value={editing?.code ?? ""} />
                <div className="grid gap-2">
                  <Label>{t("currencyCode")}</Label>
                  <p className="text-sm font-semibold tracking-tight">
                    {editing?.code} — {editing?.name}
                  </p>
                </div>
              </>
            )}

            <input
              type="hidden"
              name="isActive"
              value={isActive ? "true" : "false"}
            />
            <div className="flex items-center justify-between gap-3">
              <TipLabel
                htmlFor="isActive"
                label={t("fieldActive")}
                tip={t("helpActive")}
              />
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={editing?.code === baseCode || editing?.code === savedBase}
              />
            </div>

            <input type="hidden" name="isBuyerVisible" value="true" />

            {savedBase && rateSubject !== savedBase ? (
              <div className="flex min-w-0 items-center gap-2">
                <Label htmlFor="rateToBase" className="shrink-0">
                  {t("rateLeft", { base: savedBase })}
                </Label>
                <Input
                  key={rateSubject || "create"}
                  id="rateToBase"
                  name="rateToBase"
                  type="number"
                  min={0}
                  step="any"
                  defaultValue={
                    editing?.rateToBase
                      ? formatStoredQuote(editing.rateToBase)
                      : ""
                  }
                  placeholder={t("ratePlaceholder")}
                  className={cn(numberInputClassName, "min-w-0 flex-1")}
                  onWheel={blurNumberInputOnWheel}
                />
                <span className="shrink-0 text-sm font-medium">
                  {rateSubject || "…"}
                </span>
                <AdminInfoTip label={t("helpLabel")} size="sm">
                  <p>{t("helpRate")}</p>
                </AdminInfoTip>
              </div>
            ) : null}

            <SheetFooter className="mt-auto">
              <SheetFormActions
                saveLabel={
                  createPending || updatePending ? t("saving") : t("save")
                }
              />
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
