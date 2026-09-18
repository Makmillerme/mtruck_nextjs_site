"use client";

import { useState, type ReactNode } from "react";
import FormContainer from "@/components/form/FormContainer";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { actionFunction } from "@/utils/types";
import { useTranslations } from "next-intl";
import { LuArchive, LuTrash2 } from "react-icons/lu";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useFormStatus } from "react-dom";

function ConfirmSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? (
        <>
          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          …
        </>
      ) : (
        label
      )}
    </Button>
  );
}

/** Icon → AlertDialog → server action form. Never submit without confirm. */
export function ConfirmDeleteIcon({
  action,
  children,
  title,
  description,
  confirmLabel,
  className,
  mode = "delete",
}: {
  action: actionFunction;
  children?: ReactNode;
  title?: string;
  description?: string;
  confirmLabel?: string;
  className?: string;
  mode?: "delete" | "archive";
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Common");
  const isArchive = mode === "archive";
  const resolvedTitle =
    title ??
    (isArchive ? t("confirmArchiveTitle") : t("confirmDeleteTitle"));
  const resolvedDescription =
    description ??
    (isArchive
      ? t("confirmArchiveDescription")
      : t("confirmDeleteDescription"));
  const resolvedConfirm =
    confirmLabel ??
    (isArchive ? t("confirmArchive") : t("confirmDelete"));

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={className ?? "cursor-pointer text-muted-foreground"}
        aria-label={resolvedTitle}
        onClick={() => setOpen(true)}
      >
        {isArchive ? <LuArchive /> : <LuTrash2 />}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="z-[110]">
          <AlertDialogHeader>
            <AlertDialogTitle>{resolvedTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {resolvedDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <FormContainer action={action} className="inline-flex">
              {children}
              <ConfirmSubmitButton label={resolvedConfirm} />
            </FormContainer>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Destructive button that submits an external form only after confirm. */
export function ConfirmDeleteFormButton({
  formId,
  label,
  title,
  description,
  confirmLabel,
  size = "lg",
  mode = "delete",
}: {
  formId: string;
  label: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  size?: "default" | "lg" | "sm";
  mode?: "delete" | "archive";
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Common");
  const isArchive = mode === "archive";
  const resolvedTitle =
    title ??
    (isArchive ? t("confirmArchiveTitle") : t("confirmDeleteTitle"));
  const resolvedDescription =
    description ??
    (isArchive
      ? t("confirmArchiveDescription")
      : t("confirmDeleteDescription"));
  const resolvedConfirm =
    confirmLabel ??
    (isArchive ? t("confirmArchive") : t("confirmDelete"));

  return (
    <>
      <Button
        type="button"
        variant={isArchive ? "outline" : "destructive"}
        size={size}
        className="w-fit"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="z-[110]">
          <AlertDialogHeader>
            <AlertDialogTitle>{resolvedTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {resolvedDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <Button
              type="submit"
              form={formId}
              variant="destructive"
              onClick={() => setOpen(false)}
            >
              {resolvedConfirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
