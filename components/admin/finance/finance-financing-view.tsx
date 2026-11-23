"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import AdminInfoTip from "@/components/admin/catalog/admin-info-tip";
import { CatalogMenuSelect } from "@/components/admin/catalog/catalog-fields";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { setRootFinancingEnabledAction } from "@/lib/finance/actions";
import type { RootPricingDto } from "@/lib/finance/types";
import { notify } from "@/lib/ui/notify";
import { useRouter } from "@/i18n/navigation";

const ALL_SCOPE = "ALL";

function enabledForScope(
  scope: string,
  roots: { id: string }[],
  pricingByRoot: Record<string, RootPricingDto>
) {
  if (scope === ALL_SCOPE) {
    const values = roots.map(
      (root) => pricingByRoot[root.id]?.financingEnabled ?? true
    );
    return values.length > 0 && values.every(Boolean);
  }
  return pricingByRoot[scope]?.financingEnabled ?? true;
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
  const [scope, setScope] = useState(initialScope);
  const [enabled, setEnabled] = useState(() =>
    enabledForScope(initialScope, roots, pricingByRoot)
  );
  const lastSaved = useRef(`${initialScope}:${enabled}`);
  const saveChain = useRef(Promise.resolve());
  const pendingScope = useRef(scope);

  const scopeOptions = useMemo(
    () => [
      { value: ALL_SCOPE, label: t("pricingScopeAll") },
      ...roots.map((root) => ({ value: root.id, label: root.name })),
    ],
    [roots, t]
  );

  function applyScope(nextScope: string) {
    pendingScope.current = nextScope;
    setScope(nextScope);
    const nextEnabled = enabledForScope(nextScope, roots, pricingByRoot);
    setEnabled(nextEnabled);
    lastSaved.current = `${nextScope}:${nextEnabled}`;
  }

  function persistEnabled(nextEnabled: boolean) {
    const activeScope = pendingScope.current;
    const snapshot = `${activeScope}:${nextEnabled}`;
    setEnabled(nextEnabled);
    if (snapshot === lastSaved.current) return;

    const formData = new FormData();
    formData.set("taxonomyNodeId", activeScope);
    formData.set("financingEnabled", nextEnabled ? "true" : "false");

    saveChain.current = saveChain.current
      .catch(() => undefined)
      .then(async () => {
        if (`${pendingScope.current}:${nextEnabled}` !== snapshot) return;
        try {
          const result = await setRootFinancingEnabledAction(null, formData);
          if (result.ok) {
            lastSaved.current = snapshot;
            notify.success(t("toastSaved"));
            router.refresh();
            return;
          }
          notify.error(
            t(`error${result.error ?? "SAVE_FAILED"}` as "errorSAVE_FAILED")
          );
          const back = lastSaved.current.endsWith(":true");
          setEnabled(back);
        } catch {
          notify.error(t("errorSAVE_FAILED"));
          const back = lastSaved.current.endsWith(":true");
          setEnabled(back);
        }
      });

    startTransition(async () => {
      await saveChain.current;
    });
  }

  if (roots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("pricingNoRoots")}</p>
    );
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-2 sm:max-w-md">
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
          onValueChange={applyScope}
          options={scopeOptions}
          emptyLabel="—"
        />
      </div>

      <section className="grid gap-4 rounded-sm border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">
              {t("financingEnabledTitle")}
            </h3>
            <AdminInfoTip label={t("helpLabel")} size="sm">
              <p>{t("helpFinancingEnabled")}</p>
            </AdminInfoTip>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Switch
              checked={enabled}
              onCheckedChange={persistEnabled}
              aria-label={t("financingEnabled")}
            />
            <span>{enabled ? t("financingOn") : t("financingOff")}</span>
          </label>
        </div>
        <p className="text-sm text-muted-foreground">{t("financingHint")}</p>
      </section>
    </div>
  );
}
