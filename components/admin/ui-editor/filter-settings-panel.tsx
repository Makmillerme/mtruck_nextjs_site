"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "@/i18n/navigation";
import type { HomeFinderSettingsRow } from "@/lib/home/home-finder-shared";
import { cn } from "@/lib/utils";
import { updateHomeFinderSettingsAction } from "@/utils/home-finder-actions";
import { Button } from "@/components/ui/button";

export type HomeFinderRootOption = {
  id: string;
  name: string;
  showInFilter: boolean;
  children: Array<{ id: string; name: string; showInFilter: boolean }>;
};

export default function FilterSettingsPanel({
  settings,
  roots,
}: {
  settings: HomeFinderSettingsRow;
  roots: HomeFinderRootOption[];
}) {
  const t = useTranslations("UiEditor");
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const [showRootsBlock, setShowRootsBlock] = useState(settings.showRootsBlock);
  const [selectedRootIds, setSelectedRootIds] = useState<string[]>(
    settings.rootIds.length > 0
      ? settings.rootIds
      : roots.map((root) => root.id)
  );
  const [defaultRootId, setDefaultRootId] = useState<string | null>(
    settings.defaultRootId
  );
  const [defaultChildId, setDefaultChildId] = useState<string | null>(
    settings.defaultChildId
  );

  const selectableRoots = useMemo(
    () => roots.filter((root) => selectedRootIds.includes(root.id)),
    [roots, selectedRootIds]
  );

  const defaultRootChildren = useMemo(() => {
    const rootId =
      defaultRootId && selectableRoots.some((root) => root.id === defaultRootId)
        ? defaultRootId
        : selectableRoots[0]?.id;
    return roots.find((root) => root.id === rootId)?.children ?? [];
  }, [defaultRootId, selectableRoots, roots]);

  function toggleRoot(rootId: string, next: boolean) {
    setSelectedRootIds((current) => {
      const set = new Set(current);
      if (next) set.add(rootId);
      else set.delete(rootId);
      const list = [...set];
      if (defaultRootId && !set.has(defaultRootId)) {
        setDefaultRootId(list[0] ?? null);
        setDefaultChildId(null);
      }
      return list;
    });
  }

  async function onSave() {
    setBusy(true);
    const rootIds =
      selectedRootIds.length === roots.length ? [] : selectedRootIds;
    const result = await updateHomeFinderSettingsAction({
      showRootsBlock,
      rootIds,
      defaultRootId:
        defaultRootId && selectedRootIds.includes(defaultRootId)
          ? defaultRootId
          : selectedRootIds[0] ?? null,
      defaultChildId:
        defaultChildId &&
        defaultRootChildren.some((child) => child.id === defaultChildId)
          ? defaultChildId
          : null,
    });
    setBusy(false);
    if (!result.ok) {
      toast({ variant: "destructive", description: result.message });
      return;
    }
    toast({ description: t("homeFinderSaved") });
    router.refresh();
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="grid gap-6 pt-6">
        <div className="grid gap-2">
          <h2 className="text-base font-semibold tracking-tight">
            {t("filterTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("filterLede")}</p>
        </div>

        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-sm border p-3",
            busy && "pointer-events-none opacity-60"
          )}
        >
          <Checkbox
            checked={showRootsBlock}
            disabled={busy}
            onCheckedChange={(value) => setShowRootsBlock(value === true)}
            className="mt-0.5"
          />
          <span className="grid min-w-0 gap-1">
            <span className="text-sm font-medium">{t("homeRootsToggle")}</span>
            <span className="text-xs text-muted-foreground">
              {t("homeRootsToggleHint")}
            </span>
          </span>
        </label>

        {showRootsBlock ? (
          <div className="grid gap-3">
            <div className="grid gap-1">
              <p className="text-sm font-medium">{t("homeRootsListTitle")}</p>
              <p className="text-xs text-muted-foreground">
                {t("homeRootsListLede")}
              </p>
            </div>
            {roots.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("homeNoRoots")}</p>
            ) : (
              <ul className="grid gap-2">
                {roots.map((root) => {
                  const checked = selectedRootIds.includes(root.id);
                  return (
                    <li key={root.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-sm border p-3",
                          busy && "pointer-events-none opacity-60"
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={busy}
                          onCheckedChange={(value) =>
                            toggleRoot(root.id, value === true)
                          }
                          className="mt-0.5"
                        />
                        <span className="grid min-w-0 gap-0.5">
                          <span className="text-sm font-medium">{root.name}</span>
                          {!root.showInFilter ? (
                            <span className="text-xs text-muted-foreground">
                              {t("homeRootHiddenInCatalog")}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>{t("homeDefaultRoot")}</Label>
            <Select
              value={defaultRootId ?? selectableRoots[0]?.id ?? ""}
              disabled={busy || selectableRoots.length === 0}
              onValueChange={(value) => {
                setDefaultRootId(value || null);
                setDefaultChildId(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("homeDefaultRootUnset")} />
              </SelectTrigger>
              <SelectContent>
                {selectableRoots.map((root) => (
                  <SelectItem key={root.id} value={root.id}>
                    {root.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>{t("homeDefaultChild")}</Label>
            <Select
              value={defaultChildId ?? "__none__"}
              disabled={busy || defaultRootChildren.length === 0}
              onValueChange={(value) =>
                setDefaultChildId(value === "__none__" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("homeDefaultChildUnset")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  {t("homeDefaultChildUnset")}
                </SelectItem>
                {defaultRootChildren.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                    {!child.showInFilter
                      ? ` (${t("homeChildHidden")})`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-sm border border-dashed p-3 text-xs text-muted-foreground">
          <p>{t("homeChildrenHint")}</p>
          <p className="mt-1">{t("homeFacetsHint")}</p>
        </div>

        <div className="flex justify-end">
          <Button type="button" disabled={busy} onClick={onSave}>
            {t("homeFinderSave")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
