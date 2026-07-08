'use client';

import dynamic from 'next/dynamic';

const ExitIntentPopup = dynamic(() => import('./ExitIntentPopup'), { ssr: false });
const CartDrawer = dynamic(() => import('./CartDrawer'), { ssr: false });

export default function ClientOnlyWidgets() {
  return (
    <>
      <ExitIntentPopup />
      <CartDrawer />
    </>
  );
}
