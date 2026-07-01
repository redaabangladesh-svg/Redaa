'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import CartDrawer from '@/components/store/CartDrawer';
import { useState } from 'react';

export default function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const currentLocale = pathname.split('/')[1] === 'en' ? 'en' : 'bn';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/${currentLocale}/shop?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <>
      {/* ── MAIN HEADER ── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">

          {/* Header Row: Hamburger | Logo | Action Buttons (Heart, Cart) */}
          <div className="flex items-center justify-between gap-4">

            {/* Left: Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-2 -ml-2 rounded-lg text-brand-muted hover:bg-brand-surface focus:outline-none transition-colors"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Center: Brand Logo & Tagline */}
            <Link href={`/${currentLocale}`} className="flex items-center gap-2.5 group select-none">
              <img
                src="/Sicily_icon.png"
                alt="Sicily Decor"
                className="h-9 w-9 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="leading-none text-left">
                <span className="block text-[19px] font-serif font-semibold tracking-tight text-brand-text">Sicily Decor</span>
                <span className="block text-[8px] font-semibold tracking-[0.18em] uppercase text-[#C6A15B] mt-0.5">
                  {locale === 'bn' ? 'কোয়ালিটি ও নান্দনিকতা' : 'Est. Premium Home Décor'}
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

          {/* Search Input Bar (refined, hairline border, gold focus) */}
          <div className="mt-3.5">
            <form onSubmit={handleSearch} className="flex items-center rounded-full bg-brand-surface border border-brand-border overflow-hidden hover:border-brand-primary/30 focus-within:border-[#C6A15B] focus-within:ring-1 focus-within:ring-[#C6A15B]/40 transition-all duration-200">
              <div className="pl-4 text-brand-muted">
                <Search className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={locale === 'bn' ? 'পণ্য, ক্যাটাগরি বা ব্র্যান্ড খুঁজুন...' : 'Search for products, categories...'}
                className="flex-1 px-3 py-2.5 text-xs sm:text-sm text-brand-text bg-transparent outline-none placeholder:text-brand-muted/70"
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-[11px] font-semibold tracking-wide uppercase text-brand-primary hover:text-brand-primary-alt transition-colors"
              >
                {locale === 'bn' ? 'খুঁজুন' : 'Search'}
              </button>
            </form>
          </div>

        </div>

        {/* Mobile Navigation Drawer Menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-brand-border bg-white px-4 py-4 space-y-1 shadow-lg absolute w-full left-0 z-30">
            {[
              { en: 'Home', bn: 'হোম', href: `/${currentLocale}` },
              { en: 'Shop', bn: 'শপ', href: `/${currentLocale}/shop` },
              { en: 'Wishlist', bn: 'উইশলিস্ট', href: `/${currentLocale}/shop` },
              { en: 'Profile', bn: 'প্রোফাইল', href: `/${currentLocale}/account` },
            ].map((l, i) => (
              <Link
                key={i}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 px-3.5 rounded-lg text-xs sm:text-sm font-semibold text-brand-text hover:bg-brand-surface hover:text-brand-primary transition-colors"
              >
                {locale === 'bn' ? l.bn : l.en}
              </Link>
            ))}
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
