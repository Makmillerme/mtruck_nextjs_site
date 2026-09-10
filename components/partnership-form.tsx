"use client";

import FormContainer from "@/components/form/FormContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitPartnershipInquiryAction } from "@/utils/actions";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";

const fieldClass =
  "border-background/20 bg-background/10 text-background placeholder:text-background/50 focus-visible:border-primary focus-visible:ring-primary";

function SubmitInquiryButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
      {label}
    </Button>
  );
}

export default function PartnershipForm() {
  const t = useTranslations("PartnershipSection");

  return (
    <FormContainer action={submitPartnershipInquiryAction}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="partner-name" className="text-background/70">
              {t("name")}
            </Label>
            <Input
              id="partner-name"
              name="name"
              required
              autoComplete="name"
              placeholder={t("namePlaceholder")}
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partner-email" className="text-background/70">
              {t("email")}
            </Label>
            <Input
              id="partner-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              className={fieldClass}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="partner-company" className="text-background/70">
            {t("company")}
          </Label>
          <Input
            id="partner-company"
            name="company"
            required
            autoComplete="organization"
            placeholder={t("companyPlaceholder")}
            className={fieldClass}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="partner-message" className="text-background/70">
            {t("message")}
          </Label>
          <Textarea
            id="partner-message"
            name="message"
            required
            rows={4}
            placeholder={t("messagePlaceholder")}
            className={`${fieldClass} resize-none`}
          />
        </div>
        <SubmitInquiryButton label={t("submit")} />
      </div>
    </FormContainer>
  );
}
