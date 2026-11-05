'use client';
import { CtaInquiryProvider } from '@/components/cta/cta-inquiry';
import { OrderAddedSheetProvider } from '@/components/single-product/order-added-sheet';
import { Toaster } from '@/components/ui/toaster';

function Providers({
  children,
  userPhone = null,
}: {
  children: React.ReactNode;
  /** Primary phone for logged-in user — CTA skips tel field when set. */
  userPhone?: string | null;
}) {
  return (
    <CtaInquiryProvider userPhone={userPhone}>
      <OrderAddedSheetProvider>
        <Toaster />
        {children}
      </OrderAddedSheetProvider>
    </CtaInquiryProvider>
  );
}
export default Providers;
