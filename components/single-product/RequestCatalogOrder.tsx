"use client";

import FormContainer from "../form/FormContainer";
import { SubmitButton, ProductSignInButton } from "../form/Buttons";
import { createCatalogOrderAction } from "@/utils/actions";
import { useTranslations } from "next-intl";

function RequestCatalogOrder({
  productId,
  isAuthenticated,
}: {
  productId: string;
  isAuthenticated: boolean;
}) {
  const t = useTranslations("Product");

  if (!isAuthenticated) {
    return <ProductSignInButton />;
  }

  return (
    <FormContainer action={createCatalogOrderAction} className="contents">
      <input type="hidden" name="productId" value={productId} />
      <SubmitButton text={t("requestVehicle")} size="lg" />
    </FormContainer>
  );
}

export default RequestCatalogOrder;
