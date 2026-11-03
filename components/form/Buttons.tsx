"use client";

import { ReloadIcon } from "@radix-ui/react-icons";
import { useFormStatus } from "react-dom";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { LuPen, LuShoppingCart, LuTrash2 } from "react-icons/lu";
import { useTranslations } from "next-intl";

type btnSize = "default" | "lg" | "sm";

type SubmitButtonProps = {
  className?: string;
  text?: string;
  size?: btnSize;
  form?: string;
};

export function SubmitButton({
  className = "",
  text,
  size = "lg",
  form,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const t = useTranslations("Common");
  const label = text ?? t("submit");
  return (
    <Button
      type="submit"
      form={form}
      disabled={pending}
      className={className}
      size={size}
    >
      {pending ? (
        <>
          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          {t("pleaseWait")}
        </>
      ) : (
        label
      )}
    </Button>
  );
}

type actionType = "edit" | "delete";

export const IconButton = ({ actionType }: { actionType: actionType }) => {
  const { pending } = useFormStatus();

  const renderIcon = () => {
    switch (actionType) {
      case "edit":
        return <LuPen />;
      case "delete":
        return <LuTrash2 />;
      default:
        const never: never = actionType;
        throw new Error(`Invalid action type: ${never}`);
    }
  };
  return (
    <Button
      type="submit"
      size="icon"
      variant="ghost"
      className="cursor-pointer text-muted-foreground"
    >
      {pending ? <ReloadIcon className="animate-spin" /> : renderIcon()}
    </Button>
  );
};

const favoriteIdleClass =
  "text-muted-foreground hover:bg-background hover:text-foreground";
const favoriteActiveClass =
  "text-foreground hover:bg-background hover:text-foreground";
const favoriteChromeClass =
  "size-9 shrink-0 overflow-hidden rounded-full border border-border/70 bg-background p-0 shadow-none";

export function FavoriteHeartPreview({
  isFavorite,
  className,
}: {
  isFavorite: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      tabIndex={-1}
      aria-label={isFavorite ? "В обраному" : "Не в обраному"}
      className={cn(
        "pointer-events-none",
        favoriteChromeClass,
        isFavorite ? favoriteActiveClass : favoriteIdleClass,
        className
      )}
    >
      {isFavorite ? <FaHeart className="size-4" /> : <FaRegHeart className="size-4" />}
    </Button>
  );
}

type FavoriteButtonAppearance = "card" | "outline";

export const CardSignInButton = ({
  className,
  appearance = "card",
}: {
  className?: string;
  appearance?: FavoriteButtonAppearance;
} = {}) => {
  const pathname = usePathname();
  const href = `/sign-in?redirect_url=${encodeURIComponent(pathname || "/products")}`;
  const outline = appearance === "outline";
  return (
    <Button
      type="button"
      size="icon"
      variant={outline ? "outline" : "ghost"}
      className={cn(
        "cursor-pointer",
        !outline && favoriteChromeClass,
        !outline && favoriteIdleClass,
        className
      )}
      asChild
    >
      <Link href={href}>
        <FaRegHeart className="size-4" aria-hidden />
      </Link>
    </Button>
  );
};

export const CardSubmitButton = ({
  isFavorite,
  className,
  appearance = "card",
}: {
  isFavorite: boolean;
  className?: string;
  appearance?: FavoriteButtonAppearance;
}) => {
  const { pending } = useFormStatus();
  const outline = appearance === "outline";
  return (
    <Button
      type="submit"
      size="icon"
      variant={outline ? "outline" : "ghost"}
      className={cn(
        "cursor-pointer",
        !outline && favoriteChromeClass,
        !outline && (isFavorite ? favoriteActiveClass : favoriteIdleClass),
        className
      )}
    >
      {pending ? (
        <ReloadIcon className="size-4 animate-spin" aria-hidden />
      ) : isFavorite ? (
        <FaHeart className="size-4" aria-hidden />
      ) : (
        <FaRegHeart className="size-4" aria-hidden />
      )}
    </Button>
  );
};

export const ProductSignInButton = () => {
  const pathname = usePathname();
  const t = useTranslations("Product");
  const href = `/sign-in?redirect_url=${encodeURIComponent(pathname || "/products")}`;
  return (
    <Button type="button" size="lg" className="w-full" asChild>
      <Link href={href}>
        <LuShoppingCart className="size-4" aria-hidden />
        {t("signInToOrder")}
      </Link>
    </Button>
  );
};
