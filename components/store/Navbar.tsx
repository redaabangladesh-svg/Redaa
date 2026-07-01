'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import CartDrawer from '@/components/store/CartDrawer';

export default function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();

  const currentLocale = pathname.split('/')[1] === 'en' ? 'en' : 'bn';

  return (
    <>
      {/* ── MAIN HEADER ── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">

          {/* Header Row: Logo (left) | Action Buttons (Heart, Cart) */}
          <div className="flex items-center justify-between gap-4">

            {/* Left: Brand Logo & Tagline */}
            <Link href={`/${currentLocale}`} className="flex items-center gap-2.5 group select-none">
              <img
                src="/Sicily_icon.png"
                alt="Sicily"
                className="h-9 w-9 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="leading-none text-left">
                <span className="block text-[19px] font-serif font-semibold tracking-tight text-brand-text">Sicily</span>
                <span className="block text-[8px] font-semibold tracking-[0.18em] uppercase text-[#C6A15B] mt-0.5">
                  Focus On Quality
                </span>
              </div>
            </Link>

            {/* Right: Wishlist & Cart Actions */}
            <div className="flex items-center gap-1">
              {/* Wishlist Link */}
              <Link
                href={`/${currentLocale}/shop`}
                className="p-2 rounded-lg text-brand-muted hover:text-brand-secondary hover:bg-brand-surface transition-all duration-200 relative"
                title="Wishlist"
              >
                <Heart className="h-5 w-5" strokeWidth={1.75} />
              </Link>

              {/* Shopping Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 rounded-lg text-brand-muted hover:text-brand-primary hover:bg-brand-surface transition-all duration-200 relative"
                title="Cart"
              >
                <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#C6A15B] text-[#14201D] text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

        </div>
      </header>

      <CartDrawer />
    </>
  );
}
