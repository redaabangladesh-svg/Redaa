'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Heart, Menu, X, Home, LayoutGrid, ShoppingCart, Package, User } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import CartDrawer from '@/components/store/CartDrawer';
import { useState } from 'react';

export default function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const { setIsCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentLocale = pathname.split('/')[1] === 'en' ? 'en' : 'bn';

  const menuItems = [
    { en: 'Home',      bn: 'হোম',        icon: Home,         href: `/${currentLocale}` },
    { en: 'Shop',      bn: 'শপ',         icon: LayoutGrid,   href: `/${currentLocale}/shop` },
    { en: 'Wishlist',  bn: 'উইশলিস্ট',    icon: Heart,        href: `/${currentLocale}/shop` },
    { en: 'Orders',    bn: 'অর্ডারসমূহ',  icon: Package,      href: `/${currentLocale}/admin/orders` },
    { en: 'Account',   bn: 'প্রোফাইল',     icon: User,         href: `/${currentLocale}/account` },
  ];

  return (
    <>
      {/* ── MAIN HEADER ── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">

          {/* Header Row: Wishlist (left) | Logo (center) | Hamburger (right) */}
          <div className="grid grid-cols-3 items-center gap-4">

            {/* Left: Wishlist Action */}
            <div className="flex items-center justify-start">
              <Link
                href={`/${currentLocale}/shop`}
                className="p-2 rounded-lg text-brand-muted hover:text-brand-secondary hover:bg-brand-surface transition-all duration-200"
                title="Wishlist"
              >
                <Heart className="h-5 w-5" strokeWidth={1.75} />
              </Link>
            </div>

            {/* Center: Brand Logo & Tagline */}
            <Link href={`/${currentLocale}`} className="flex flex-col items-center gap-0 group select-none justify-self-center">
              <img
                src="/Sicily_icon.png"
                alt="Sicily"
                className="h-9 w-9 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="leading-none text-center">
                <span className="block text-[19px] font-serif font-semibold tracking-tight text-brand-text">Sicily</span>
                <span className="block text-[8px] font-semibold tracking-[0.18em] uppercase text-[#C6A15B] mt-0.5">
                  Focus On Quality
                </span>
              </div>
            </Link>

            {/* Right: Hamburger Menu Trigger */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="p-2 rounded-lg text-brand-muted hover:bg-brand-surface focus:outline-none transition-colors"
              >
                {menuOpen ? <X className="h-6 w-6" strokeWidth={1.75} /> : <Menu className="h-6 w-6" strokeWidth={1.75} />}
              </button>
            </div>
          </div>

        </div>

        {/* Dropdown Navigation Menu */}
        {menuOpen && (
          <div className="border-t border-brand-border bg-white px-4 py-4 space-y-1 shadow-lg absolute w-full left-0 z-30">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3.5 rounded-lg text-xs sm:text-sm font-semibold text-brand-text hover:bg-brand-surface hover:text-brand-primary transition-colors"
                >
                  <Icon className="h-4.5 w-4.5 text-[#C6A15B]" strokeWidth={1.75} />
                  <span>{locale === 'bn' ? item.bn : item.en}</span>
                </Link>
              );
            })}
            <button
              onClick={() => { setIsCartOpen(true); setMenuOpen(false); }}
              className="w-full flex items-center gap-3 py-2.5 px-3.5 rounded-lg text-xs sm:text-sm font-semibold text-brand-text hover:bg-brand-surface hover:text-brand-primary transition-colors"
            >
              <ShoppingCart className="h-4.5 w-4.5 text-[#C6A15B]" strokeWidth={1.75} />
              <span>{locale === 'bn' ? 'কার্ট' : 'Cart'}</span>
            </button>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
