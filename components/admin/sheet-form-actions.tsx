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
    <div className="flex flex-wrap items-center gap-2">
      <SubmitButton text={saveLabel} className="w-fit" />
      {deleteFormId ? (
        <ConfirmDeleteFormButton
          formId={deleteFormId}
          label={destructiveMode === "archive" ? t("archiveAction") : t("delete")}
          mode={destructiveMode}
        />
      ) : null}
    </div>
  );
}
