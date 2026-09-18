"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { CatalogAttribute } from "@/lib/catalog/types";
import { packSheetAttributes } from "@/lib/catalog/sheet-layout";
import { specInputName, sortByDependency } from "@/lib/catalog/spec-fields";
import {
  CatalogFlag,
  catalogSelectClassName,
} from "@/components/admin/catalog/catalog-fields";
import { cn } from "@/lib/utils";

export default function ProductSpecFields({
  attributes,
  initialValues = {},
}: {
  attributes: CatalogAttribute[];
  initialValues?: Record<string, string>;
}) {
  const t = useTranslations("CatalogAdmin");
  const ordered = useMemo(() => sortByDependency(attributes), [attributes]);
  const layout = useMemo(() => packSheetAttributes(ordered), [ordered]);
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  function setValue(attributeId: string, value: string, dependents: string[]) {
    setValues((current) => {
      const next = { ...current, [attributeId]: value };
      for (const id of dependents) {
        delete next[id];
      }
      return next;
    });
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
      <p className="font-medium">{t("productSpecs")}</p>
      <div className="grid grid-cols-6 gap-6">
        {layout.map(({ attribute, className }) => {
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
              <div key={attribute.id} className={cn("grid gap-2", className)}>
                <Label htmlFor={specInputName("option", attribute.id)}>
                  {label}
                </Label>
                <select
                  id={specInputName("option", attribute.id)}
                  name={specInputName("option", attribute.id)}
                  required={attribute.isRequired}
                  disabled={disabled}
                  className={catalogSelectClassName}
                  value={values[attribute.id] ?? ""}
                  onChange={(event) =>
                    setValue(
                      attribute.id,
                      event.target.value,
                      descendantIds(attribute.id)
                    )
                  }
                >
                  <option value="">{disabled ? t("dependsOn") : ""}</option>
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }
          if (attribute.type === "BOOLEAN") {
            return (
              <div key={attribute.id} className={cn("grid gap-2", className)}>
                <CatalogFlag
                  name={specInputName("bool", attribute.id)}
                  label={label}
                  defaultChecked={initialValues[attribute.id] === "true"}
                />
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
                  defaultValue={initialValues[attribute.id] ?? ""}
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
                defaultValue={initialValues[attribute.id] ?? ""}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
