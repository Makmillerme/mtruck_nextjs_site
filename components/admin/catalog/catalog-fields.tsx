"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { ReloadIcon } from "@radix-ui/react-icons";
import SearchableEntityPicker from "@/components/admin/searchable-entity-picker";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const catalogSelectClassName =
  "flex h-11 w-full rounded-sm border border-input bg-background px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function CatalogField({
  name,
  label,
  defaultValue,
  required = true,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}

export function CatalogSubmit({
  text,
  variant,
  size = "default",
  className,
}: {
  text: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const { pending } = useFormStatus();
  const t = useTranslations("Common");
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      className={className}
    >
      {pending ? (
        <>
          <ReloadIcon className="h-4 w-4 animate-spin" />
          {t("pleaseWait")}
        </>
      ) : (
        text
      )}
    </Button>
  );
}

export function CatalogFlag({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        className="h-4 w-4 shrink-0 rounded-sm border border-primary accent-primary"
      />
      {label}
    </label>
  );
}

/** @deprecated Prefer CatalogMenuSelect (sheet combobox canon). */
export function CatalogNativeSelect({
  name,
  label,
  defaultValue,
  children,
  className,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className={catalogSelectClassName}
      >
        {children}
      </select>
    </div>
  );
}

export type CatalogMenuOption = {
  value: string;
  label: string;
};

/**
 * Sheet field canon: same combobox chrome as SearchableEntityPicker
 * (outline Button h-11 + Popover + cmdk).
 */
export function CatalogMenuSelect({
  name,
  label,
  options,
  defaultValue,
  placeholder,
  searchPlaceholder,
  emptyLabel = "—",
  allowClear = false,
  clearLabel,
  className,
  hideLabel = false,
  required = false,
  searchable = false,
}: {
  name: string;
  label: string;
  options: CatalogMenuOption[];
  defaultValue?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  allowClear?: boolean;
  clearLabel?: string;
  className?: string;
  hideLabel?: boolean;
  required?: boolean;
  /** Default off — short sheet lists (status, currency). Opt-in for long lists. */
  searchable?: boolean;
}) {
  const hasDefault =
    defaultValue != null &&
    options.some((option) => option.value === defaultValue);
  const initial = hasDefault
    ? defaultValue!
    : allowClear
      ? (defaultValue ?? "")
      : (options[0]?.value ?? "");
  const [value, setValue] = useState(initial);

  return (
    <div className={cn(className)}>
      <SearchableEntityPicker
        name={name}
        label={label}
        options={options.map((option) => ({
          value: option.value,
          label: option.label,
          keywords: [option.label, option.value],
        }))}
        value={value}
        onValueChange={setValue}
        placeholder={placeholder ?? clearLabel ?? label}
        searchPlaceholder={searchPlaceholder ?? label}
        emptyLabel={emptyLabel}
        allowClear={allowClear}
        clearLabel={clearLabel}
        hideLabel={hideLabel}
        required={required}
        searchable={searchable}
      />
    </div>
  );
}
