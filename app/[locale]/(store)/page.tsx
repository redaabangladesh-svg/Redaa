'use client';

import { useLocale } from 'next-intl';
import { ArrowRight, Crown, Flower2, Sprout, Frame, Sparkles, Percent, Gift } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import type { HomeProduct } from '@/lib/products';
import { fetchProducts } from '@/lib/products-db';
import ProductCard from '@/components/store/ProductCard';
import InstagramFeed from '@/components/widgets/InstagramFeed';

/* ── BANNER SLIDES (image-only — all copy/CTA lives inside the banner artwork) ── */
const SLIDES = [
  { image: '/header-image-1.png', alt_en: 'Online Payment — Instant 10% Discount', alt_bn: 'অনলাইন পেমেন্টে ইনস্ট্যান্ট ১০% ডিসকাউন্ট' },
  { image: '/header-image-2.png', alt_en: 'Premium Swing Stand', alt_bn: 'প্রিমিয়াম দোলনা স্ট্যান্ড' },
  { image: '/header-image-3.png', alt_en: "Decorate Your Home Naturally", alt_bn: 'প্রকৃতির ছোঁয়ায় সাজুক আপনার ঘর' },
  { image: '/header-image-4.png', alt_en: 'Premium Bird Nest', alt_bn: 'প্রিমিয়াম বার্ড নেস্ট' },
  { image: '/header-image-5.png', alt_en: 'Premium Swing Stand', alt_bn: 'প্রিমিয়াম দোলনা স্ট্যান্ড' },
];

/* ── SHOP BY CATEGORIES DATA ── */
const CAT_ICONS = [
  { en: 'All Categories', bn: 'সব ক্যাটাগরি', icon: Crown, bg: 'bg-brand-surface text-brand-primary' },
  { en: 'Flower Tub',  bn: 'ফ্লাওয়ার টাব',  icon: Flower2, bg: 'bg-brand-surface text-brand-primary' },
  { en: 'Tree Plant',  bn: 'ট্রি প্ল্যান্ট', icon: Sprout, bg: 'bg-brand-surface text-brand-primary' },
  { en: 'Wall Stand',  bn: 'ওয়াল স্ট্যান্ড', icon: Frame, bg: 'bg-brand-surface text-brand-primary' },
];

/* ── HERO SLIDER ────────────────────────────────────── */
function HeroSlider({ locale }: { locale: string }) {
  const [active, setActive] = useState(0);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const reset = (i: number) => {
    setActive(i);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setActive(p => (p + 1) % SLIDES.length), 5000);
  };

  useEffect(() => {
    reset(0);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-none sm:rounded-2xl h-[240px] sm:h-[320px] md:h-[360px] shadow-sm">
      {/* Full-bleed slide images — no text/CTA overlay, banner artwork carries the copy */}
      {SLIDES.map((slide, i) => (
        <img
          key={i}
          src={slide.image}
          alt={locale === 'bn' ? slide.alt_bn : slide.alt_en}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: active === i ? 1 : 0, transition: 'opacity 900ms ease-in-out' }}
        />
      ))}

      {/* Pagination Dot Indicators (Bottom center) */}
      <div className="absolute bottom-4 left-6 sm:left-12 flex gap-1.5 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => reset(i)}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: active === i ? 22 : 6,
              background: active === i ? '#E6027C' : 'rgba(255,255,255,0.6)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── FLASH DEALS COUNTDOWN ──────────────────────────── */
function FlashCountdown({ locale }: { locale: string }) {
  const [seconds, setSeconds] = useState(2 * 3600 + 45 * 60 + 30);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(s => (s > 0 ? s - 1 : 9 * 3600 + 59 * 60 + 59));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const units = [
    { value: hh, label_en: 'HRS', label_bn: 'ঘণ্টা' },
    { value: mm, label_en: 'MIN', label_bn: 'মিনিট' },
    { value: ss, label_en: 'SEC', label_bn: 'সেকেন্ড' },
  ];

  return (
    <div className="flex items-center gap-1">
      {units.map((u, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="flex flex-col items-center min-w-[30px]">
            <span className="text-xs font-bold text-brand-secondary font-mono leading-none tabular-nums">{u.value}</span>
            <span className="text-[6.5px] font-semibold text-brand-muted uppercase tracking-wider mt-0.5">
              {locale === 'bn' ? u.label_bn : u.label_en}
            </span>
          </div>
          {i < units.length - 1 && <span className="text-brand-muted font-bold text-xs">:</span>}
        </div>
      ))}
    </div>
  );
}

/* ── MAIN PAGE ──────────────────────────────────────── */
export default function HomePage() {
  const locale = useLocale();
  const [products, setProducts] = useState<HomeProduct[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  return (
    <div className="bg-white min-h-screen pb-16">

      {/* ══════════════════════════════════════════
          1. HERO AREA: Banner slider
      ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        <HeroSlider locale={locale} />
      </div>

      {/* ══════════════════════════════════════════
          2. SHOP BY CATEGORY — Icon row with scroll
      ══════════════════════════════════════════ */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-base sm:text-lg font-semibold text-brand-text tracking-tight">
            {locale === 'bn' ? 'ক্যাটাগরি অনুযায়ী শপ করুন' : 'Shop by Category'}
          </h2>
          <Link href={`/shop`} className="text-[11px] font-semibold text-brand-primary hover:text-brand-secondary transition-colors uppercase tracking-wide">
            {locale === 'bn' ? 'সব দেখুন' : 'View all'}
          </Link>
        </div>

        {/* Categories Row scrollable on mobile */}
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4">
          {CAT_ICONS.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link key={i} href={`/shop`}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-3.5 bg-white rounded-xl border border-brand-border hover:border-[#C6A15B]/40 hover:shadow-sm transition-all duration-200 w-[100px] sm:w-auto"
              >
                {/* Rounded Icon tint background */}
                <div className={`h-11 w-11 rounded-full flex items-center justify-center ${cat.bg} border border-brand-border`}>
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <span className="text-[10px] font-semibold text-brand-muted text-center leading-tight">
                  {locale === 'bn' ? cat.bn : cat.en}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. FLASH DEALS WITH COUNTDOWN TIMER
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2 className="font-serif text-base sm:text-lg font-semibold text-brand-text tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#C6A15B]" strokeWidth={1.75} />
            <span>{locale === 'bn' ? 'ফ্ল্যাশ ডিলস' : 'Flash Deals'}</span>
          </h2>

          <div className="flex items-center gap-3">
            <FlashCountdown locale={locale} />
            <Link href={`/shop`} className="text-[11px] font-semibold text-brand-primary hover:text-brand-secondary transition-colors uppercase tracking-wide">
              {locale === 'bn' ? 'সব দেখুন' : 'View all'}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {products.slice(0, 6).map((p) => <ProductCard key={p.id} p={p} locale={locale} />)}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. PROMO BANNERS DOUBLE ROW
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Left card Promo — wine-toned signature card */}
        <div className="relative rounded-xl p-6 overflow-hidden bg-gradient-to-br from-brand-secondary to-brand-secondary-dark text-white flex flex-col justify-between min-h-[120px] border border-white/10">
          <div className="absolute right-4 bottom-2 opacity-10">
            <Percent className="h-20 w-20" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-lg font-semibold tracking-tight">{locale === 'bn' ? 'অতিরিক্ত ১০% ছাড়!' : 'Get Extra 10% Off'}</h3>
            <p className="text-[10px] text-white/60 font-medium">{locale === 'bn' ? 'আপনার প্রথম অর্ডারে পাবেন' : 'Applicable on your first order'}</p>
          </div>
          <div className="pt-3">
            <span className="inline-block border border-white/50 bg-white/10 text-white px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider">
              {locale === 'bn' ? 'কোড: WELCOME10' : 'Use Code: WELCOME10'}
            </span>
          </div>
        </div>

        {/* Right card Promo */}
        <div className="relative rounded-xl p-6 overflow-hidden bg-brand-surface text-brand-text flex flex-col justify-between min-h-[120px] border border-brand-border">
          <div className="absolute right-4 bottom-2 opacity-[0.08]">
            <Gift className="h-20 w-20 text-[#C6A15B]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-lg font-semibold tracking-tight">{locale === 'bn' ? 'ফ্রি ডেলিভারি পাবেন' : 'Complimentary Shipping'}</h3>
            <p className="text-[10px] text-brand-muted font-medium">{locale === 'bn' ? '৳১৯৯৯+ মূল্যের সকল অর্ডারে' : 'On all orders above ৳1999'}</p>
          </div>
          <div className="pt-3">
            <Link href={`/shop`} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary hover:text-[#C6A15B] transition-colors">
              <span>{locale === 'bn' ? 'এখনই কিনুন' : 'Shop Now'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. FEATURED PRODUCTS
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-base sm:text-lg font-semibold text-brand-text tracking-tight">
            {locale === 'bn' ? 'ফিচার্ড প্রোডাক্টস' : 'Featured Products'}
          </h2>
          <Link href={`/shop`} className="text-[11px] font-semibold text-brand-primary hover:text-brand-secondary transition-colors uppercase tracking-wide">
            {locale === 'bn' ? 'সব দেখুন' : 'View all'}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {products.slice(6, 12).map((p) => <ProductCard key={p.id} p={p} locale={locale} />)}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. CUSTOMER PHOTOS (Instagram-style UGC)
      ══════════════════════════════════════════ */}
      <InstagramFeed />

    </div>
  );
}
