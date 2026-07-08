'use client';

import { useLocale } from 'next-intl';
import { ArrowRight, Crown, Flower2, Sprout, Frame, Sparkles, Percent, Gift, ShieldCheck, Truck, Headset, Award, Quote } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import type { HomeProduct } from '@/lib/products';
import ProductCard from '@/components/store/ProductCard';
import CountdownTimer from '@/components/widgets/CountdownTimer';
import InstagramFeed from '@/components/widgets/InstagramFeed';
import { fetchSettings } from '@/lib/settings';

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

/* ── MAIN PAGE ──────────────────────────────────────── */
export default function HomePageClient({ products }: { products: HomeProduct[] }) {
  const locale = useLocale();
  const [flashEndAt, setFlashEndAt] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings(['flash_sale_active', 'flash_sale_end_at']).then((s) => {
      const active = s.flash_sale_active === 'true';
      const endAt = s.flash_sale_end_at;
      if (active && endAt && new Date(endAt).getTime() > Date.now()) {
        setFlashEndAt(endAt);
      }
    });
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
      {flashEndAt && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-brand-text tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#C6A15B]" strokeWidth={1.75} />
              <span>{locale === 'bn' ? 'ফ্ল্যাশ ডিলস' : 'Flash Deals'}</span>
            </h2>

            <div className="flex items-center gap-3">
              <CountdownTimer locale={locale} endAt={flashEndAt} />
              <Link href={`/shop`} className="text-[11px] font-semibold text-brand-primary hover:text-brand-secondary transition-colors uppercase tracking-wide">
                {locale === 'bn' ? 'সব দেখুন' : 'View all'}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {products.slice(0, 6).map((p) => <ProductCard key={p.id} p={p} locale={locale} />)}
          </div>
        </section>
      )}

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
          6. WHY CHOOSE US
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h2 className="font-serif text-base sm:text-lg font-semibold text-brand-text tracking-tight mb-4">
          {locale === 'bn' ? 'কেন আমাদের বেছে নেবেন' : 'Why Choose Us'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { icon: ShieldCheck, en: 'Cash on Delivery', bn: 'ক্যাশ অন ডেলিভারি', desc_en: 'Pay only after you receive it', desc_bn: 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন' },
            { icon: Truck, en: 'Fast Delivery', bn: 'দ্রুত ডেলিভারি', desc_en: 'Dhaka in 1-2 days', desc_bn: 'ঢাকায় ১-২ দিনে ডেলিভারি' },
            { icon: Headset, en: 'Dedicated Support', bn: 'ডেডিকেটেড সাপোর্ট', desc_en: 'We call to confirm every order', desc_bn: 'প্রতিটি অর্ডার কল করে কনফার্ম করা হয়' },
            { icon: Award, en: 'Handcrafted Quality', bn: 'হাতে তৈরি মান', desc_en: 'Made by local artisans', desc_bn: 'দেশীয় কারিগরদের হাতে তৈরি' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-white border border-brand-border space-y-2">
                <div className="h-9 w-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                </div>
                <h3 className="text-xs font-bold text-brand-text">{locale === 'bn' ? item.bn : item.en}</h3>
                <p className="text-[10px] text-brand-muted leading-relaxed">{locale === 'bn' ? item.desc_bn : item.desc_en}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. FEATURED PRODUCTS
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
          8. CUSTOMER PHOTOS (Instagram-style UGC)
      ══════════════════════════════════════════ */}
      <InstagramFeed />

      {/* ══════════════════════════════════════════
          9. TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h2 className="font-serif text-base sm:text-lg font-semibold text-brand-text tracking-tight mb-4">
          {locale === 'bn' ? 'গ্রাহকদের মতামত' : 'What Our Customers Say'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {[
            { name: 'আরিফ রহমান', en: 'Ordered the Thai Banana tree, excellent quality and fast delivery inside Dhaka.', bn: 'থাই বানানা ট্রি অর্ডার করেছিলাম, কোয়ালিটি দারুণ এবং ঢাকায় দ্রুত ডেলিভারি পেয়েছি।' },
            { name: 'ফারজানা আক্তার', en: 'Beautiful handmade wall stand, exactly like the photos. Highly recommended.', bn: 'হাতে তৈরি ওয়াল স্ট্যান্ডটি ছবির মতোই সুন্দর। সবাইকে রেকমেন্ড করব।' },
            { name: 'ইমরান চৌধুরী', en: 'Great customer support — they called to confirm everything before shipping.', bn: 'দারুণ কাস্টমার সাপোর্ট — পাঠানোর আগে কল করে সব কনফার্ম করেছে।' },
          ].map((t, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-brand-border space-y-3">
              <Quote className="h-5 w-5 text-brand-primary/30" />
              <p className="text-xs text-brand-muted leading-relaxed italic">
                &ldquo;{locale === 'bn' ? t.bn : t.en}&rdquo;
              </p>
              <span className="text-xs font-bold text-brand-text block">{t.name}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
