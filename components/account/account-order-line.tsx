"use client";

import Image from "next/image";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { ConfirmDeleteCallbackIcon } from "@/components/form/ConfirmDelete";
import FormContainer from "@/components/form/FormContainer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleFavoriteAction } from "@/utils/actions";
import type { actionFunction } from "@/utils/types";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { LuMinus, LuPackage, LuPlus } from "react-icons/lu";

/** Delay before auto-repeat starts while the +/- button is held. */
const QTY_HOLD_DELAY_MS = 420;
/** Interval between auto-repeat steps. */
const QTY_HOLD_INTERVAL_MS = 85;

function QtyHoldButton({
  delta,
  quantity,
  min,
  max,
  disabled,
  "aria-label": ariaLabel,
  onQuantityChange,
  children,
}: {
  delta: 1 | -1;
  quantity: number;
  min: number;
  max: number;
  disabled?: boolean;
  "aria-label": string;
  onQuantityChange: (next: number) => void;
  children: ReactNode;
}) {
  const quantityRef = useRef(quantity);
  quantityRef.current = quantity;
  const onChangeRef = useRef(onQuantityChange);
  onChangeRef.current = onQuantityChange;
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearHold() {
    if (delayRef.current) clearTimeout(delayRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    delayRef.current = null;
    intervalRef.current = null;
  }

  useEffect(() => () => clearHold(), []);

  function applyStep() {
    const current = quantityRef.current;
    const next = Math.min(max, Math.max(min, current + delta));
    if (next === current) {
      clearHold();
      return false;
    }
    onChangeRef.current(next);
    return true;
  }

  function startHold(event: PointerEvent<HTMLButtonElement>) {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    applyStep();
    clearHold();
    delayRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (!applyStep()) clearHold();
      }, QTY_HOLD_INTERVAL_MS);
    }, QTY_HOLD_DELAY_MS);
  }

  function endHold(event: PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    clearHold();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7 shrink-0 touch-manipulation"
      disabled={disabled}
      aria-label={ariaLabel}
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerCancel={endHold}
      onLostPointerCapture={clearHold}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        applyStep();
      }}
    >
      {children}
    </Button>
  );
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "a,button,input,textarea,select,label,[role='button'],[data-no-select]"
    )
  );
}

/** Phone + tablet: larger square. lg+ (with sidebar room): landscape 4:3. */
function OrderPhoto({
  productImage,
  sizes,
  className,
}: {
  productImage?: string | null;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square w-40 shrink-0 overflow-hidden bg-muted sm:w-44 md:w-52 lg:aspect-[4/3] lg:w-56 xl:w-64",
        className
      )}
    >
      {productImage ? (
        <Image
          src={productImage}
          alt=""
          fill
          sizes={sizes}
          className="object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <LuPackage className="size-7 sm:size-8" aria-hidden />
        </div>
      )}
    </div>
  );
}

export default function AccountOrderLine({
  id,
  title,
  href,
  productId,
  productImage,
  productCode,
  note,
  priceLabel,
  quantity = 1,
  allowsQuantity = false,
  quantityMax = 99,
  quantityAction,
  onQuantityChange,
  selected,
  selectable,
  onSelectedChange,
  canDelete,
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
  note?: string | null;
  priceLabel: string;
  quantity?: number;
  allowsQuantity?: boolean;
  quantityMax?: number;
  quantityAction?: actionFunction;
  /** Lab / local demo — skips server action when set. */
  onQuantityChange?: (next: number) => void;
  selected: boolean;
  selectable: boolean;
  onSelectedChange: (checked: boolean) => void;
  canDelete: boolean;
  onDelete?: () => void;
  favoriteId?: string | null;
  showFavorite?: boolean;
  className?: string;
}) {
  const tProduct = useTranslations("Product");
  const t = useTranslations("AccountCabinet");
  const pathname = usePathname();
  const router = useRouter();
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

  const titleNode: ReactNode = href ? (
    <Link
      href={href}
      className="line-clamp-2 max-w-full justify-self-end text-sm font-semibold leading-snug text-foreground hover:underline"
      onClick={(event) => event.stopPropagation()}
    >
      {title}
    </Link>
  ) : (
    <p className="line-clamp-2 w-full max-w-full text-sm font-semibold leading-snug text-foreground">
      {title}
    </p>
  );

  const favoriteButton =
    showFavorite && productId ? (
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
          className="h-7 gap-1 px-1.5 text-muted-foreground sm:h-8 sm:gap-1.5 sm:px-2"
          aria-label={isFavorite ? t("inFavorites") : t("toFavorites")}
        >
          {isFavorite ? (
            <FaHeart className="size-3.5" aria-hidden />
          ) : (
            <FaRegHeart className="size-3.5" aria-hidden />
          )}
          <span className="max-sm:sr-only">
            {isFavorite ? t("inFavorites") : t("toFavorites")}
          </span>
        </Button>
      </FormContainer>
    ) : null;

  const deleteButton =
    canDelete && onDelete ? (
      <ConfirmDeleteCallbackIcon
        onConfirm={onDelete}
        label={t("removeOrder")}
        className="h-7 cursor-pointer gap-1 px-1.5 text-muted-foreground sm:h-8 sm:gap-1.5 sm:px-2"
        iconClassName="size-3.5"
        labelClassName="max-sm:sr-only"
      />
    ) : null;

  const hasActions = Boolean(favoriteButton || deleteButton);
  const showQty = allowsQuantity && quantity >= 1;

  const qtyStepper = showQty ? (
    <div
      data-no-select
      className="flex items-center gap-1 rounded-sm border border-border bg-background p-0.5"
      onClick={(event) => event.stopPropagation()}
    >
      {onQuantityChange ? (
        <>
          <QtyHoldButton
            delta={-1}
            quantity={quantity}
            min={1}
            max={quantityMax}
            disabled={quantity <= 1}
            aria-label={t("qtyDecrease")}
            onQuantityChange={onQuantityChange}
          >
            <LuMinus className="size-3.5" aria-hidden />
          </QtyHoldButton>
          <span className="min-w-7 text-center text-sm font-medium tabular-nums">
            {quantity}
          </span>
          <QtyHoldButton
            delta={1}
            quantity={quantity}
            min={1}
            max={quantityMax}
            disabled={quantity >= quantityMax}
            aria-label={t("qtyIncrease")}
            onQuantityChange={onQuantityChange}
          >
            <LuPlus className="size-3.5" aria-hidden />
          </QtyHoldButton>
        </>
      ) : quantityAction ? (
        <>
          <FormContainer
            action={quantityAction}
            className="contents"
            onSuccess={() => router.refresh()}
          >
            <input type="hidden" name="orderId" value={id} />
            <input type="hidden" name="quantity" value={quantity - 1} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              disabled={quantity <= 1}
              aria-label={t("qtyDecrease")}
            >
              <LuMinus className="size-3.5" aria-hidden />
            </Button>
          </FormContainer>
          <span className="min-w-7 text-center text-sm font-medium tabular-nums">
            {quantity}
          </span>
          <FormContainer
            action={quantityAction}
            className="contents"
            onSuccess={() => router.refresh()}
          >
            <input type="hidden" name="orderId" value={id} />
            <input type="hidden" name="quantity" value={quantity + 1} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              disabled={quantity >= quantityMax}
              aria-label={t("qtyIncrease")}
            >
              <LuPlus className="size-3.5" aria-hidden />
            </Button>
          </FormContainer>
        </>
      ) : null}
    </div>
  ) : null;

  return (
    <div
      role="option"
      aria-selected={selected}
      aria-disabled={!selectable}
      tabIndex={selectable ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full overflow-hidden rounded-sm border bg-card text-card-foreground shadow-sm transition-shadow duration-500",
        selectable && "cursor-pointer hover:shadow-xl",
        !selectable && "cursor-default opacity-80",
        selected
          ? "border-primary shadow-xl ring-1 ring-primary/20"
          : "border-border",
        className
      )}
      data-order-id={id}
    >
      {/* Phone/tablet: square; lg+: album 4:3 (same bp as sidebar) */}
      <div className="flex items-start">
        <OrderPhoto
          productImage={productImage}
          sizes="(max-width: 640px) 160px, (max-width: 1023px) 208px, (max-width: 1280px) 224px, 256px"
        />
        <div className="flex min-w-0 flex-1 flex-col items-end justify-between gap-1.5 self-stretch p-2 sm:gap-2 sm:p-3">
          <div className="grid w-full justify-items-end gap-0.5 text-right sm:gap-1">
            {titleNode}
            {productCode ? (
              <p className="text-[11px] text-muted-foreground sm:text-xs">
                {tProduct("articleCode", { code: productCode })}
              </p>
            ) : null}
            {note ? (
              <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:text-xs sm:leading-relaxed">
                {note}
              </p>
            ) : null}
            <p className="pt-0.5 text-sm font-bold tracking-tight text-foreground sm:text-base">
              {priceLabel}
            </p>
          </div>
          {qtyStepper || hasActions ? (
            <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
              {hasActions ? (
                <div className="flex flex-wrap items-center justify-end gap-0.5 sm:gap-1">
                  {favoriteButton}
                  {deleteButton}
                </div>
              ) : null}
              {qtyStepper}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
