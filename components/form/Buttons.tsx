"use client";

import { ReloadIcon } from "@radix-ui/react-icons";
import { useFormStatus } from "react-dom";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { LuTrash2, LuPen } from "react-icons/lu";
import { useTranslations } from "next-intl";

type btnSize = "default" | "lg" | "sm";

type SubmitButtonProps = {
  className?: string;
  text?: string;
  size?: btnSize;
};

export function SubmitButton({
  className = "",
  text,
  size = "lg",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const t = useTranslations("Common");
  const label = text ?? t("submit");
  return (
    <Button
      type="submit"
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

export const CardSignInButton = ({ className }: { className?: string } = {}) => {
  const pathname = usePathname();
  const href = `/sign-in?redirect_url=${encodeURIComponent(pathname || "/products")}`;
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={cn("cursor-pointer", favoriteChromeClass, className, favoriteIdleClass)}
      asChild
    >
      <Link href={href}>
        <FaRegHeart className="size-4" />
      </Link>
    </Button>
  );
};

export const CardSubmitButton = ({
  isFavorite,
  className,
}: {
  isFavorite: boolean;
  className?: string;
}) => {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="icon"
      variant="ghost"
      className={cn(
        "cursor-pointer",
        favoriteChromeClass,
        className,
        isFavorite ? favoriteActiveClass : favoriteIdleClass
      )}
    >
      {pending ? (
        <ReloadIcon className="size-4 animate-spin" />
      ) : isFavorite ? (
        <FaHeart className="size-4" />
      ) : (
        <FaRegHeart className="size-4" />
      )}
    </Button>
  );
};

export const ProductSignInButton = () => {
  const pathname = usePathname();
  const t = useTranslations("Product");
  const href = `/sign-in?redirect_url=${encodeURIComponent(pathname || "/products")}`;
  return (
    <Button type="button" className="mt-8" asChild>
      <Link href={href}>{t("signIn")}</Link>
    </Button>
  );
};
