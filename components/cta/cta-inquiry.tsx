"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import ContactForm from "@/components/contact-form";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

export type CtaInquiryContextValue = {
  productId?: string | null;
  productName?: string | null;
  productCode?: string | null;
};

type CtaInquiryApi = {
  open: (context?: CtaInquiryContextValue) => void;
  close: () => void;
};

const CtaInquiryContext = createContext<CtaInquiryApi | null>(null);

export function useCtaInquiry() {
  const api = useContext(CtaInquiryContext);
  if (!api) {
    throw new Error("useCtaInquiry must be used within CtaInquiryProvider");
  }
  return api;
}

function CtaInquiryDialog({
  open,
  onOpenChange,
  context,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: CtaInquiryContextValue | null;
}) {
  const t = useTranslations("ContactSection");
  const productHint =
    context?.productName || context?.productCode
      ? [context.productName, context.productCode]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>
        {productHint ? (
          <p className="rounded-sm border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
            {productHint}
          </p>
        ) : null}
        <ContactForm
          inputId="cta-inquiry-phone"
          messageId="cta-inquiry-note"
          productId={context?.productId}
          productName={context?.productName}
          productCode={context?.productCode}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function CtaInquiryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<CtaInquiryContextValue | null>(null);

  const openInquiry = useCallback((next?: CtaInquiryContextValue) => {
    setContext(next ?? null);
    setOpen(true);
  }, []);

  const closeInquiry = useCallback(() => {
    setOpen(false);
  }, []);

  const api = useMemo(
    () => ({ open: openInquiry, close: closeInquiry }),
    [openInquiry, closeInquiry]
  );

  return (
    <CtaInquiryContext.Provider value={api}>
      {children}
      <CtaInquiryDialog
        open={open}
        context={context}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setContext(null);
        }}
      />
    </CtaInquiryContext.Provider>
  );
}

type CtaInquiryTriggerProps = ButtonProps & {
  context?: CtaInquiryContextValue;
};

/** Opens the site-wide callback / inquiry dialog. */
export function CtaInquiryTrigger({
  context,
  onClick,
  type = "button",
  children,
  ...props
}: CtaInquiryTriggerProps) {
  const { open } = useCtaInquiry();

  return (
    <Button
      type={type}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) open(context);
      }}
    >
      {children}
    </Button>
  );
}
