"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { CatalogAttribute } from "@/lib/catalog/types";
import SearchableEntityPicker from "@/components/admin/searchable-entity-picker";
import { packSheetAttributes } from "@/lib/catalog/sheet-layout";
import { specInputName, sortSheetAttributes } from "@/lib/catalog/spec-fields";
import type { SheetWidthName } from "@/lib/catalog/types";
import {
  blurNumberInputOnWheel,
  numberInputClassName,
} from "@/lib/ui/number-input";
import { cn } from "@/lib/utils";

/** Literals must live under components/ so Tailwind JIT emits col-span utilities. */
function sheetWidthClass(width: SheetWidthName | undefined) {
  switch (width) {
    case "HALF":
      return "col-span-3";
    case "THIRD":
      return "col-span-2";
    default:
      return "col-span-6";
  }
}

export default function ProductSpecFields({
  attributes,
  initialValues = {},
  onValuesChange,
  showHeading = true,
}: {
  attributes: CatalogAttribute[];
  initialValues?: Record<string, string>;
  onValuesChange?: (values: Record<string, string>) => void;
  showHeading?: boolean;
}) {
  const t = useTranslations("CatalogAdmin");
  const ordered = useMemo(() => sortSheetAttributes(attributes), [attributes]);
  const layout = useMemo(() => packSheetAttributes(ordered), [ordered]);
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  function setValue(attributeId: string, value: string, dependents: string[]) {
    const cleaned = { ...values, [attributeId]: value };
    for (const id of dependents) {
      delete cleaned[id];
    }
    setValues(cleaned);
    onValuesChange?.(cleaned);
  }

  function descendantIds(attributeId: string) {
    const ids: string[] = [];
    const walk = (id: string) => {
      for (const child of ordered) {
        if (child.dependsOnAttributeId === id) {
          ids.push(child.id);
          walk(child.id);
        }
      }
    };
    walk(attributeId);
    return ids;
  }

  if (ordered.length === 0) return null;

  return (
    <div className="grid gap-4">
      {showHeading ? (
        <p className="font-medium">{t("productSpecs")}</p>
      ) : null}
      <div className="grid grid-cols-6 gap-6">
        {layout.map(({ attribute }) => {
          const className = sheetWidthClass(attribute.sheetWidth);
          const label = attribute.unit
            ? `${attribute.name}, ${attribute.unit}`
            : attribute.name;
          if (attribute.type === "SELECT") {
            const parentValue = attribute.dependsOnAttributeId
              ? values[attribute.dependsOnAttributeId]
              : undefined;
            const options = attribute.dependsOnAttributeId
              ? attribute.options.filter(
                  (option) => option.parentOptionId === parentValue
                )
              : attribute.options.filter((option) => !option.parentOptionId);
            const disabled = Boolean(
              attribute.dependsOnAttributeId && !parentValue
            );
            return (
              <div key={attribute.id} className={className}>
                <SearchableEntityPicker
                  name={specInputName("option", attribute.id)}
                  label={label}
                  placeholder={disabled ? t("dependsOn") : "—"}
                  searchPlaceholder={label}
                  emptyLabel="—"
                  options={options.map((option) => ({
                    value: option.id,
                    label: option.label,
                    keywords: [option.label, option.slug],
                  }))}
                  value={values[attribute.id] ?? ""}
                  onValueChange={(next) =>
                    setValue(
                      attribute.id,
                      next,
                      descendantIds(attribute.id)
                    )
                  }
                  required={attribute.isRequired && !disabled}
                  allowClear={!attribute.isRequired}
                  clearLabel="—"
                  disabled={disabled}
                  searchable={options.length >= 10}
                />
              </div>
            );
          }
          if (attribute.type === "BOOLEAN") {
            const checked = values[attribute.id] === "true";
            return (
              <div key={attribute.id} className={cn("grid gap-2", className)}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={specInputName("bool", attribute.id)}
                    value="true"
                    checked={checked}
                    onChange={(event) =>
                      setValue(
                        attribute.id,
                        event.target.checked ? "true" : "false",
                        []
                      )
                    }
                    className="h-4 w-4 shrink-0 rounded-sm border border-primary accent-primary"
                  />
                  {label}
                </label>
              </div>
            );
          }
          if (attribute.type === "TEXT") {
            return (
              <div key={attribute.id} className={cn("grid gap-2", className)}>
                <Label htmlFor={specInputName("text", attribute.id)}>
                  {label}
                </Label>
                <Input
                  id={specInputName("text", attribute.id)}
                  name={specInputName("text", attribute.id)}
                  required={attribute.isRequired}
                  value={values[attribute.id] ?? ""}
                  onChange={(event) =>
                    setValue(attribute.id, event.target.value, [])
                  }
                />
              </div>
            );
          }
          return (
            <div key={attribute.id} className={cn("grid gap-2", className)}>
              <Label htmlFor={specInputName("number", attribute.id)}>
                {label}
              </Label>
              <Input
                id={specInputName("number", attribute.id)}
                name={specInputName("number", attribute.id)}
                type="number"
                required={attribute.isRequired}
                min={attribute.type === "YEAR" ? 1970 : 0}
                max={attribute.type === "YEAR" ? 2100 : undefined}
                step={attribute.type === "YEAR" ? 1 : undefined}
                value={values[attribute.id] ?? ""}
                onChange={(event) =>
                  setValue(attribute.id, event.target.value, [])
                }
                className={numberInputClassName}
                onWheel={blurNumberInputOnWheel}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
