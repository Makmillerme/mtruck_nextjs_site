"use client";

import { useFormStatus } from "react-dom";
import { ReloadIcon } from "@radix-ui/react-icons";
import FormContainer from "../form/FormContainer";
import { ProductSignInButton } from "../form/Buttons";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createCatalogOrderAction } from "@/utils/actions";
import { useTranslations } from "next-intl";
import { LuArrowRight, LuShoppingCart } from "react-icons/lu";

function OrderSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const t = useTranslations("Common");

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <ReloadIcon className="size-4 animate-spin" aria-hidden />
          {t("pleaseWait")}
        </>
      ) : (
        <>
          <LuShoppingCart className="size-4" aria-hidden />
          {label}
        </>
      )}
    </Button>
  );
}

function RequestCatalogOrder({
  productId,
  isAuthenticated,
  hasOpenOrder = false,
}: {
  productId: string;
  isAuthenticated: boolean;
  hasOpenOrder?: boolean;
}) {
  const t = useTranslations("Product");

  if (!isAuthenticated) {
    return <ProductSignInButton />;
  }

  if (hasOpenOrder) {
    return (
      <Button asChild size="lg" className="w-full">
        <Link href="/account?tab=orders">
          <LuArrowRight className="size-4" aria-hidden />
          {t("goToCheckout")}
        </Link>
      </Button>
    );
  }

  return (
    <FormContainer action={createCatalogOrderAction} className="contents">
      <input type="hidden" name="productId" value={productId} />
      <OrderSubmitButton label={t("requestVehicle")} />
    </FormContainer>
  );
}

export default RequestCatalogOrder;
