"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { CatalogAttribute } from "@/lib/catalog/types";
import { specInputName, sortByDependency } from "@/lib/catalog/spec-fields";
import {
  CatalogFlag,
  catalogSelectClassName,
} from "@/components/admin/catalog/catalog-fields";

export default function ProductSpecFields({
  attributes,
}: {
  attributes: CatalogAttribute[];
}) {
  const t = useTranslations("CatalogAdmin");
  const ordered = useMemo(() => sortByDependency(attributes), [attributes]);
  const [values, setValues] = useState<Record<string, string>>({});

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
      <div className="grid gap-4 md:grid-cols-2">
        {ordered.map((attribute) => {
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
              <div key={attribute.id} className="grid gap-2">
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
              <CatalogFlag
                key={attribute.id}
                name={specInputName("bool", attribute.id)}
                label={label}
              />
            );
          }
          if (attribute.type === "TEXT") {
            return (
              <div key={attribute.id} className="grid gap-2">
                <Label htmlFor={specInputName("text", attribute.id)}>
                  {label}
                </Label>
                <Input
                  id={specInputName("text", attribute.id)}
                  name={specInputName("text", attribute.id)}
                  required={attribute.isRequired}
                />
              </div>
            );
          }
          return (
            <div key={attribute.id} className="grid gap-2">
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
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
