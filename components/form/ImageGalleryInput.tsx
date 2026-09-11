"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

const DEFAULT_MAX = 15;

export default function ImageGalleryInput({
  name = "images",
  required = true,
  max = DEFAULT_MAX,
}: {
  name?: string;
  required?: boolean;
  max?: number;
}) {
  const t = useTranslations("Admin");
  const [count, setCount] = useState(0);

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{t("images", { max })}</Label>
      <Input
        id={name}
        name={name}
        type="file"
        accept="image/*"
        multiple
        required={required}
        onChange={(event) => {
          const files = event.target.files;
          if (!files) {
            setCount(0);
            return;
          }
          if (files.length > max) {
            const dt = new DataTransfer();
            Array.from(files)
              .slice(0, max)
              .forEach((file) => dt.items.add(file));
            event.target.files = dt.files;
            setCount(max);
            return;
          }
          setCount(files.length);
        }}
      />
      <p className="text-xs text-muted-foreground">
        {t("imagesHint", { count, max })}
      </p>
    </div>
  );
}
