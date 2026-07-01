'use client';

import { useLocale } from 'next-intl';
import { ArrowRight, Star, Heart, Crown, Flower2, Sprout, Frame, Sparkles, ShoppingCart, Percent, Gift } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

/* ── BANNER SLIDES (image-only — all copy/CTA lives inside the banner artwork) ── */
const SLIDES = [
  { image: '/Banner1.png', alt_en: 'Summer Collection — Up to 50% Off', alt_bn: 'সামার কালেকশন — সর্বোচ্চ ৫০% ছাড়' },
  { image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=85&w=1200', alt_en: 'New Arrivals — Floral Stands', alt_bn: 'নতুন কালেকশন — ফ্লাওয়ার স্ট্যান্ড' },
  { image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=85&w=1200', alt_en: 'Exclusive Offer — Premium Planters', alt_bn: 'বিশেষ অফার — প্রিমিয়াম প্ল্যান্টার' },
];

/* ── SHOP BY CATEGORIES DATA ── */
const CAT_ICONS = [
  { en: 'All Categories', bn: 'সব ক্যাটাগরি', icon: Crown, bg: 'bg-brand-surface text-brand-secondary' },
  { en: 'Flower Tub',  bn: 'ফ্লাওয়ার টাব',  icon: Flower2, bg: 'bg-brand-surface text-brand-secondary' },
  { en: 'Tree Plant',  bn: 'ট্রি প্ল্যান্ট', icon: Sprout, bg: 'bg-brand-surface text-brand-primary' },
  { en: 'Wall Stand',  bn: 'ওয়াল স্ট্যান্ড', icon: Frame, bg: 'bg-brand-surface text-[#8A6A2E]' },
];

/* ── PRODUCTS ── */
const PRODUCTS = [
  { id:'1', name_en:'Premium Metal Flower Hanger', name_bn:'প্রিমিয়াম মেটাল ফ্লাওয়ার হ্যাঙ্গার', price:1250, sale_price:990,  image:'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=500', rating:4.8, reviews:24, discount:'-21%' },
  { id:'2', name_en:'Pastel Tulip Bouquet',        name_bn:'পেস্টেল টিউলিপ তোড়া',               price:850,  sale_price:null,  image:'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=500', rating:4.9, reviews:18, discount:null },
  { id:'3', name_en:'Vintage Wooden Wall Frame',   name_bn:'ভিন্টেজ কাঠের ওয়াল ফ্রেম',          price:1500, sale_price:1200,  image:'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=500', rating:4.7, reviews:32, discount:'-20%' },
  { id:'4', name_en:'Rose Gold Candle Set',        name_bn:'রোজ গোল্ড ক্যান্ডেল সেট',           price:680,  sale_price:540,   image:'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=500', rating:5.0, reviews:9,  discount:'-21%' },
  { id:'5', name_en:'Ceramic Flower Vase',         name_bn:'সিরামিক ফ্লাওয়ার ভেজ',              price:920,  sale_price:750,   image:'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=500', rating:4.6, reviews:14, discount:'-18%' },
  { id:'6', name_en:'Macrame Wall Hanging',        name_bn:'ম্যাক্রামে ওয়াল হ্যাঙ্গিং',         price:1100, sale_price:null,  image:'https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?auto=format&fit=crop&q=80&w=500', rating:4.8, reviews:21, discount:null },
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
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-800"
          style={{ opacity: active === i ? 1 : 0 }}
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

/* ── PRODUCT CARD ───────────────────────────────────── */
function ProductCard({ p, locale }: { p: typeof PRODUCTS[0]; locale: string }) {
  const [liked, setLiked] = useState(false);
  const name = locale === 'bn' ? p.name_bn : p.name_en;
  const price = p.sale_price ?? p.price;

  return (
    <div className="group bg-white rounded-2xl border border-brand-border hover:border-[#C6A15B]/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Wrapper */}
      <div className="relative aspect-square bg-brand-surface overflow-hidden">
        <Link href={`/${locale}/p/${p.id}`} className="block h-full w-full">
          <img src={p.image} alt={name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
        </Link>

        {/* Discount Ribbon (Top-left corner) */}
        {p.discount && (
          <span className="absolute top-2.5 left-2.5 bg-brand-secondary text-white text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wide shadow-sm">
            {p.discount}
          </span>
        )}

        {/* Wishlist Heart Icon (Top-right corner) */}
        <button
          onClick={() => setLiked(l => !l)}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/95 shadow-sm border border-brand-border hover:scale-110 hover:border-brand-secondary/40 transition-all"
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-brand-secondary text-brand-secondary' : 'text-brand-muted'}`} strokeWidth={1.75} />
        </button>

        {/* Quick-add overlay (appears on hover) */}
        <Link
          href={`/${locale}/p/${p.id}`}
          className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 bg-[#14201D]/90 backdrop-blur-sm text-[#C6A15B] text-[10px] font-bold uppercase tracking-widest py-2 flex items-center justify-center gap-1.5 transition-transform duration-300"
        >
          <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>{locale === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
        </Link>
      </div>

      {/* Product Details Section */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-brand-text leading-snug line-clamp-2 hover:text-brand-primary transition-colors">
            <Link href={`/${locale}/p/${p.id}`}>{name}</Link>
          </h3>

          {/* Star rating info */}
          <div className="flex items-center gap-0.5 text-[#C6A15B] mt-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-2.5 w-2.5 ${i < Math.round(p.rating) ? 'fill-current' : 'fill-none text-brand-border'}`} strokeWidth={1.5} />
            ))}
            <span className="text-[9px] text-brand-muted font-semibold ml-1">({p.reviews})</span>
          </div>
        </div>

        {/* Price & Cart button row */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-brand-border/70">
          <div className="pt-1.5">
            <span className="text-sm sm:text-base font-bold text-brand-secondary block">৳{price}</span>
            {p.sale_price && (
              <span className="text-[10px] text-brand-muted line-through block mt-0.5">৳{p.price}</span>
            )}
          </div>

          {/* Circular Shopping Cart Button */}
          <Link
            href={`/${locale}/p/${p.id}`}
            className="h-9 w-9 rounded-full bg-brand-primary text-white hover:bg-brand-primary-alt shadow-sm flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all flex-shrink-0 mt-1.5"
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN PAGE ──────────────────────────────────────── */
export default function HomePage() {
  const locale = useLocale();

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
          <Link href={`/${locale}/shop`} className="text-[11px] font-semibold text-brand-primary hover:text-brand-secondary transition-colors uppercase tracking-wide">
            {locale === 'bn' ? 'সব দেখুন' : 'View all'}
          </Link>
        </div>

        {/* Categories Row scrollable on mobile */}
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4">
          {CAT_ICONS.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link key={i} href={`/${locale}/shop`}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-brand-text tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#C6A15B]" strokeWidth={1.75} />
              <span>{locale === 'bn' ? 'ফ্ল্যাশ ডিলস' : 'Flash Deals'}</span>
            </h2>
            <FlashCountdown locale={locale} />
          </div>

          <Link href={`/${locale}/shop`} className="text-[11px] font-semibold text-brand-primary hover:text-brand-secondary transition-colors uppercase tracking-wide self-start sm:self-auto">
            {locale === 'bn' ? 'সব দেখুন' : 'View all'}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {PRODUCTS.slice(0, 3).map((p, i) => <ProductCard key={i} p={p} locale={locale} />)}
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
            <span className="inline-block border border-[#C6A15B]/60 text-[#C6A15B] px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider">
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
            <Link href={`/${locale}/shop`} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary hover:text-[#C6A15B] transition-colors">
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
          <Link href={`/${locale}/shop`} className="text-[11px] font-semibold text-brand-primary hover:text-brand-secondary transition-colors uppercase tracking-wide">
            {locale === 'bn' ? 'সব দেখুন' : 'View all'}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {PRODUCTS.slice(3, 6).map((p, i) => <ProductCard key={i} p={p} locale={locale} />)}
        </div>
      </section>

    </div>
  );
}
