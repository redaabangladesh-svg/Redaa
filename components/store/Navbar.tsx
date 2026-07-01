'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Heart, Menu, X, Search, Crown, Flower2, Sprout, Frame } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const currentLocale = pathname.split('/')[1] === 'en' ? 'en' : 'bn';

  const categories = [
    { en: 'All Categories',      bn: 'সব ক্যাটাগরি',            icon: Crown },
    { en: 'Premium Flower Tub',  bn: 'প্রিমিয়াম ফ্লাওয়ার টাব',  icon: Flower2 },
    { en: 'Premium Tree Plant',  bn: 'প্রিমিয়াম ট্রি প্ল্যান্ট', icon: Sprout },
    { en: 'Premium Wall Stand',  bn: 'প্রিমিয়াম ওয়াল স্ট্যান্ড', icon: Frame },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/${currentLocale}/shop?q=${encodeURIComponent(search.trim())}`);
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

            {/* Left: Hamburger Menu Trigger */}
            <div className="flex items-center justify-start">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="h-10 w-10 flex items-center justify-center rounded-full border border-brand-border text-brand-text hover:border-[#C6A15B] hover:text-[#C6A15B] hover:bg-brand-surface active:scale-95 focus:outline-none transition-all duration-200"
              >
                {menuOpen ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
              </button>
            </div>

            {/* Center: Brand Logo & Tagline (matches footer lockup) */}
            <Link href={`/${currentLocale}`} className="flex items-center gap-2.5 group select-none justify-self-center">
              <img
                src="/Sicily_icon.png"
                alt="Sicily"
                className="h-9 w-9 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="leading-none text-left">
                <span className="block text-[19px] font-serif font-semibold tracking-tight text-brand-text">Sicily</span>
                <span className="block text-[7px] font-semibold tracking-[0.18em] uppercase text-[#C6A15B] mt-1">Focus On Quality</span>
              </div>
            </Link>

            {/* Right: Wishlist Action */}
            <div className="flex items-center justify-end">
              <Link
                href={`/${currentLocale}/shop`}
                className="p-2 rounded-lg text-brand-muted hover:text-brand-secondary hover:bg-brand-surface transition-all duration-200"
                title="Wishlist"
              >
                <Heart className="h-5 w-5" strokeWidth={1.75} />
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
                    href={`/${currentLocale}/shop`}
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
