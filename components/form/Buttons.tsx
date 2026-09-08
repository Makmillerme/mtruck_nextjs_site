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
      className={cn("capitalize", className)}
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
      variant="link"
      className="p-2 cursor-pointer"
    >
      {pending ? <ReloadIcon className="animate-spin" /> : renderIcon()}
    </Button>
  );
};

export const CardSignInButton = () => {
  const pathname = usePathname();
  const href = `/sign-in?redirect_url=${encodeURIComponent(pathname || "/products")}`;
  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className="p-2 cursor-pointer"
      asChild
    >
      <Link href={href}>
        <FaRegHeart />
      </Link>
    </Button>
  );
};

export const CardSubmitButton = ({ isFavorite }: { isFavorite: boolean }) => {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="icon"
      variant="outline"
      className="p-2 cursor-pointer"
    >
      {pending ? (
        <ReloadIcon className="animate-spin" />
      ) : isFavorite ? (
        <FaHeart />
      ) : (
        <FaRegHeart />
      )}
    </Button>
  );
};

export const ProductSignInButton = () => {
  const pathname = usePathname();
  const t = useTranslations("Product");
  const href = `/sign-in?redirect_url=${encodeURIComponent(pathname || "/products")}`;
  return (
    <Button type="button" className="mt-8 capitalize" asChild>
      <Link href={href}>{t("signIn")}</Link>
    </Button>
  );
};
