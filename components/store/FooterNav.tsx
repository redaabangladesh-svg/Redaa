'use client';

import type { ComponentType } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Home, ShoppingCart, Crown, Flower2, Sprout, Frame, LayoutGrid, Info, Truck, RefreshCw, ShieldAlert, Phone, MapPin, PhoneCall, Mail, User, PackageSearch } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export default function FooterNav() {
  const locale = useLocale();
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();

  /* ── Mobile bottom nav items: Home/Shop/Cart/Live Chat/Account ── */
  interface MobileNavItem {
    label_en: string;
    label_bn: string;
    icon: ComponentType<{ className?: string }>;
    href?: string;
    action?: 'cart';
    badge?: number;
  }

  const mobileNav: MobileNavItem[] = [
    { label_en: 'Home',      label_bn: 'হোম',        icon: Home,         href: `/` },
    { label_en: 'Shop',      label_bn: 'শপ',         icon: LayoutGrid,   href: `/shop` },
    { label_en: 'Cart',      label_bn: 'কার্ট',       icon: ShoppingCart, action: 'cart' },
    { label_en: 'Live Chat', label_bn: 'লাইভ চ্যাট',  icon: WhatsAppIcon, href: `/live-chat` },
    { label_en: 'Account',   label_bn: 'প্রোফাইল',     icon: User,         href: `/account` },
  ];

  return (
    <>
      {/* ════════════════════════════════════════════
          DESKTOP FOOTER (Also visible on Mobile)
      ════════════════════════════════════════════ */}
      <footer className="bg-[#14201D] text-[#F2EDE3] mt-0 mb-16 md:mb-0">
        {/* Top section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-10 grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand col */}
          <div className="md:col-span-1 space-y-5">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <img
                src="/Sicily_icon.png"
                alt="Sicily"
                className="h-10 w-10 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="leading-none text-left">
                <span className="block text-[19px] font-serif font-semibold tracking-tight text-white">Sicily</span>
                <span className="block text-[7px] font-semibold tracking-[0.18em] uppercase text-[#C6A15B] mt-1">মান নিয়ে আপোষহীন</span>
              </div>
            </Link>

            <p className="text-[#F2EDE3]/50 text-xs leading-relaxed max-w-[220px]">
              {locale === 'bn'
                ? 'বাংলাদেশের সেরা প্রিমিয়াম হোম ডেকোর স্টোর। হাতে তৈরি, মনে রাখার মতো।'
                : "Bangladesh's finest handcrafted home décor — made to be remembered."}
            </p>

            {/* Social icons */}
            <div className="flex gap-3">
              {/* Facebook */}
              <a href="https://www.facebook.com/sicily7273" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#F2EDE3]/60 hover:bg-[#C6A15B] hover:text-[#14201D] hover:border-[#C6A15B] transition-all duration-200">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/sicilybd7273" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#F2EDE3]/60 hover:bg-[#C6A15B] hover:text-[#14201D] hover:border-[#C6A15B] transition-all duration-200">
                <svg className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/8801788825495" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#F2EDE3]/60 hover:bg-[#C6A15B] hover:text-[#14201D] hover:border-[#C6A15B] transition-all duration-200">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick links — hidden on mobile, shown on desktop */}
          <div className="hidden md:block space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F2EDE3]/40 relative pb-2.5">
              {locale === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
              <span className="absolute left-0 bottom-0 h-px w-6 bg-[#C6A15B]" />
            </h4>
            <ul className="space-y-2.5">
              {[
                { en: 'All Categories', bn: 'সব ক্যাটাগরি', icon: Crown, href: `/shop` },
                { en: 'Premium Flower Tub', bn: 'প্রিমিয়াম ফ্লাওয়ার টাব', icon: Flower2, href: `/shop` },
                { en: 'Premium Tree Plant', bn: 'প্রিমিয়াম ট্রি প্ল্যান্ট', icon: Sprout, href: `/shop` },
                { en: 'Premium Wall Stand', bn: 'প্রিমিয়াম ওয়াল স্ট্যান্ড', icon: Frame, href: `/shop` },
              ].map((l, i) => {
                const Icon = l.icon;
                return (
                  <li key={i}>
                    <Link href={l.href} className="text-xs text-[#F2EDE3]/55 hover:text-[#FF3D9A] transition-colors duration-200 flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-[#C6A15B]/70" strokeWidth={1.75} />
                      <span>{locale === 'bn' ? l.bn : l.en}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Info + Contact — side by side on mobile, separate columns on desktop */}
          <div className="grid grid-cols-2 gap-6 md:contents">

          {/* Info links */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F2EDE3]/40 relative pb-2.5">
              {locale === 'bn' ? 'তথ্য' : 'Information'}
              <span className="absolute left-0 bottom-0 h-px w-6 bg-[#C6A15B]" />
            </h4>
            <ul className="space-y-2.5">
              {[
                { en: 'About Us', bn: 'আমাদের সম্পর্কে', icon: Info, href: `/about` },
                { en: 'FAQ', bn: 'সচরাচর জিজ্ঞাসা', icon: Info, href: `/faq` },
                { en: 'Blog', bn: 'ব্লগ', icon: Info, href: `/blog` },
                { en: 'Track Order', bn: 'অর্ডার ট্র্যাক করুন', icon: PackageSearch, href: `/track-order` },
                { en: 'Delivery Policy', bn: 'ডেলিভারি পলিসি', icon: Truck, href: `/delivery-policy` },
                { en: 'Return & Refund', bn: 'রিটার্ন ও রিফান্ড', icon: RefreshCw, href: `/return-refund` },
                { en: 'Privacy Policy', bn: 'প্রাইভেসি পলিসি', icon: ShieldAlert, href: `/privacy-policy` },
                { en: 'Contact Us', bn: 'যোগাযোগ করুন', icon: Phone, href: `/contact` },
              ].map((l, i) => {
                const Icon = l.icon;
                return (
                  <li key={i}>
                    <Link href={l.href} className="text-xs text-[#F2EDE3]/55 hover:text-[#FF3D9A] transition-colors duration-200 flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-[#C6A15B]/70 flex-shrink-0" strokeWidth={1.75} />
                      <span>{locale === 'bn' ? l.bn : l.en}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact & info */}
          <div className="space-y-5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F2EDE3]/40 relative pb-2.5">
              {locale === 'bn' ? 'যোগাযোগ' : 'Contact'}
              <span className="absolute left-0 bottom-0 h-px w-6 bg-[#C6A15B]" />
            </h4>
            <ul className="space-y-3 text-xs text-[#F2EDE3]/55">
              <li className="flex items-center gap-2.5">
                <span className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-[#C6A15B]" strokeWidth={1.75} />
                </span>
                <span>{locale === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <PhoneCall className="h-3.5 w-3.5 text-[#C6A15B]" strokeWidth={1.75} />
                </span>
                <span>01788-825495</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-3.5 w-3.5 text-[#C6A15B]" strokeWidth={1.75} />
                </span>
                <span>info.sicilybd@gmail.com</span>
              </li>
            </ul>
          </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-4">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center gap-2">
            <img
              src="/SSLCommerz-Pay-With-logo-All-Size-01.png"
              alt="এসএসএলকমার্স পেমেন্ট মেথড"
              className="h-14 md:h-16 object-contain"
            />
            <p className="text-[11px] text-[#F2EDE3]/35">
              © 2026 Sicily. {locale === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════════
          MOBILE BOTTOM NAV BAR (Flat card layout)
      ════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-brand-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around px-2 h-16">
          {mobileNav.map((item, i) => {
            const Icon = item.icon;
            const label = locale === 'bn' ? item.label_bn : item.label_en;

            if (item.action === 'cart') {
              return (
                <button
                  key={i}
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex flex-col items-center justify-center flex-1 gap-1 text-brand-muted hover:text-brand-primary transition-colors duration-200"
                >
                  <Icon className="h-5 w-5 stroke-[1.6]" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-1/2 translate-x-3 bg-brand-secondary text-white text-[8px] font-black h-3.5 w-3.5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                  <span className="text-[9px] font-bold">{label}</span>
                </button>
              );
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={i}
                href={item.href!}
                className={`relative flex flex-col items-center justify-center flex-1 gap-1 transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-brand-muted hover:text-brand-primary'}`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
                {!!item.badge && item.badge > 0 && (
                  <span className="absolute top-0 right-1/2 translate-x-3 bg-brand-secondary text-white text-[8px] font-black h-3.5 w-3.5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                <span className={`text-[9px] font-bold ${isActive ? 'text-brand-primary' : ''}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
