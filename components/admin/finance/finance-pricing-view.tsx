"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import AdminInfoTip from "@/components/admin/catalog/admin-info-tip";
import { CatalogMenuSelect } from "@/components/admin/catalog/catalog-fields";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { upsertRootPricingAction } from "@/lib/finance/actions";
import type { RootPricingDto } from "@/lib/finance/types";
import { numberInputClassName } from "@/lib/ui/number-input";
import { notify } from "@/lib/ui/notify";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";

function serializePricing(draft: RootPricingDto, vatText: string, scope: string) {
  return JSON.stringify({
    scope,
    vatEnabled: draft.vatEnabled,
    entryMode: draft.entryMode,
    storefrontPriceMode: draft.storefrontPriceMode,
    vatText,
    displayMode: draft.displayMode,
    mainCurrencyCode: draft.mainCurrencyCode,
    vatDisplayCurrencyCode: draft.vatDisplayCurrencyCode,
    allowBuyerCurrencySwitch: draft.allowBuyerCurrencySwitch,
    extraCurrencyCodes: [...draft.extraCurrencyCodes].sort(),
  });
}

const ALL_SCOPE = "ALL";

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

export default function FinancePricingView({
  roots,
  pricingByRoot,
  currencyOptions,
  initialScope,
  initialPricing,
}: {
  roots: { id: string; name: string }[];
  pricingByRoot: Record<string, RootPricingDto>;
  currencyOptions: { value: string; label: string }[];
  initialScope: string;
  initialPricing: RootPricingDto;
}) {
  const t = useTranslations("FinanceAdmin");
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [scope, setScope] = useState(initialScope);
  const [draft, setDraft] = useState<RootPricingDto>(initialPricing);
  const [vatText, setVatText] = useState(() => String(initialPricing.vatPercent));
  const hydrating = useRef(true);
  const lastSaved = useRef(
    serializePricing(initialPricing, String(initialPricing.vatPercent), initialScope)
  );
  const saveChain = useRef(Promise.resolve());

  // Sync draft only when the user changes scope — not after router.refresh(),
  // otherwise autosave + new pricingByRoot identity loops forever.
  useEffect(() => {
    hydrating.current = true;
    if (scope === ALL_SCOPE) {
      setDraft((prev) => {
        const next = { ...prev, taxonomyNodeId: ALL_SCOPE };
        lastSaved.current = serializePricing(next, String(prev.vatPercent), scope);
        return next;
      });
      return;
    }
    const next = pricingByRoot[scope];
    if (next) {
      setDraft(next);
      setVatText(String(next.vatPercent));
      lastSaved.current = serializePricing(next, String(next.vatPercent), scope);
      return;
    }
    const fallback = {
      ...initialPricing,
      taxonomyNodeId: scope,
      storefrontPriceMode:
        initialPricing.storefrontPriceMode ??
        initialPricing.entryMode ??
        "INCL_VAT",
      mainCurrencyCode:
        initialPricing.mainCurrencyCode || currencyOptions[0]?.value || "USD",
    };
    setDraft(fallback);
    setVatText(String(initialPricing.vatPercent));
    lastSaved.current = serializePricing(
      fallback,
      String(initialPricing.vatPercent),
      scope
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: scope-only hydrate
  }, [scope]);

  useEffect(() => {
    if (hydrating.current) {
      hydrating.current = false;
      lastSaved.current = serializePricing(draft, vatText, scope);
      return;
    }
    const snapshot = serializePricing(draft, vatText, scope);
    if (snapshot === lastSaved.current) return;

    const vatRaw = vatText.trim().replace(",", ".");
    if (vatRaw === "." || (vatRaw !== "" && !/^\d*\.?\d*$/.test(vatRaw))) {
      return;
    }
    const vatPercent = vatRaw === "" ? 0 : Number(vatRaw);
    if (!Number.isFinite(vatPercent) || vatPercent < 0 || vatPercent > 100) {
      return;
    }

    const handle = window.setTimeout(() => {
      const formData = new FormData();
      formData.set("taxonomyNodeId", scope);
      formData.set("vatEnabled", draft.vatEnabled ? "true" : "false");
      formData.set("entryMode", draft.entryMode);
      formData.set(
        "storefrontPriceMode",
        draft.storefrontPriceMode ?? draft.entryMode
      );
      formData.set("vatPercent", String(vatPercent));
      formData.set("showPriceWithVat", "false");
      formData.set("showPriceWithoutVat", "false");
      formData.set("showVatAmount", "false");
      formData.set("displayMode", draft.displayMode);
      formData.set("mainCurrencyCode", draft.mainCurrencyCode);
      formData.set(
        "vatDisplayCurrencyCode",
        draft.vatDisplayCurrencyCode || draft.mainCurrencyCode
      );
      formData.set(
        "allowBuyerCurrencySwitch",
        draft.displayMode === "SINGLE" && draft.allowBuyerCurrencySwitch
          ? "true"
          : "false"
      );
      for (const code of draft.extraCurrencyCodes) {
        formData.append("extraCurrencyCodes", code);
      }

      saveChain.current = saveChain.current
        .catch(() => undefined)
        .then(async () => {
          const stillCurrent =
            serializePricing(draft, vatText, scope) === snapshot;
          if (!stillCurrent) return;
          try {
            const result = await upsertRootPricingAction(null, formData);
            if (result.ok) {
              lastSaved.current = snapshot;
              notify.success(t("toastSaved"));
              router.refresh();
              return;
            }
            notify.error(
              t(`error${result.error ?? "SAVE_FAILED"}` as "errorSAVE_FAILED")
            );
          } catch {
            notify.error(t("errorSAVE_FAILED"));
          }
        });
      startTransition(async () => {
        await saveChain.current;
      });
    }, 350);

    return () => window.clearTimeout(handle);
  }, [draft, vatText, scope, router, t]);

  const scopeOptions = useMemo(
    () => [
      { value: ALL_SCOPE, label: t("pricingScopeAll") },
      ...roots.map((root) => ({ value: root.id, label: root.name })),
    ],
    [roots, t]
  );

  const extraOptions = currencyOptions.filter(
    (option) => option.value !== draft.mainCurrencyCode
  );

  function toggleExtra(code: string, checked: boolean) {
    setDraft((prev) => {
      const set = new Set(prev.extraCurrencyCodes);
      if (checked) set.add(code);
      else set.delete(code);
      return { ...prev, extraCurrencyCodes: [...set] };
    });
  }

  if (roots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("pricingNoRoots")}</p>
    );
  }

  if (currencyOptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("pricingNeedsCurrency")}
      </p>
    );
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-2 sm:max-w-md">
        <TipLabel label={t("pricingScope")} tip={t("helpPricingScope")} />
        <CatalogMenuSelect
          name="scope"
          label={t("pricingScope")}
          hideLabel
          required
          allowClear={false}
          searchable={roots.length > 5}
          value={scope}
          onValueChange={setScope}
          options={scopeOptions}
          emptyLabel="—"
        />
      </div>

      <section className="grid gap-4 rounded-sm border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">
              {t("pricingEntryTitle")}
            </h3>
            <AdminInfoTip label={t("helpLabel")} size="sm">
              <p>{t("helpPricingEntry")}</p>
            </AdminInfoTip>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Switch
              checked={draft.vatEnabled}
              onCheckedChange={(checked) =>
                setDraft((prev) => ({ ...prev, vatEnabled: checked }))
              }
              aria-label={t("vatEnabled")}
            />
            <span>{t("vatEnabled")}</span>
          </label>
        </div>
        {draft.vatEnabled ? (
          <div className="grid max-w-md gap-4">
            <div className="grid gap-2">
              <Label>{t("pricingEntryMode")}</Label>
              <CatalogMenuSelect
                name="entryModeUi"
                label={t("pricingEntryMode")}
                hideLabel
                required
                allowClear={false}
                searchable={false}
                value={draft.entryMode}
                onValueChange={(next) =>
                  setDraft((prev) => ({
                    ...prev,
                    entryMode: next as RootPricingDto["entryMode"],
                  }))
                }
                options={[
                  { value: "INCL_VAT", label: t("entryInclVat") },
                  { value: "EXCL_VAT", label: t("entryExclVat") },
                ]}
                emptyLabel="—"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("storefrontPriceMode")}</Label>
              <CatalogMenuSelect
                name="storefrontPriceModeUi"
                label={t("storefrontPriceMode")}
                hideLabel
                required
                allowClear={false}
                searchable={false}
                value={draft.storefrontPriceMode}
                onValueChange={(next) =>
                  setDraft((prev) => ({
                    ...prev,
                    storefrontPriceMode:
                      next as RootPricingDto["storefrontPriceMode"],
                  }))
                }
                options={[
                  { value: "INCL_VAT", label: t("storefrontInclVat") },
                  { value: "EXCL_VAT", label: t("storefrontExclVat") },
                ]}
                emptyLabel="—"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vatPercent">{t("vatPercent")}</Label>
              <Input
                id="vatPercent"
                name="vatPercent"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={vatText}
                onChange={(event) => {
                  const next = event.target.value.replace(",", ".");
                  if (next === "" || /^\d*\.?\d*$/.test(next))
                    setVatText(next);
                }}
                className={cn(numberInputClassName)}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("vatDisplayCurrency")}</Label>
              <CatalogMenuSelect
                name="vatDisplayCurrencyUi"
                label={t("vatDisplayCurrency")}
                hideLabel
                required
                allowClear={false}
                searchable={currencyOptions.length > 5}
                value={
                  draft.vatDisplayCurrencyCode || draft.mainCurrencyCode
                }
                onValueChange={(next) =>
                  setDraft((prev) => ({
                    ...prev,
                    vatDisplayCurrencyCode: next,
                  }))
                }
                options={currencyOptions}
                emptyLabel="—"
              />
            </div>
          </div>
        ) : (
          <input type="hidden" name="vatPercent" value={vatText || "0"} />
        )}
      </section>

      <section className="grid gap-4 rounded-sm border border-border p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold tracking-tight">
            {t("pricingDisplayTitle")}
          </h3>
          <AdminInfoTip label={t("helpLabel")} size="sm">
            <p>{t("helpPricingDisplay")}</p>
          </AdminInfoTip>
        </div>
        <div className="grid gap-2 sm:max-w-md">
          <Label>{t("pricingDisplayMode")}</Label>
          <CatalogMenuSelect
            name="displayModeUi"
            label={t("pricingDisplayMode")}
            hideLabel
            required
            allowClear={false}
            searchable={false}
            value={draft.displayMode}
            onValueChange={(next) =>
              setDraft((prev) => ({
                ...prev,
                displayMode: next as RootPricingDto["displayMode"],
              }))
            }
            options={[
              { value: "SINGLE", label: t("displaySingle") },
              { value: "STACKED", label: t("displayStacked") },
            ]}
            emptyLabel="—"
          />
        </div>
        <div className="grid gap-2 sm:max-w-md">
          <Label>{t("pricingMainCurrency")}</Label>
          <CatalogMenuSelect
            name="mainCurrencyUi"
            label={t("pricingMainCurrency")}
            hideLabel
            required
            allowClear={false}
            searchable={currencyOptions.length > 5}
            value={draft.mainCurrencyCode}
            onValueChange={(next) =>
              setDraft((prev) => ({
                ...prev,
                mainCurrencyCode: next,
                extraCurrencyCodes: prev.extraCurrencyCodes.filter(
                  (code) => code !== next
                ),
              }))
            }
            options={currencyOptions}
            emptyLabel="—"
          />
        </div>

        {draft.displayMode === "SINGLE" ? (
          <div className="flex items-center justify-between gap-3">
            <TipLabel
              htmlFor="allowBuyerCurrencySwitch"
              label={t("allowBuyerSwitch")}
              tip={t("helpBuyerSwitch")}
            />
            <Switch
              id="allowBuyerCurrencySwitch"
              checked={draft.allowBuyerCurrencySwitch}
              onCheckedChange={(next) =>
                setDraft((prev) => ({
                  ...prev,
                  allowBuyerCurrencySwitch: next,
                }))
              }
            />
          </div>
        ) : (
          <div className="grid gap-3">
            <p className="text-sm font-medium">{t("pricingExtraCurrencies")}</p>
            {extraOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("pricingNoExtraCurrencies")}
              </p>
            ) : (
              extraOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 text-sm"
                >
                  <Checkbox
                    checked={draft.extraCurrencyCodes.includes(option.value)}
                    onCheckedChange={(checked) =>
                      toggleExtra(option.value, checked === true)
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))
            )}
          </div>
        )}
      </section>

    </div>
  );
}
