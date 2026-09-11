"use client";

import { SubmitButton } from "@/components/form/Buttons";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function SheetFormActions({
  saveLabel,
  deleteFormId,
}: {
  saveLabel: string;
  deleteFormId?: string;
}) {
  const t = useTranslations("Admin");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SubmitButton text={saveLabel} className="w-fit" />
      {deleteFormId ? (
        <Button
          type="submit"
          form={deleteFormId}
          variant="destructive"
          size="lg"
          className="w-fit"
        >
          {t("delete")}
        </Button>
      ) : null}
    </div>
  );
}
