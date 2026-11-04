"use client";

import Image from "next/image";
import { usePathname, Link } from "@/i18n/navigation";
import { ConfirmDeleteCallbackIcon } from "@/components/form/ConfirmDelete";
import FormContainer from "@/components/form/FormContainer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleFavoriteAction } from "@/utils/actions";
import { useTranslations } from "next-intl";
import type { KeyboardEvent, MouseEvent } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { LuPackage, LuPen } from "react-icons/lu";

export type AccountOrderLineStatus = "NEW" | "IN_PROGRESS" | "CLOSED";

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "a,button,input,textarea,select,label,[role='button'],[data-no-select]"
    )
  );
}

export default function AccountOrderLine({
  id,
  title,
  href,
  productId,
  productImage,
  productCode,
  kindLabel,
  status,
  statusLabel,
  priceLabel,
  selected,
  selectable,
  onSelectedChange,
  canEdit,
  onEdit,
  onDelete,
  favoriteId = null,
  showFavorite = false,
  className,
}: {
  id: string;
  title: string;
  href?: string | null;
  productId?: string | null;
  productImage?: string | null;
  productCode?: string | null;
  kindLabel: string;
  status: AccountOrderLineStatus;
  statusLabel: string;
  priceLabel: string;
  selected: boolean;
  selectable: boolean;
  onSelectedChange: (checked: boolean) => void;
  canEdit: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  favoriteId?: string | null;
  showFavorite?: boolean;
  className?: string;
}) {
  const tProduct = useTranslations("Product");
  const t = useTranslations("AccountCabinet");
  const pathname = usePathname();
  const isFavorite = Boolean(favoriteId);

  function toggleSelection() {
    if (!selectable) return;
    onSelectedChange(!selected);
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (isInteractiveTarget(event.target)) return;
    toggleSelection();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!selectable) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    if (isInteractiveTarget(event.target)) return;
    event.preventDefault();
    toggleSelection();
  }

  return (
    <div
      role="option"
      aria-selected={selected}
      aria-disabled={!selectable}
      tabIndex={selectable ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Shadow on this node — overflow-hidden only on the photo column (VehicleCard canon).
        "flex rounded-sm border bg-card text-card-foreground shadow-sm transition-shadow duration-500",
        selectable && "cursor-pointer hover:shadow-xl",
        !selectable && "cursor-default opacity-80",
        selected
          ? "border-primary shadow-xl ring-1 ring-primary/20"
          : "border-border",
        className
      )}
      data-order-id={id}
    >
      <div className="relative aspect-[4/3] h-auto w-auto min-w-[6.5rem] shrink-0 self-stretch overflow-hidden rounded-l-sm bg-muted sm:min-w-[8rem]">
        {productImage ? (
          <Image
            src={productImage}
            alt=""
            fill
            sizes="(max-width: 640px) 120px, 180px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <LuPackage className="size-8" aria-hidden />
          </div>
        )}
      </div>

      <div className="grid min-w-0 flex-1 gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6 sm:p-5">
        <div className="min-w-0 grid gap-1.5">
          <p
            className={cn(
              "text-xs font-medium",
              status === "CLOSED"
                ? "text-muted-foreground"
                : status === "IN_PROGRESS"
                  ? "text-foreground"
                  : "text-emerald-700"
            )}
          >
            {statusLabel}
            <span className="text-muted-foreground"> · {kindLabel}</span>
          </p>

          {href ? (
            <Link
              href={href}
              className="max-w-full justify-self-start text-sm font-semibold leading-snug text-foreground hover:underline sm:text-base"
              onClick={(event) => event.stopPropagation()}
            >
              {title}
            </Link>
          ) : (
            <p className="w-fit max-w-full text-sm font-semibold leading-snug text-foreground sm:text-base">
              {title}
            </p>
          )}

          {productCode ? (
            <p className="text-xs text-muted-foreground">
              {tProduct("articleCode", { code: productCode })}
            </p>
          ) : null}

          <div className="mt-1 flex w-fit max-w-full flex-wrap items-center gap-1 justify-self-start">
            {showFavorite && productId ? (
              <FormContainer
                action={toggleFavoriteAction.bind(null, {
                  productId,
                  favoriteId,
                  pathname,
                })}
                className="contents"
              >
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-muted-foreground"
                >
                  {isFavorite ? (
                    <FaHeart className="size-3.5" aria-hidden />
                  ) : (
                    <FaRegHeart className="size-3.5" aria-hidden />
                  )}
                  {isFavorite ? t("inFavorites") : t("toFavorites")}
                </Button>
              </FormContainer>
            ) : null}

            {canEdit && onEdit ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-muted-foreground"
                onClick={onEdit}
              >
                <LuPen className="size-3.5" aria-hidden />
                {t("editOrderShort")}
              </Button>
            ) : null}

            {canEdit && onDelete ? (
              <ConfirmDeleteCallbackIcon
                onConfirm={onDelete}
                label={t("removeOrder")}
              />
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-start justify-between sm:justify-end">
          <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {priceLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
