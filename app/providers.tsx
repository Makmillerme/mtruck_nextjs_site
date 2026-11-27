'use client';
import { useEffect } from 'react';
import { CtaInquiryProvider } from '@/components/cta/cta-inquiry';
import { OrderAddedSheetProvider } from '@/components/single-product/order-added-sheet';
import { Toaster } from '@/components/ui/toaster';

const KEYBOARD_FOCUS_KEYS = new Set([
  'Tab',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]);

/** Pointer clicks must not leave the navy focus ring. Tab / arrows clear the flag. */
function PointerFocus() {
  useEffect(() => {
    const root = document.documentElement;
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || event.pointerType === 'touch' || event.pointerType === 'pen') {
        root.setAttribute('data-pointer-focus', '');
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (!KEYBOARD_FOCUS_KEYS.has(event.key)) return;
      root.removeAttribute('data-pointer-focus');
    };
    document.addEventListener('pointerdown', onPointer, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onPointer, true);
      document.removeEventListener('keydown', onKey, true);
      root.removeAttribute('data-pointer-focus');
    };
  }, []);
  return null;
}

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
      <PointerFocus />
      <OrderAddedSheetProvider>
        <Toaster />
        {children}
      </OrderAddedSheetProvider>
    </CtaInquiryProvider>
  );
}
export default Providers;
