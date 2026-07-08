'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Heart, Search, Crown, Flower2, Sprout, Frame } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useWishlist } from '@/lib/wishlist';

export default function Navbar() {
  const locale = useLocale();
  const router = useRouter();
  const { wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const categories = [
    { en: 'All Categories',      bn: 'সব ক্যাটাগরি',            icon: Crown },
    { en: 'Premium Flower Tub',  bn: 'প্রিমিয়াম ফ্লাওয়ার টাব',  icon: Flower2 },
    { en: 'Premium Tree Plant',  bn: 'প্রিমিয়াম ট্রি প্ল্যান্ট', icon: Sprout },
    { en: 'Premium Wall Stand',  bn: 'প্রিমিয়াম ওয়াল স্ট্যান্ড', icon: Frame },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/shop?q=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <>
      {/* ── MAIN HEADER ── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">

          {/* Header Row: Hamburger (left) | Logo (center) | Wishlist (right) */}
          <div className="grid grid-cols-3 items-center gap-4">

            {/* Left: Hamburger Menu Trigger (animated bars → X) */}
            <div className="flex items-center justify-start">
              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Menu"
                className="p-2 -ml-2 flex items-center justify-center text-brand-text hover:text-[#C6A15B] active:scale-95 focus:outline-none transition-colors duration-200"
              >
                <span className="relative block h-4 w-6">
                  <span
                    className="absolute top-0 left-0 h-[2px] w-6 rounded-full bg-current transition-transform duration-300 ease-out origin-center"
                    style={{ transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'translateY(0) rotate(0deg)' }}
                  />
                  <span
                    className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] w-4 rounded-full bg-current transition-all duration-200 ease-out"
                    style={{ opacity: menuOpen ? 0 : 1 }}
                  />
                  <span
                    className="absolute bottom-0 left-0 h-[2px] w-6 rounded-full bg-current transition-transform duration-300 ease-out origin-center"
                    style={{ transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'translateY(0) rotate(0deg)' }}
                  />
                </span>
              </button>
            </div>

            {/* Center: Brand Logo & Tagline (matches footer lockup) */}
            <Link href="/" className="flex items-center gap-2.5 group select-none justify-self-center">
              <img
                src="/Sicily_icon.png"
                alt="Sicily"
                className="h-9 w-9 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="leading-none text-left">
                <span className="block text-[19px] font-serif font-semibold tracking-tight text-brand-text">Sicily</span>
                <span className="block whitespace-nowrap text-[7px] font-semibold tracking-[0.18em] uppercase text-[#C6A15B] mt-1">Focus On Quality</span>
              </div>
            </Link>

            {/* Right: Wishlist Action */}
            <div className="flex items-center justify-end">
              <Link
                href={`/wishlist`}
                className="relative p-2 rounded-lg text-brand-muted hover:text-brand-secondary hover:bg-brand-surface transition-all duration-200"
                title="Wishlist"
              >
                <Heart className="h-5 w-5" strokeWidth={1.75} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-brand-secondary text-white text-[8px] font-black h-3.5 w-3.5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

        </div>

        {/* Dropdown Menu: Search first, then Categories */}
        {menuOpen && (
          <div className="border-t border-brand-border bg-white px-4 py-4 space-y-4 shadow-lg absolute w-full left-0 z-30">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center rounded-full bg-brand-surface border border-brand-border overflow-hidden focus-within:border-[#C6A15B] focus-within:ring-1 focus-within:ring-[#C6A15B]/40 transition-all duration-200">
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

            {/* Categories */}
            <div className="space-y-1">
              {categories.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={i}
                    href={`/shop`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-3.5 rounded-lg text-xs sm:text-sm font-semibold text-brand-text hover:bg-brand-surface hover:text-brand-primary transition-colors"
                  >
                    <Icon className="h-4.5 w-4.5 text-[#C6A15B]" strokeWidth={1.75} />
                    <span>{locale === 'bn' ? cat.bn : cat.en}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
