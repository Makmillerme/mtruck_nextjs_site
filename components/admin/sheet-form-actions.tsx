"use client";

import { SubmitButton } from "@/components/form/Buttons";
import { ConfirmDeleteFormButton } from "@/components/form/ConfirmDelete";
import { useTranslations } from "next-intl";

export default function SheetFormActions({
  saveLabel,
  deleteFormId,
  destructiveMode = "archive",
}: {
  saveLabel: string;
  deleteFormId?: string;
  /** Lists/sheets archive; permanent delete only on archive page. */
  destructiveMode?: "archive" | "delete";
}) {
  const t = useTranslations("Admin");

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <SubmitButton
        text={saveLabel}
        size="default"
        className="w-full sm:w-fit"
      />
      {deleteFormId ? (
        <ConfirmDeleteFormButton
          formId={deleteFormId}
          label={destructiveMode === "archive" ? t("archiveAction") : t("delete")}
          mode={destructiveMode}
          className="w-full justify-center sm:w-auto"
        />
      ) : null}
    </div>
  );
}
