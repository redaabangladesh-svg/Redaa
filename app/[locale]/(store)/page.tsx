'use client';

import { useLocale } from 'next-intl';
import { ArrowRight, Star, Heart, ShieldCheck, Truck, RefreshCw, Headphones, ChevronRight, Crown, Flower2, Sprout, Frame, Timer, Zap, ShoppingCart, Percent, Gift } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

/* ── BANNER SLIDES ─────────────────────────────────── */
const SLIDES = [
  {
    tag_en: 'SUMMER SALE', tag_bn: 'সামার সেল',
    title_en: 'UP TO 50% OFF', title_bn: 'সর্বোচ্চ ৫০% ছাড়',
    sub_en: 'Great deals on top premium products', sub_bn: 'সবচেয়ে জনপ্রিয় প্রিমিয়াম পণ্যের ওপর সেরা অফার',
    cta_en: 'Shop Now', cta_bn: 'এখনই কিনুন',
    image: '/Banner1.png',
    bg: 'from-[#057476] via-[#04595B] to-[#111]',
  },
  {
    tag_en: 'NEW ARRIVALS', tag_bn: 'নতুন কালেকশন',
    title_en: 'FLORAL STANDS', title_bn: 'ফ্লাওয়ার স্ট্যান্ড',
    sub_en: 'Preserved dry flowers & mahogany frames', sub_bn: 'হাতে তৈরি মেহগনি ফ্রেম ও ফুলের শোপিস',
    cta_en: 'Explore Now', cta_bn: 'সব দেখুন',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=85&w=700',
    bg: 'from-[#D80064] via-[#A8004D] to-[#111]',
  },
  {
    tag_en: 'EXCLUSIVE OFFER', tag_bn: 'বিশেষ অফার',
    title_en: 'PREMIUM PLANTERS', title_bn: 'প্রিমিয়াম প্ল্যান্টার',
    sub_en: 'Ceramic & metal pots for indoor plants', sub_bn: 'ইনডোর গাছের জন্য মেটাল ও সিরামিক পট',
    cta_en: 'View Deals', cta_bn: 'অফার দেখুন',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=85&w=700',
    bg: 'from-[#1e3a8a] via-[#172554] to-[#111]',
  },
];

/* ── SHOP BY CATEGORIES DATA ── */
const CAT_ICONS = [
  { en: 'All Categories', bn: 'সব ক্যাটাগরি', icon: Crown, bg: 'bg-teal-50 text-[#057476]' },
  { en: 'Flower Tub',  bn: 'ফ্লাওয়ার টাব',  icon: Flower2, bg: 'bg-pink-50 text-pink-600' },
  { en: 'Tree Plant',  bn: 'ট্রি প্ল্যান্ট', icon: Sprout, bg: 'bg-emerald-50 text-emerald-600' },
  { en: 'Wall Stand',  bn: 'ওয়াল স্ট্যান্ড', icon: Frame, bg: 'bg-amber-50 text-amber-600' },
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
    <div className="relative overflow-hidden rounded-3xl h-[220px] sm:h-[300px] md:h-[340px] shadow-sm">
      {/* Background gradients */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-gradient-to-r ${slide.bg} transition-opacity duration-800 flex items-center justify-between px-6 sm:px-12 md:px-16`}
          style={{ opacity: active === i ? 1 : 0 }}
        >
          
          {/* Left Text details */}
          <div className="space-y-2 sm:space-y-3.5 z-10 max-w-[60%] text-left text-white" style={{ animation: active === i ? 'fadeSlideUp 0.5s ease-out both' : '' }}>
            <span className="inline-block text-[9px] sm:text-xs font-black tracking-widest text-[#00f0d2]/90 uppercase">
              {locale === 'bn' ? slide.tag_bn : slide.tag_en}
            </span>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {locale === 'bn' ? slide.title_bn : slide.title_en}
            </h2>
            <p className="text-[10px] sm:text-xs text-white/70 font-medium leading-relaxed max-w-sm hidden sm:block">
              {locale === 'bn' ? slide.sub_bn : slide.sub_en}
            </p>
            <div className="pt-1.5">
              <Link
                href={`/${locale}/shop`}
                className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-white text-gray-900 font-extrabold text-[10px] sm:text-xs hover:bg-[#00f0d2] hover:text-black transition-all duration-300 shadow-sm"
              >
                <span>{locale === 'bn' ? slide.cta_bn : slide.cta_en}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right floating product visual */}
          <div className="relative h-full w-[40%] flex items-center justify-center select-none">
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56">
              <div className="absolute inset-0 rounded-full bg-white/10 blur-xl animate-pulse" />
              <img
                src={slide.image}
                alt=""
                className="h-full w-full object-contain relative z-10 drop-shadow-2xl transition-transform duration-[6000ms]"
                style={{ transform: active === i ? 'scale(1.02) rotate(1deg)' : 'scale(0.96) rotate(-2deg)' }}
              />
            </div>
          </div>

        </div>
      ))}

      {/* Pagination Dot Indicators (Bottom center) */}
      <div className="absolute bottom-3 left-6 sm:left-12 flex gap-1.5 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => reset(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: active === i ? 20 : 6,
              background: active === i ? '#ffffff' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── PRODUCT CARD ───────────────────────────────────── */
function ProductCard({ p, locale }: { p: typeof PRODUCTS[0]; locale: string }) {
  const [liked, setLiked] = useState(false);
  const name = locale === 'bn' ? p.name_bn : p.name_en;
  const price = p.sale_price ?? p.price;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200/60 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Wrapper */}
      <div className="relative aspect-square bg-[#fcfbfa] overflow-hidden">
        <Link href={`/${locale}/p/${p.id}`} className="block h-full w-full">
          <img src={p.image} alt={name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </Link>
        
        {/* Discount Badge (Top-left corner) */}
        {p.discount && (
          <span className="absolute top-2 left-2 bg-[#D80064] text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-sm">
            {p.discount}
          </span>
        )}

        {/* Wishlist Heart Icon (Top-right corner) */}
        <button
          onClick={() => setLiked(l => !l)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow hover:scale-110 transition-transform"
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-[#D80064] text-[#D80064]' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* Product Details Section */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-1.5">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-[#111] leading-snug line-clamp-2 hover:text-[#057476] transition-colors">
            <Link href={`/${locale}/p/${p.id}`}>{name}</Link>
          </h3>
          
          {/* Star rating info */}
          <div className="flex items-center gap-0.5 text-yellow-400 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-2.5 w-2.5 fill-current" />
            ))}
            <span className="text-[9px] text-gray-400 font-bold ml-1">({p.reviews})</span>
          </div>
        </div>

        {/* Price & Cart button row */}
        <div className="flex items-center justify-between gap-1 pt-1">
          <div>
            <span className="text-xs sm:text-sm font-black text-[#111] block">৳{price}</span>
            {p.sale_price && (
              <span className="text-[10px] text-gray-400 line-through block mt-0.5">৳{p.price}</span>
            )}
          </div>
          
          {/* Circular Shopping Cart Button (Matches reference image) */}
          <Link
            href={`/${locale}/p/${p.id}`}
            className="h-8.5 w-8.5 rounded-full bg-[#057476] text-white hover:bg-[#008B8B] shadow flex items-center justify-center hover:-translate-y-0.5 transition-transform flex-shrink-0"
          >
            <ShoppingCart className="h-4 w-4" />
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
    <div className="bg-[#f8f9fa] min-h-screen pb-16">

      {/* ══════════════════════════════════════════
          1. HERO AREA: Banner slider
      ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <HeroSlider locale={locale} />
      </div>

      {/* ══════════════════════════════════════════
          2. TRUST STRIP
      ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4.5 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-3 px-2 sm:px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:divide-x md:divide-gray-100">
            {[
              { icon: <ShieldCheck className="h-5 w-5 text-[#057476]" />, t_en: 'Secure Payment', t_bn: 'নিরাপদ পেমেন্ট' },
              { icon: <Truck className="h-5 w-5 text-[#057476]" />, t_en: 'Fast & Free Delivery', t_bn: 'ফ্রি ও দ্রুত ডেলিভারি' },
              { icon: <RefreshCw className="h-5 w-5 text-[#057476]" />, t_en: 'Easy Returns', t_bn: 'সহজ রিটার্ন পলিসি' },
              { icon: <Headphones className="h-5 w-5 text-[#057476]" />, t_en: '24/7 Support', t_bn: '২৪/৭ কাস্টমার সাপোর্ট' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2.5 justify-center md:px-5">
                <div className="flex-shrink-0">{t.icon}</div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-600">{locale === 'bn' ? t.t_bn : t.t_en}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          3. SHOP BY CATEGORY — Icon row with scroll
      ══════════════════════════════════════════ */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm sm:text-base font-extrabold text-[#111] uppercase tracking-tight">
            {locale === 'bn' ? 'ক্যাটাগরি অনুযায়ী শপ করুন' : 'Shop by Categories'}
          </h2>
          <Link href={`/${locale}/shop`} className="text-[11px] font-extrabold text-[#057476] hover:underline uppercase">
            {locale === 'bn' ? 'সব দেখুন' : 'View all'}
          </Link>
        </div>

        {/* Categories Row scrollable on mobile */}
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4">
          {CAT_ICONS.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link key={i} href={`/${locale}/shop`}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-[#057476]/30 hover:shadow-sm transition-all duration-200 w-[100px] sm:w-auto"
              >
                {/* Rounded Icon tint background */}
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${cat.bg} shadow-sm`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <span className="text-[10px] font-extrabold text-gray-600 text-center leading-tight">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm sm:text-base font-extrabold text-[#111] uppercase tracking-tight flex items-center gap-1.5">
              <Zap className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
              <span>{locale === 'bn' ? 'ফ্ল্যাশ ডিলস' : 'Flash Deals'}</span>
            </h2>
            
            {/* Countdown timer widget (Matches reference image) */}
            <div className="flex items-center gap-1 bg-amber-50/80 border border-amber-100 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-amber-800">
              <Timer className="h-3 w-3" />
              <span>02 : 45 : 30</span>
            </div>
          </div>

          <Link href={`/${locale}/shop`} className="text-[11px] font-extrabold text-[#057476] hover:underline uppercase">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Left card Promo */}
        <div className="relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-[#057476] to-[#008B8B] text-white flex flex-col justify-between min-h-[110px] shadow-sm">
          <div className="absolute right-4 bottom-2 opacity-15">
            <Percent className="h-20 w-20" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black tracking-tight">{locale === 'bn' ? 'অতিরিক্ত ১০% ছাড়!' : 'Get Extra 10% OFF'}</h3>
            <p className="text-[10px] text-white/70 font-semibold">{locale === 'bn' ? 'আপনার প্রথম অর্ডারে পাবেন' : 'Applicable on your first order'}</p>
          </div>
          <div className="pt-2">
            <span className="inline-block bg-white/15 border border-white/20 px-3 py-1 rounded-xl text-[10px] font-mono font-black tracking-wider">
              {locale === 'bn' ? 'কোড: WELCOME10' : 'Use Code: WELCOME10'}
            </span>
          </div>
        </div>

        {/* Right card Promo */}
        <div className="relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-[#FFECE1] to-[#FFF8F4] text-[#7A3E17] flex flex-col justify-between min-h-[110px] shadow-sm border border-orange-100/50">
          <div className="absolute right-4 bottom-2 opacity-10">
            <Gift className="h-20 w-20 text-orange-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black tracking-tight">{locale === 'bn' ? 'ফ্রি ডেলিভারি পাবেন' : 'Free Shipping'}</h3>
            <p className="text-[10px] text-orange-600/70 font-semibold">{locale === 'bn' ? '৳১৯৯৯+ মূল্যের সকল অর্ডারে' : 'On all orders above ৳1999'}</p>
          </div>
          <div className="pt-2">
            <Link href={`/${locale}/shop`} className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#057476] hover:underline">
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
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm sm:text-base font-extrabold text-[#111] uppercase tracking-tight">
            {locale === 'bn' ? 'ফিচার্ড প্রোডাক্টস' : 'Featured Products'}
          </h2>
          <Link href={`/${locale}/shop`} className="text-[11px] font-extrabold text-[#057476] hover:underline uppercase">
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
