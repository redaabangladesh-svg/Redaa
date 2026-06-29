'use client';

import { useLocale } from 'next-intl';
import { ArrowRight, Star, Heart, ShieldCheck, Truck, RefreshCw, Headphones, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

/* ── BANNER SLIDES ─────────────────────────────────── */
const SLIDES = [
  {
    tag_en: 'Summer Sale', tag_bn: 'সামার সেল',
    title_en: 'Discover the Best\nHome Decor', title_bn: 'সেরা হোম ডেকোর\nআবিষ্কার করুন',
    sub_en: 'Shop premium handcrafted wall stands, flower tubs & tree plants.', sub_bn: 'প্রিমিয়াম হ্যান্ডক্রাফটেড ওয়াল স্ট্যান্ড, ফ্লাওয়ার টাব ও ট্রি প্ল্যান্ট কিনুন।',
    cta_en: 'Shop Now', cta_bn: 'এখনই কিনুন',
    badge_en: 'Up to\n30% Off', badge_bn: 'সর্বোচ্চ\n৩০% ছাড়',
    image: '/Banner1.png',
    bg: '#f0f9f9',
    accent: '#057476',
  },
  {
    tag_en: 'New Arrival', tag_bn: 'নতুন আগমন',
    title_en: 'Handcrafted\nFloral Masterpieces', title_bn: 'হাতে তৈরি\nফুলের শিল্পকর্ম',
    sub_en: 'Pastel bouquets and wall art crafted for Bangladeshi homes.', sub_bn: 'বাংলাদেশি ঘরের জন্য পেস্টেল তোড়া ও ওয়াল আর্ট।',
    cta_en: 'Explore Flowers', cta_bn: 'ফুল দেখুন',
    badge_en: 'New\nCollection', badge_bn: 'নতুন\nকালেকশন',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=85&w=700',
    bg: '#fff5f7',
    accent: '#D80064',
  },
  {
    tag_en: 'Best Sellers', tag_bn: 'বেস্টসেলার',
    title_en: 'Premium Wooden\nWall Frames', title_bn: 'প্রিমিয়াম কাঠের\nওয়াল ফ্রেম',
    sub_en: 'Hand-polished mahogany frames with preserved dry flowers.', sub_bn: 'হাতে পালিশ করা মেহগনি ফ্রেম সহ শুকানো ফুল।',
    cta_en: 'View Collection', cta_bn: 'কালেকশন দেখুন',
    badge_en: 'Best\nSellers', badge_bn: 'বেস্ট\nসেলার',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=85&w=700',
    bg: '#f5f3ee',
    accent: '#78350F',
  },
];

/* ── SIDEBAR CATEGORIES ────────────────────────────── */
const SIDEBAR_CATS = [
  { en: 'All Categories', bn: 'সব ক্যাটাগরি', icon: '🏠' },
  { en: 'Premium Flower Tub', bn: 'প্রিমিয়াম ফ্লাওয়ার টাব', icon: '🌺' },
  { en: 'Premium Tree Plant', bn: 'প্রিমিয়াম ট্রি প্ল্যান্ট', icon: '🌳' },
  { en: 'Premium Wall Stand', bn: 'প্রিমিয়াম ওয়াল স্ট্যান্ড', icon: '🖼️' },
  { en: 'Candles & Holders', bn: 'ক্যান্ডেল ও হোল্ডার', icon: '🕯️' },
  { en: 'Mirror & Frames', bn: 'আয়না ও ফ্রেম', icon: '🪞' },
  { en: 'Vases & Pots', bn: 'ভেজ ও পট', icon: '🪴' },
  { en: 'Gift Sets', bn: 'গিফট সেট', icon: '🎁' },
  { en: 'More Categories', bn: 'আরও ক্যাটাগরি', icon: '➕' },
];

/* ── CATEGORY ICONS ROW ────────────────────────────── */
const CAT_ICONS = [
  { en: 'Flower Tub',  bn: 'ফ্লাওয়ার টাব',  image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=200' },
  { en: 'Tree Plant',  bn: 'ট্রি প্ল্যান্ট', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200' },
  { en: 'Wall Stand',  bn: 'ওয়াল স্ট্যান্ড', image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=200' },
  { en: 'Bouquets',    bn: 'তোড়া',          image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=200' },
  { en: 'Candles',     bn: 'ক্যান্ডেল',     image: 'https://images.unsplash.com/photo-1608181831688-e5b8e4d66903?auto=format&fit=crop&q=80&w=200' },
  { en: 'Frames',      bn: 'ফ্রেম',         image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=200' },
  { en: 'Vases',       bn: 'ভেজ',           image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=200' },
  { en: 'Gift Sets',   bn: 'গিফট সেট',      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=200' },
];

/* ── PRODUCTS ───────────────────────────────────────── */
const PRODUCTS = [
  { id:'1', name_en:'Premium Metal Flower Hanger', name_bn:'প্রিমিয়াম মেটাল ফ্লাওয়ার হ্যাঙ্গার', price:1250, sale_price:990,  image:'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=500', rating:4.8, reviews:24, discount:'-21%' },
  { id:'2', name_en:'Pastel Tulip Bouquet',        name_bn:'পেস্টেল টিউলিপ তোড়া',               price:850,  sale_price:null,  image:'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=500', rating:4.9, reviews:18, discount:null },
  { id:'3', name_en:'Vintage Wooden Wall Frame',   name_bn:'ভিন্টেজ কাঠের ওয়াল ফ্রেম',          price:1500, sale_price:1200,  image:'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=500', rating:4.7, reviews:32, discount:'-20%' },
  { id:'1', name_en:'Rose Gold Candle Set',        name_bn:'রোজ গোল্ড ক্যান্ডেল সেট',           price:680,  sale_price:540,   image:'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=500', rating:5.0, reviews:9,  discount:'-21%' },
  { id:'2', name_en:'Ceramic Flower Vase',         name_bn:'সিরামিক ফ্লাওয়ার ভেজ',              price:920,  sale_price:750,   image:'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=500', rating:4.6, reviews:14, discount:'-18%' },
  { id:'3', name_en:'Macrame Wall Hanging',        name_bn:'ম্যাক্রামে ওয়াল হ্যাঙ্গিং',         price:1100, sale_price:null,  image:'https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?auto=format&fit=crop&q=80&w=500', rating:4.8, reviews:21, discount:null },
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

  const s = SLIDES[active];

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ height: 360 }}>

      {/* Images */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.tag_en}
          className="absolute inset-0 transition-opacity duration-800"
          style={{ opacity: active === i ? 1 : 0 }}
        >
          <img
            src={slide.image}
            alt=""
            className="h-full w-full object-cover"
            style={{
              transform: active === i ? 'scale(1.0)' : 'scale(1.05)',
              transition: 'transform 6000ms ease-out',
            }}
          />
        </div>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => reset(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: active === i ? 22 : 8,
              height: 8,
              background: active === i ? '#ffffff' : 'rgba(255,255,255,0.45)',
            }}
          />
        ))}
      </div>

      {/* Arrow buttons */}
      <button
        onClick={() => reset((active - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-lg transition-all"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button
        onClick={() => reset((active + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-lg transition-all"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

    </div>
  );
}


/* ── PRODUCT CARD ───────────────────────────────────── */
function ProductCard({ p, locale }: { p: typeof PRODUCTS[0]; locale: string }) {
  const [liked, setLiked] = useState(false);
  const name = locale === 'bn' ? p.name_bn : p.name_en;
  const price = p.sale_price ?? p.price;

  return (
    <Link href={`/${locale}/p/${p.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img src={p.image} alt={name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-600" />
        {/* Discount badge */}
        {p.discount && (
          <span className="absolute top-2.5 left-2.5 bg-[#D80064] text-white text-[10px] font-black px-2 py-0.5 rounded">{p.discount}</span>
        )}
        {/* Wishlist */}
        <button
          onClick={e => { e.preventDefault(); setLiked(l => !l); }}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white shadow hover:scale-110 transition-transform"
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-[#D80064] text-[#D80064]' : 'text-gray-400'}`} />
        </button>
        {/* Hover CTA */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span className="block w-full py-2 text-center text-xs font-bold text-white bg-[#057476] rounded-xl shadow-lg">
            {locale === 'bn' ? 'অর্ডার করুন' : 'Order Now'}
          </span>
        </div>
      </div>
      <div className="p-3.5 space-y-2">
        <h3 className="text-sm font-semibold text-[#111] leading-snug line-clamp-2 group-hover:text-[#057476] transition-colors">{name}</h3>
        <div className="flex items-center gap-1 text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < Math.floor(p.rating) ? 'fill-current' : 'text-gray-200 fill-current'}`} />
          ))}
          <span className="text-[10px] text-gray-400 ml-0.5">({p.reviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[#111]">৳{price}</span>
          {p.sale_price && <span className="text-xs text-gray-400 line-through">৳{p.price}</span>}
        </div>
      </div>
    </Link>
  );
}

/* ── MAIN PAGE ──────────────────────────────────────── */
export default function HomePage() {
  const locale = useLocale();
  const [activeCat, setActiveCat] = useState(0);

  return (
    <div className="bg-[#f8f9fa] min-h-screen">

      {/* ══════════════════════════════════════════
          HERO AREA: Sidebar + Slider
      ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-5">

          {/* LEFT SIDEBAR — desktop only */}
          <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden self-start">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3.5 bg-[#057476] text-white">
              <span className="text-base">☰</span>
              <span className="text-sm font-bold">{locale === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}</span>
            </div>
            {/* Category list */}
            <ul className="py-1">
              {SIDEBAR_CATS.map((cat, i) => (
                <li key={i}>
                  <button
                    onClick={() => setActiveCat(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 text-left group ${
                      activeCat === i
                        ? 'bg-[#057476]/8 text-[#057476] font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#057476]'
                    }`}
                  >
                    <span className="text-base w-5 text-center flex-shrink-0">{cat.icon}</span>
                    <span className="flex-1 leading-tight">{locale === 'bn' ? cat.bn : cat.en}</span>
                    <ChevronRight className="h-3 w-3 opacity-30 group-hover:opacity-70 flex-shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* RIGHT: Hero banner slider */}
          <div className="flex-1 min-w-0">
            <HeroSlider locale={locale} />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TRUST STRIP
      ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { icon: <Truck className="h-6 w-6 text-[#057476]" />, t_en: 'Free Delivery',    t_bn: 'ফ্রি ডেলিভারি',     d_en: 'On orders over ৳500',      d_bn: '৳৫০০+ অর্ডারে' },
              { icon: <ShieldCheck className="h-6 w-6 text-[#057476]" />, t_en: 'Secure Payment', t_bn: 'নিরাপদ পেমেন্ট', d_en: 'Cash on Delivery',           d_bn: 'ক্যাশ অন ডেলিভারি' },
              { icon: <Headphones className="h-6 w-6 text-[#057476]" />, t_en: '24/7 Support',   t_bn: '২৪/৭ সহায়তা',    d_en: 'Dedicated support team',     d_bn: 'আমরা সবসময় আছি' },
              { icon: <RefreshCw className="h-6 w-6 text-[#057476]" />, t_en: 'Easy Returns',   t_bn: 'সহজ রিটার্ন',     d_en: '7-day return policy',        d_bn: '৭ দিনের রিটার্ন পলিসি' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3.5 px-5 py-4">
                <div className="p-2 rounded-xl bg-[#057476]/8 flex-shrink-0">{t.icon}</div>
                <div>
                  <p className="text-sm font-bold text-[#111]">{locale === 'bn' ? t.t_bn : t.t_en}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{locale === 'bn' ? t.d_bn : t.d_en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SHOP BY CATEGORY — Icon grid
      ══════════════════════════════════════════ */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#111]">
            {locale === 'bn' ? 'ক্যাটাগরি অনুযায়ী কিনুন' : 'Shop By Categories'}
          </h2>
          <Link href={`/${locale}/shop`} className="text-xs font-semibold text-[#057476] flex items-center gap-1 hover:gap-2 transition-all">
            {locale === 'bn' ? 'সব ক্যাটাগরি' : 'View All Categories'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {CAT_ICONS.map((cat, i) => (
            <Link key={i} href={`/${locale}/shop`}
              className="group flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 hover:border-[#057476]/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-[#057476]/30 transition-colors">
                <img src={cat.image} alt={cat.en} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-400" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight group-hover:text-[#057476] transition-colors">
                {locale === 'bn' ? cat.bn : cat.en}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BEST SELLING PRODUCTS
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#111]">
            {locale === 'bn' ? 'বেস্টসেলার পণ্যসমূহ' : 'Best Selling Products'}
          </h2>
          <Link href={`/${locale}/shop`} className="text-xs font-semibold text-[#057476] flex items-center gap-1 hover:gap-2 transition-all">
            {locale === 'bn' ? 'সব পণ্য' : 'View All Products'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {PRODUCTS.map((p, i) => <ProductCard key={i} p={p} locale={locale} />)}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROMO BANNER
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="relative rounded-2xl overflow-hidden bg-[#057476]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(0,240,210,0.2),transparent_60%)]" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-9">
            <div className="text-white space-y-2 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00f0d2]">
                {locale === 'bn' ? 'এক্সক্লুসিভ অফার' : 'Exclusive Offer'}
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
                {locale === 'bn' ? 'প্রথম অর্ডারে ১০% ছাড়!' : 'Get 10% off your first order!'}
              </h3>
              <p className="text-white/70 text-sm">
                {locale === 'bn' ? 'কোড:' : 'Use code:'}
                <code className="ml-2 text-white font-mono font-black bg-white/15 border border-white/20 px-2.5 py-0.5 rounded-lg">WELCOME10</code>
              </p>
            </div>
            <Link
              href={`/${locale}/shop`}
              className="flex-shrink-0 px-8 py-3 rounded-full bg-white text-[#057476] font-bold text-sm hover:bg-[#00f0d2] hover:-translate-y-0.5 transition-all duration-200 shadow-xl"
            >
              {locale === 'bn' ? 'এখনই কিনুন →' : 'Shop Now →'}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#111]">
            {locale === 'bn' ? 'কাস্টমাররা কী বলছেন' : 'Customer Reviews'}
          </h2>
          <div className="flex items-center gap-1 text-yellow-400">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
            <span className="ml-1 text-xs font-bold text-[#111]">4.9</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name:'Nusrat J.', loc:'Dhaka',      r:5, t_en:'Absolutely stunning quality. Guests always ask where I got it!',  t_bn:'অসাধারণ মান। অতিথিরা সবসময় জিজ্ঞেস করেন কোথায় পেয়েছি!' },
            { name:'Rashedul K.', loc:'Chittagong', r:5, t_en:'Ordered as a gift. Arrived perfectly packed, she loved it.',      t_bn:'উপহার হিসেবে অর্ডার করেছিলাম। পারফেক্টলি প্যাক হয়ে এসেছে।' },
            { name:'Tania B.', loc:'Sylhet',       r:5, t_en:'Fast delivery, premium feel. Luxury decor at a fair price.',      t_bn:'দ্রুত ডেলিভারি, প্রিমিয়াম ফিল। ন্যায্য মূল্যে লাক্সারি ডেকোর।' },
          ].map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 hover:shadow-md transition-shadow duration-200">
              <div className="flex gap-0.5 text-yellow-400">
                {[...Array(r.r)].map((_, s) => <Star key={s} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="text-sm text-gray-500 italic leading-relaxed">"{locale === 'bn' ? r.t_bn : r.t_en}"</p>
              <div className="flex items-center gap-2.5 pt-1 border-t border-gray-50">
                <div className="h-8 w-8 rounded-full bg-[#057476] flex items-center justify-center text-white text-[10px] font-bold">
                  {r.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111]">{r.name}</p>
                  <p className="text-[10px] text-gray-400">{r.loc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
