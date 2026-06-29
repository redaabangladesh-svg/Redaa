'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ShoppingCart, Heart, User, Search, ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import CartDrawer from '@/components/store/CartDrawer';
import { useState } from 'react';

const CATEGORIES = [
  { en: 'All Categories', bn: 'সব ক্যাটাগরি', icon: '🏠' },
  { en: 'Premium Flower Tub', bn: 'প্রিমিয়াম ফ্লাওয়ার টাব', icon: '🌺' },
  { en: 'Premium Tree Plant', bn: 'প্রিমিয়াম ট্রি প্ল্যান্ট', icon: '🌳' },
  { en: 'Premium Wall Stand', bn: 'প্রিমিয়াম ওয়াল স্ট্যান্ড', icon: '🖼️' },
  { en: 'Candles & Holders', bn: 'ক্যান্ডেল ও হোল্ডার', icon: '🕯️' },
  { en: 'Mirror & Frames', bn: 'আয়না ও ফ্রেম', icon: '🪞' },
  { en: 'Vases & Pots', bn: 'ভেজ ও পট', icon: '🪴' },
  { en: 'Gift Sets', bn: 'গিফট সেট', icon: '🎁' },
];

export default function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const currentLocale = pathname.split('/')[1] || 'en';

  const toggleLanguage = () => {
    const segments = pathname.split('/');
    segments[1] = segments[1] === 'en' ? 'bn' : 'en';
    router.push(segments.join('/'));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/${currentLocale}/shop?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <>
      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="w-full bg-[#057476] text-white py-2 px-4 text-[11px] font-semibold flex items-center justify-between">
        <span className="flex-1 text-center sm:text-left">
          🚚 {locale === 'bn' ? 'ঢাকায় ৳৫০০+ অর্ডারে ফ্রি ডেলিভারি' : 'Free Delivery in Dhaka on orders above ৳500'}
        </span>
        <div className="hidden sm:flex items-center gap-4 text-white/80 flex-shrink-0">
          <a href="#" className="hover:text-white transition-colors">সাহায্য ও সহায়তা</a>
          <span>·</span>
          <a href={`/${currentLocale}/admin/orders`} className="hover:text-white transition-colors">অর্ডার ট্র্যাক করুন</a>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">

            {/* Logo */}
            <Link href={`/${currentLocale}`} className="flex items-center gap-2.5 flex-shrink-0 group">
              <img
                src="/Sicily_icon.png"
                alt="Sicily Decor"
                className="h-10 w-10 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="leading-none space-y-0.5">
                <span className="block text-[22px] font-black tracking-tight text-[#111] leading-none">Sicily</span>
                <span className="block text-[7px] font-bold tracking-[0.15em] uppercase text-[#057476]">Focus On Quality</span>
              </div>
            </Link>

            {/* Desktop Nav links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-600 flex-shrink-0">
              <Link href={`/${currentLocale}`} className="hover:text-[#057476] transition-colors">
                {locale === 'bn' ? 'হোম' : 'Home'}
              </Link>
              <Link href={`/${currentLocale}/shop`} className="hover:text-[#057476] transition-colors">
                {locale === 'bn' ? 'শপ' : 'Shop'}
              </Link>
              <button className="flex items-center gap-1 hover:text-[#057476] transition-colors">
                {locale === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <Link href={`/${currentLocale}/shop`} className="hover:text-[#057476] transition-colors text-[#D80064] font-bold">
                {locale === 'bn' ? 'অফার' : 'Deals'}
              </Link>
            </nav>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 hidden sm:flex">
              <div className="flex w-full max-w-xl rounded-xl border border-gray-200 overflow-hidden hover:border-[#057476]/50 focus-within:border-[#057476] focus-within:ring-2 focus-within:ring-[#057476]/10 transition-all duration-200">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={locale === 'bn' ? 'পণ্য খুঁজুন...' : 'Search for products...'}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-white outline-none placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="px-4 bg-[#057476] text-white flex items-center justify-center hover:bg-[#008B8B] transition-colors"
                >
                  <Search className="h-4.5 w-4.5" />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto lg:ml-0">
              {/* Account */}
              <Link href={`/${currentLocale}`} className="hidden md:flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-[#057476] hover:bg-gray-50 transition-all duration-200 group">
                <User className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{locale === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}</span>
              </Link>

              {/* Wishlist */}
              <Link href={`/${currentLocale}/shop`} className="hidden md:flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-[#D80064] hover:bg-gray-50 transition-all duration-200 relative">
                <Heart className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{locale === 'bn' ? 'উইশলিস্ট' : 'Wishlist'}</span>
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="hidden sm:flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-[#057476] hover:bg-gray-50 transition-all duration-200 relative"
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#D80064] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold">{locale === 'bn' ? 'কার্ট' : 'Cart'}</span>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
            {[
              { en: 'Home', bn: 'হোম', href: `/${currentLocale}` },
              { en: 'Shop', bn: 'শপ', href: `/${currentLocale}/shop` },
              { en: 'Deals 🔥', bn: 'অফার 🔥', href: `/${currentLocale}/shop` },
            ].map((l, i) => (
              <Link key={i} href={l.href} onClick={() => setMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-[#057476]/5 hover:text-[#057476] transition-colors"
              >
                {locale === 'bn' ? l.bn : l.en}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <button onClick={toggleLanguage} className="py-2.5 px-3 text-sm font-bold text-[#057476]">
                {currentLocale === 'bn' ? '🇺🇸 Switch to English' : '🇧🇩 বাংলায় দেখুন'}
              </button>
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
