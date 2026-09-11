"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { ReloadIcon } from "@radix-ui/react-icons";
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
