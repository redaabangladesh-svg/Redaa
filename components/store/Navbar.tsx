'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ShoppingCart, Heart, Search, Menu, X, SlidersHorizontal } from 'lucide-react';
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
      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="w-full bg-[#057476] text-white py-2 px-4 text-[11px] font-semibold flex items-center justify-between">
        <span className="flex-1 text-center sm:text-left">
          🚚 {locale === 'bn' ? 'ঢাকায় ৳৫০০+ অর্ডারে ফ্রি ডেলিভারি' : 'Free Delivery in Dhaka on orders above ৳500'}
        </span>
        <div className="hidden sm:flex items-center gap-4 text-white/80 flex-shrink-0">
          <a href="#" className="hover:text-white transition-colors">{locale === 'bn' ? 'সাহায্য ও সহায়তা' : 'Help & Support'}</a>
          <span>·</span>
          <a href={`/${currentLocale}/admin/orders`} className="hover:text-white transition-colors">{locale === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}</a>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          
          {/* Header Row: Hamburger | Logo | Action Buttons (Heart, Cart) */}
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-50 focus:outline-none transition-colors"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Center: Brand Logo & Tagline */}
            <Link href={`/${currentLocale}`} className="flex items-center gap-2 group select-none">
              <img
                src="/Sicily_icon.png"
                alt="Sicily Decor"
                className="h-9 w-9 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="leading-none text-left">
                <span className="block text-[17px] font-black tracking-tight text-[#111]">Sicily Decor</span>
                <span className="block text-[9px] font-semibold text-gray-400 mt-0.5">
                  {locale === 'bn' ? 'কোয়ালিটি ও নান্দনিকতা' : 'Shop More, Save More'}
                </span>
              </div>
            </Link>

            {/* Right: Wishlist & Cart Actions */}
            <div className="flex items-center gap-1">
              {/* Wishlist Link */}
              <Link 
                href={`/${currentLocale}/shop`} 
                className="p-2 rounded-xl text-gray-500 hover:text-[#D80064] hover:bg-gray-50 transition-all duration-200 relative"
                title="Wishlist"
              >
                <Heart className="h-5.5 w-5.5" />
              </Link>

              {/* Shopping Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 rounded-xl text-gray-500 hover:text-[#057476] hover:bg-gray-50 transition-all duration-200 relative"
                title="Cart"
              >
                <ShoppingCart className="h-5.5 w-5.5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#057476] text-white text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center border border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Input Bar with Filter Icon (Matches reference UI exactly) */}
          <div className="mt-3.5">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 flex items-center rounded-xl bg-gray-50/80 border border-gray-200/60 overflow-hidden hover:border-[#057476]/30 focus-within:border-[#057476] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#057476]/10 transition-all duration-200">
                <div className="pl-3.5 text-gray-400">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={locale === 'bn' ? 'পণ্য, ক্যাটাগরি বা ব্র্যান্ড খুঁজুন...' : 'Search for products, categories...'}
                  className="flex-1 px-3 py-2.5 text-xs sm:text-sm text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                className="p-3 bg-gray-50/80 hover:bg-gray-100/80 text-gray-500 rounded-xl border border-gray-200/60 hover:text-[#057476] transition-all flex items-center justify-center"
                title="Filters"
              >
                <SlidersHorizontal className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Mobile Navigation Drawer Menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1 shadow-lg absolute w-full left-0 z-30">
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
                className="block py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-[#057476]/5 hover:text-[#057476] transition-colors"
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
