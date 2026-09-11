"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

function EmptyList({
  heading,
  className,
}: {
  heading?: string;
  className?: string;
}) {
  const t = useTranslations("Common");
  return (
    <h2 className={cn("text-xl", className)}>{heading ?? t("emptyList")}</h2>
  );
}
export default EmptyList;
