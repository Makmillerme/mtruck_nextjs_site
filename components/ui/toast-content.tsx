"use client"

import * as React from "react"
import { LuCheck, LuCircleAlert, LuInfo } from "react-icons/lu"

import {
  ToastDescription,
  ToastTitle,
  type ToastProps,
} from "@/components/ui/toast"
import { cn } from "@/lib/utils"

type ToastVariant = NonNullable<ToastProps["variant"]>

const variantIcon: Record<
  ToastVariant,
  React.ComponentType<{ className?: string }>
> = {
  default: LuInfo,
  success: LuCheck,
  destructive: LuCircleAlert,
}

const variantIconClass: Record<ToastVariant, string> = {
  default: "text-muted-foreground",
  success: "text-emerald-600",
  destructive: "text-destructive-foreground",
}

export type ToastContentProps = {
  variant?: ToastVariant | null
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

/** Canonical toast row — icon + text + trailing (close / action). */
export function ToastContent({
  variant = "default",
  title,
  description,
  className,
  children,
}: ToastContentProps) {
  const resolved: ToastVariant = variant ?? "default"
  const Icon = variantIcon[resolved]

  return (
    <div className={cn("flex w-full items-center gap-3", className)}>
      <Icon
        className={cn("size-4 shrink-0", variantIconClass[resolved])}
        aria-hidden
      />
      <div className="grid min-w-0 flex-1 gap-0.5 leading-5">
        {title ? <ToastTitle className="leading-5">{title}</ToastTitle> : null}
        {description ? (
          <ToastDescription className="leading-5">{description}</ToastDescription>
        ) : null}
      </div>
      {children}
    </div>
  )
}
