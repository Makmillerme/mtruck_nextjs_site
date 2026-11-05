'use client';
import { CtaInquiryProvider } from '@/components/cta/cta-inquiry';
import { OrderAddedSheetProvider } from '@/components/single-product/order-added-sheet';
import { Toaster } from '@/components/ui/toaster';

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CtaInquiryProvider>
      <OrderAddedSheetProvider>
        <Toaster />
        {children}
      </OrderAddedSheetProvider>
    </CtaInquiryProvider>
  );
}
export default Providers;
