'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Home, ShoppingBag, ShoppingCart, Heart, Grid2X2, Crown, Flower2, Sprout, Frame, Flame, Sparkles, LayoutGrid, Gift } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';

export default function FooterNav() {
  const locale = useLocale();
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();

  const currentLocale = pathname.split('/')[1] || 'en';

  /* ── Mobile bottom nav items ── */
  const mobileNav = [
    { label_en: 'Home',  label_bn: 'হোম',  icon: Home,      href: `/${currentLocale}` },
    { label_en: 'Shop',  label_bn: 'শপ',   icon: ShoppingBag,    href: `/${currentLocale}/shop` },
    { label_en: 'Cart',  label_bn: 'কার্ট', icon: ShoppingCart, href: null },          // opens drawer
    { label_en: 'Deals', label_bn: 'অফার',  icon: Heart,     href: `/${currentLocale}/shop` },
    { label_en: 'More',  label_bn: 'আরো',  icon: Grid2X2,   href: `/${currentLocale}/shop` },
  ];

  return (
    <>
      {/* ════════════════════════════════════════════
          DESKTOP FOOTER (Also visible on Mobile)
      ════════════════════════════════════════════ */}
      <footer className="bg-[#111] text-white mt-0 mb-16 md:mb-0">
        {/* Top section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-10 grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand col */}
          <div className="md:col-span-1 space-y-5">
            {/* Logo */}
            <Link href={`/${currentLocale}`} className="flex items-center gap-2.5 group w-fit">
              <img
                src="/Sicily_icon.png"
                alt="Sicily Decor"
                className="h-10 w-10 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="leading-none">
                <span className="block text-[17px] font-black tracking-tight text-white">Sicily</span>
                <span className="block text-[7px] font-bold tracking-[0.08em] uppercase text-[#057476]">Focus On Quality</span>
              </div>
            </Link>

            <p className="text-gray-400 text-xs leading-relaxed max-w-[220px]">
              {locale === 'bn'
                ? 'বাংলাদেশের সেরা প্রিমিয়াম হোম ডেকোর স্টোর। হাতে তৈরি, মনে রাখার মতো।'
                : "Bangladesh's finest handcrafted home décor — made to be remembered."}
            </p>

            {/* Social icons */}
            <div className="flex gap-3">
              {/* Facebook */}
              <a href="#" className="h-8 w-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#057476] hover:text-white hover:border-[#057476] transition-all duration-200">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              {/* Instagram */}
              <a href="#" className="h-8 w-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#057476] hover:text-white hover:border-[#057476] transition-all duration-200">
                <svg className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
              {/* WhatsApp */}
              <a href="#" className="h-8 w-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#057476] hover:text-white hover:border-[#057476] transition-all duration-200">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
              {locale === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
            </h4>
            <ul className="space-y-2.5">
              {[
                { en: 'All Categories', bn: 'সব ক্যাটাগরি', icon: Crown, href: `/${currentLocale}/shop` },
                { en: 'Premium Flower Tub', bn: 'প্রিমিয়াম ফ্লাওয়ার টাব', icon: Flower2, href: `/${currentLocale}/shop` },
                { en: 'Premium Tree Plant', bn: 'প্রিমিয়াম ট্রি প্ল্যান্ট', icon: Sprout, href: `/${currentLocale}/shop` },
                { en: 'Premium Wall Stand', bn: 'প্রিমিয়াম ওয়াল স্ট্যান্ড', icon: Frame, href: `/${currentLocale}/shop` },
                { en: 'Candles & Holders', bn: 'ক্যান্ডেল ও হোল্ডার', icon: Flame, href: `/${currentLocale}/shop` },
                { en: 'Mirror & Frames', bn: 'আয়না ও ফ্রেম', icon: Sparkles, href: `/${currentLocale}/shop` },
                { en: 'Vases & Pots', bn: 'ভেজ ও পট', icon: LayoutGrid, href: `/${currentLocale}/shop` },
                { en: 'Gift Sets', bn: 'গিফট সেট', icon: Gift, href: `/${currentLocale}/shop` },
              ].map((l, i) => {
                const Icon = l.icon;
                return (
                  <li key={i}>
                    <Link href={l.href} className="text-xs text-gray-400 hover:text-[#00f0d2] transition-colors duration-200 flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-[#057476]" />
                      <span>{locale === 'bn' ? l.bn : l.en}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Info links */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
              {locale === 'bn' ? 'তথ্য' : 'Information'}
            </h4>
            <ul className="space-y-2.5">
              {[
                { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
                { en: 'Delivery Policy', bn: 'ডেলিভারি পলিসি' },
                { en: 'Return & Refund', bn: 'রিটার্ন ও রিফান্ড' },
                { en: 'Privacy Policy', bn: 'প্রাইভেসি পলিসি' },
                { en: 'Contact Us', bn: 'যোগাযোগ করুন' },
              ].map((l, i) => (
                <li key={i}>
                  <a href="#" className="text-xs text-gray-400 hover:text-[#00f0d2] transition-colors duration-200">
                    {locale === 'bn' ? l.bn : l.en}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & info */}
          <div className="space-y-5">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
              {locale === 'bn' ? 'যোগাযোগ' : 'Contact'}
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <span>{locale === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📞</span>
                <span>+880 17XX-XXXXXX</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📧</span>
                <span>hello@sicilydecor.com</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🕐</span>
                <span>{locale === 'bn' ? 'শনি–বৃহঃ, সকাল ১০টা–রাত ৮টা' : 'Sat–Thu, 10am–8pm'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 py-5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <p className="text-[11px] text-gray-500">
              © 2026 Sicily Decor. {locale === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
            </p>
            <img 
              src="/SSLCommerz-Pay-With-logo-All-Size-01.png" 
              alt="SSLCommerz Payment Methods" 
              className="h-10 md:h-12 object-contain bg-white rounded-lg p-1.5"
            />
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════════
          MOBILE BOTTOM NAV BAR
      ════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around px-2 h-16">
          {mobileNav.map((item, i) => {
            const Icon = item.icon;
            const label = locale === 'bn' ? item.label_bn : item.label_en;
            const isCart = item.href === null;
            const isActive = item.href ? pathname === item.href : false;

            if (isCart) {
              return (
                <button
                  key={i}
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex flex-col items-center justify-center flex-1 gap-1 text-[#057476]"
                >
                  {/* pill highlight */}
                  <div className="relative p-2 rounded-2xl bg-[#057476] shadow-md shadow-[#057476]/30">
                    <Icon className="h-5 w-5 text-white" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#D80064] text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-[#057476]">{label}</span>
                </button>
              );
            }

            return (
              <Link
                key={i}
                href={item.href!}
                className={`flex flex-col items-center justify-center flex-1 gap-1 transition-colors duration-200 ${isActive ? 'text-[#057476]' : 'text-gray-400 hover:text-[#057476]'}`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className={`text-[9px] font-bold ${isActive ? 'text-[#057476]' : ''}`}>{label}</span>
                {isActive && <span className="absolute bottom-0 h-0.5 w-5 rounded-full bg-[#057476]" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
