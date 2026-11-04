'use client';
import { CtaInquiryProvider } from '@/components/cta/cta-inquiry';
import { Toaster } from '@/components/ui/toaster';

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CtaInquiryProvider>
      <Toaster />
      {children}
    </CtaInquiryProvider>
  );
}
export default Providers;
