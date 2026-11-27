"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import AdminInfoTip from "@/components/admin/catalog/admin-info-tip";
import { CatalogMenuSelect } from "@/components/admin/catalog/catalog-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveRootFinancingAction } from "@/lib/finance/actions";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DEFAULT_FINANCING_FACTS,
  type FinancePreset,
  type FinancingFactVisibility,
} from "@/lib/finance/financing-quote";
import type { RootPricingDto } from "@/lib/finance/types";
import { numberInputClassName } from "@/lib/ui/number-input";
import { notify } from "@/lib/ui/notify";
import { useRouter } from "@/i18n/navigation";

const ALL_SCOPE = "ALL";

function serializeFinancing(
  scope: string,
  enabled: boolean,
  credit: FinancePreset,
  lease: FinancePreset,
  facts: FinancingFactVisibility
) {
  return JSON.stringify({ scope, enabled, credit, lease, facts });
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [text, setText] = useState(String(value));
  return (
    <div className="grid min-w-0 gap-2">
      <Label className="min-w-0">{label}</Label>
      <Input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={text}
        className={numberInputClassName}
        onChange={(event) => {
          const next = event.target.value.replace(",", ".");
          if (next !== "" && !/^\d*\.?\d*$/.test(next)) return;
          setText(next);
          if (next === "" || next === ".") return;
          const parsed = Number(next);
          if (Number.isFinite(parsed)) onChange(parsed);
        }}
      />
    </div>
  );
}

function PresetFields({
  title,
  preset,
  onChange,
  residualLabel,
}: {
  title: string;
  preset: FinancePreset;
  onChange: (preset: FinancePreset) => void;
  residualLabel?: string;
}) {
  const t = useTranslations("FinanceAdmin");
  function patch(partial: Partial<FinancePreset>) {
    onChange({ ...preset, ...partial });
  }
  return (
    <section className="grid min-w-0 gap-5 rounded-sm border border-border p-4 sm:p-5">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
        <NumberField
          label={t("financingAnnualRate")}
          value={preset.annualRatePercent}
          onChange={(annualRatePercent) => patch({ annualRatePercent })}
        />
        {residualLabel ? (
          <NumberField
            label={residualLabel}
            value={preset.residualPercent ?? 0}
            onChange={(residualPercent) => patch({ residualPercent })}
          />
        ) : null}
      </div>
      <div className="grid min-w-0 gap-3">
        <p className="text-sm font-medium text-foreground">
          {t("financingTermGroup")}
        </p>
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
          <NumberField
            label={t("financingRangeFrom")}
            value={preset.termMonthsMin}
            onChange={(termMonthsMin) => patch({ termMonthsMin })}
          />
          <NumberField
            label={t("financingRangeDefault")}
            value={preset.termMonthsDefault}
            onChange={(termMonthsDefault) => patch({ termMonthsDefault })}
          />
          <NumberField
            label={t("financingRangeTo")}
            value={preset.termMonthsMax}
            onChange={(termMonthsMax) => patch({ termMonthsMax })}
          />
          <NumberField
            label={t("financingRangeStep")}
            value={preset.termMonthsStep}
            onChange={(termMonthsStep) => patch({ termMonthsStep })}
          />
        </div>
      </div>
      <div className="grid min-w-0 gap-3">
        <p className="text-sm font-medium text-foreground">
          {t("financingDownGroup")}
        </p>
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
          <NumberField
            label={t("financingRangeFrom")}
            value={preset.downPaymentPercentMin}
            onChange={(downPaymentPercentMin) =>
              patch({ downPaymentPercentMin })
            }
          />
          <NumberField
            label={t("financingRangeDefault")}
            value={preset.downPaymentPercentDefault}
            onChange={(downPaymentPercentDefault) =>
              patch({ downPaymentPercentDefault })
            }
          />
          <NumberField
            label={t("financingRangeTo")}
            value={preset.downPaymentPercentMax}
            onChange={(downPaymentPercentMax) =>
              patch({ downPaymentPercentMax })
            }
          />
          <NumberField
            label={t("financingRangeStep")}
            value={preset.downPaymentPercentStep}
            onChange={(downPaymentPercentStep) =>
              patch({ downPaymentPercentStep })
            }
          />
        </div>
      </div>
    </section>
  );
}

export default function FinanceFinancingView({
  roots,
  pricingByRoot,
  initialScope,
}: {
  roots: { id: string; name: string }[];
  pricingByRoot: Record<string, RootPricingDto>;
  initialScope: string;
}) {
  const t = useTranslations("FinanceAdmin");
  const router = useRouter();
  const [, startTransition] = useTransition();
  const initial = pricingByRoot[initialScope];
  const [scope, setScope] = useState(initialScope);
  const [enabled, setEnabled] = useState(initial?.financingEnabled ?? true);
  const [credit, setCredit] = useState(initial?.credit);
  const [lease, setLease] = useState(initial?.lease);
  const [facts, setFacts] = useState<FinancingFactVisibility>(
    initial?.financingFacts ?? DEFAULT_FINANCING_FACTS
  );
  const hydrating = useRef(true);
  const lastSaved = useRef("");
  const saveChain = useRef(Promise.resolve());

  const scopeOptions = useMemo(
    () => [
      { value: ALL_SCOPE, label: t("pricingScopeAll") },
      ...roots.map((root) => ({ value: root.id, label: root.name })),
    ],
    [roots, t]
  );

  useEffect(() => {
    hydrating.current = true;
    if (scope === ALL_SCOPE) return;
    const next = pricingByRoot[scope];
    if (!next) return;
    setEnabled(next.financingEnabled);
    setCredit(next.credit);
    setLease(next.lease);
    setFacts(next.financingFacts ?? DEFAULT_FINANCING_FACTS);
  }, [scope, pricingByRoot]);

  useEffect(() => {
    if (!credit || !lease) return;
    const snapshot = serializeFinancing(scope, enabled, credit, lease, facts);
    if (hydrating.current) {
      hydrating.current = false;
      lastSaved.current = snapshot;
      return;
    }
    if (snapshot === lastSaved.current) return;
    const handle = window.setTimeout(() => {
      const formData = new FormData();
      formData.set("taxonomyNodeId", scope);
      formData.set("financingEnabled", enabled ? "true" : "false");
      formData.set("financingShowDown", facts.down ? "true" : "false");
      formData.set("financingShowResidual", facts.residual ? "true" : "false");
      formData.set("financingShowTotal", facts.total ? "true" : "false");
      formData.set("financingShowRate", facts.rate ? "true" : "false");
      const write = (prefix: string, preset: FinancePreset) => {
        formData.set(`${prefix}AnnualRatePercent`, String(preset.annualRatePercent));
        formData.set(`${prefix}TermMonthsMin`, String(preset.termMonthsMin));
        formData.set(`${prefix}TermMonthsMax`, String(preset.termMonthsMax));
        formData.set(`${prefix}TermMonthsDefault`, String(preset.termMonthsDefault));
        formData.set(`${prefix}TermMonthsStep`, String(preset.termMonthsStep));
        formData.set(
          `${prefix}DownPaymentPercentMin`,
          String(preset.downPaymentPercentMin)
        );
        formData.set(
          `${prefix}DownPaymentPercentMax`,
          String(preset.downPaymentPercentMax)
        );
        formData.set(
          `${prefix}DownPaymentPercentDefault`,
          String(preset.downPaymentPercentDefault)
        );
        formData.set(
          `${prefix}DownPaymentPercentStep`,
          String(preset.downPaymentPercentStep)
        );
        if (preset.residualPercent != null) {
          formData.set(`${prefix}ResidualPercent`, String(preset.residualPercent));
        }
      };
      write("credit", credit);
      write("lease", lease);
      saveChain.current = saveChain.current
        .catch(() => undefined)
        .then(async () => {
          if (
            serializeFinancing(scope, enabled, credit, lease, facts) !== snapshot
          )
            return;
          try {
            const result = await saveRootFinancingAction(null, formData);
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
    }, 400);
    return () => window.clearTimeout(handle);
  }, [scope, enabled, credit, lease, facts, router, startTransition, t]);

  if (roots.length === 0 || !credit || !lease) {
    return (
      <p className="text-sm text-muted-foreground">{t("pricingNoRoots")}</p>
    );
  }

  return (
    <div className="grid min-w-0 gap-6 sm:gap-8">
      <div className="grid w-full min-w-0 gap-2 sm:max-w-md">
        <div className="flex min-w-0 items-center gap-1.5">
          <Label>{t("pricingScope")}</Label>
          <AdminInfoTip label={t("helpLabel")} size="sm">
            <p>{t("helpFinancingScope")}</p>
          </AdminInfoTip>
        </div>
        <CatalogMenuSelect
          name="financingScope"
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

      <section className="grid min-w-0 gap-4 rounded-sm border border-border p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">
              {t("financingEnabledTitle")}
            </h3>
            <AdminInfoTip label={t("helpLabel")} size="sm">
              <p>{t("helpFinancingEnabled")}</p>
            </AdminInfoTip>
          </div>
          <label className="flex shrink-0 items-center gap-2 text-sm text-foreground">
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              aria-label={t("financingEnabled")}
            />
            <span>{enabled ? t("financingOn") : t("financingOff")}</span>
          </label>
        </div>
        <p className="text-sm text-muted-foreground">{t("financingHint")}</p>
      </section>

      <section className="grid min-w-0 gap-4 rounded-sm border border-border p-4 sm:p-5">
        <div className="grid gap-1">
          <h3 className="text-sm font-semibold tracking-tight">
            {t("financingFactsTitle")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("financingFactsHint")}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["down", "financingShowDown"],
              ["residual", "financingShowResidual"],
              ["total", "financingShowTotal"],
              ["rate", "financingShowRate"],
            ] as const
          ).map(([key, labelKey]) => (
            <label key={key} className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={facts[key]}
                onCheckedChange={(checked) =>
                  setFacts((current) => ({ ...current, [key]: checked === true }))
                }
                aria-label={t(labelKey)}
              />
              <span>{t(labelKey)}</span>
            </label>
          ))}
        </div>
      </section>

      {enabled ? (
        <>
          <PresetFields
            key={`${scope}-credit`}
            title={t("financingCreditTitle")}
            preset={credit}
            onChange={setCredit}
          />
          <PresetFields
            key={`${scope}-lease`}
            title={t("financingLeaseTitle")}
            preset={lease}
            onChange={setLease}
            residualLabel={t("financingResidualPercent")}
          />
        </>
      ) : null}
    </div>
  );
}
