'use client';

import { useState, useRef, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useCart } from '@/lib/cart';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, ShoppingCart, ShieldCheck, Truck, RefreshCw, Plus, Minus, ArrowLeft, Check, ClipboardCheck, Phone, MapPin, PackageCheck, PackageX, Flame, Sparkles, Frame, Flower2, Wrench, BookOpen, Gift, Package, Tag, Home, X as XIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { HomeProduct } from '@/lib/products';
import { type ProductDetail, type BoxItemIcon } from '@/lib/products-db';
import { BD_DISTRICTS } from '@/lib/districts';
import { createClient } from '@/lib/supabase';
import type { Coupon } from '@/types';
import ProductCard from '@/components/store/ProductCard';
import ViewerCount from '@/components/widgets/ViewerCount';
import StockBadge from '@/components/widgets/StockBadge';
import InstagramFeed from '@/components/widgets/InstagramFeed';

interface ColorOption { en: string; bn: string; code: string; }
interface SizeOption { en: string; bn: string; }

const BOX_ICON_MAP: Record<BoxItemIcon, typeof Frame> = {
  frame: Frame,
  flower: Flower2,
  tool: Wrench,
  guide: BookOpen,
  gift: Gift,
  box: Package,
};

const BENEFIT_ICON_CYCLE = [Sparkles, Flower2, Home, Gift, ShieldCheck, Frame];

interface ProductPageClientProps {
  product: ProductDetail;
  otherProducts: HomeProduct[];
  deliveryInside: number;
  deliveryOutside: number;
}

export default function ProductPageClient({ product, otherProducts, deliveryInside, deliveryOutside }: ProductPageClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const { addToCart } = useCart();
  const formRef = useRef<HTMLDivElement>(null);
  const reviewSliderRef = useRef<HTMLDivElement>(null);
  const [reviewIndex, setReviewIndex] = useState(0);

  // Extract unique colors from variants
  const colors = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return [];
    const colorMap = new Map<string, ColorOption>();
    product.variants.forEach((v) => {
      if (v.color_en) {
        colorMap.set(v.color_en, {
          en: v.color_en,
          bn: v.color_bn || v.color_en,
          code: v.color_code || '#000000',
        });
      }
    });
    return Array.from(colorMap.values());
  }, [product.variants]);

  // Selected color state — must be declared before sizes useMemo (which depends on it)
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(() => {
    if (!product.variants || product.variants.length === 0) return null;
    const firstColor = product.variants.find((v) => v.color_en)?.color_en;
    if (!firstColor) return null;
    const v = product.variants.find((v) => v.color_en === firstColor);
    return {
      en: firstColor,
      bn: v?.color_bn || firstColor,
      code: v?.color_code || '#000000',
    };
  });

  // Sizes filtered based on selected color (Option 2: smart filter)
  const sizes = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return [];
    const sizeMap = new Map<string, SizeOption>();
    product.variants.forEach((v) => {
      // Only include sizes available for the selected color
      const colorMatch = !selectedColor || v.color_en === selectedColor.en;
      if (v.size_en && colorMatch) {
        sizeMap.set(v.size_en, {
          en: v.size_en,
          bn: v.size_bn || v.size_en,
        });
      }
    });
    return Array.from(sizeMap.values());
  }, [product.variants, selectedColor]);

  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(() => {
    if (!product.variants || product.variants.length === 0) return null;
    const firstColor = product.variants.find((v) => v.color_en)?.color_en;
    const firstSize = product.variants.find((v) => !firstColor || v.color_en === firstColor)?.size_en;
    if (!firstSize) return null;
    const v = product.variants.find((v) => v.size_en === firstSize);
    return {
      en: firstSize,
      bn: v?.size_bn || firstSize,
    };
  });

  // When color changes, auto-select first available size for that color
  const handleColorChange = (color: ColorOption) => {
    setSelectedColor(color);
    // Find first size available for this color
    const firstVariantForColor = product.variants.find((v) => v.color_en === color.en && v.size_en);
    if (firstVariantForColor?.size_en) {
      setSelectedSize({
        en: firstVariantForColor.size_en,
        bn: firstVariantForColor.size_bn || firstVariantForColor.size_en,
      });
    } else if (!product.variants.some((v) => v.color_en === color.en && v.size_en)) {
      // Color has no size variants — clear size selection
      setSelectedSize(null);
    }
  };

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Embedded Order Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const sslEnabled = process.env.NEXT_PUBLIC_SSL_ENABLED === 'true';
  // Shipping rates are fetched once on the server and passed down as props,
  // so switching district is an instant local calculation — no network round trip.
  const shippingCharge = district === 'dhaka' ? deliveryInside : deliveryOutside;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon / offer code (same validation rules as /checkout)
  type CheckoutCoupon = Pick<Coupon, 'code' | 'type' | 'value' | 'min_order'>;
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CheckoutCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleReviewScroll = () => {
    const el = reviewSliderRef.current;
    if (!el || !el.firstElementChild) return;
    const cardWidth = (el.firstElementChild as HTMLElement).offsetWidth + 14; // + gap-3.5
    const idx = Math.round(el.scrollLeft / cardWidth);
    setReviewIndex(Math.max(0, Math.min(idx, product.reviews_list.length - 1)));
  };

  // Find matching variant details
  const matchingVariant = product.variants.find((v) => 
    (!selectedColor || v.color_en === selectedColor.en) &&
    (!selectedSize || v.size_en === selectedSize.en)
  );

  const price = matchingVariant ? (matchingVariant.price ?? product.price) : product.price;
  const salePrice = matchingVariant ? (matchingVariant.sale_price !== undefined ? matchingVariant.sale_price : product.sale_price) : product.sale_price;
  const activePrice = salePrice ?? price;
  const nameLabel = locale === 'bn' ? product.name_bn : product.name_en;
  const shortDesc = (locale === 'bn' ? product.short_description_bn : product.short_description_en) || nameLabel;
  const desc = (locale === 'bn' ? product.description_bn : product.description_en) || nameLabel;
  const tagline = locale === 'bn' ? product.landingContent.tagline_bn : product.landingContent.tagline_en;
  const boxItems = product.landingContent.box_items || [];
  const stockCount = matchingVariant ? (matchingVariant.stock ?? product.stock) : product.stock;
  const cartSubtotal = activePrice * quantity;

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      couponDiscount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.type === 'fixed') {
      couponDiscount = appliedCoupon.value;
    } else if (appliedCoupon.type === 'free_delivery') {
      couponDiscount = shippingCharge;
    }
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) return;

    setApplyingCoupon(true);
    const supabase = createClient();
    const { data: coupon } = await supabase
      .from('coupons')
      .select('code, type, value, min_order, max_uses, used_count, is_active, expires_at')
      .eq('code', cleanCode)
      .maybeSingle();
    setApplyingCoupon(false);

    if (!coupon || !coupon.is_active) {
      setCouponError(locale === 'bn' ? 'ভুল কুপন কোড! অনুগ্রহ করে সঠিক কোড দিন।' : 'Invalid coupon code! Please try again.');
      return;
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      setCouponError(locale === 'bn' ? 'এই কুপনের মেয়াদ শেষ হয়ে গেছে।' : 'This coupon has expired.');
      return;
    }
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      setCouponError(locale === 'bn' ? 'এই কুপনের ব্যবহারসীমা শেষ হয়ে গেছে।' : 'This coupon has reached its usage limit.');
      return;
    }
    if (cartSubtotal < coupon.min_order) {
      setCouponError(
        locale === 'bn'
          ? `এই কুপন ব্যবহার করতে সর্বনিম্ন ৳${coupon.min_order} অর্ডার করতে হবে।`
          : `This coupon requires a minimum order of ৳${coupon.min_order}.`
      );
      return;
    }

    setAppliedCoupon(coupon);
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name_en: product.name_en,
      name_bn: product.name_bn,
      image: product.images[0],
      price,
      sale_price: salePrice,
      variant: (selectedSize || selectedColor) ? {
        size_en: selectedSize?.en || undefined,
        size_bn: selectedSize?.bn || undefined,
        color_en: selectedColor?.en || undefined,
        color_bn: selectedColor?.bn || undefined,
        color_code: selectedColor?.code || undefined,
      } : undefined,
    }, quantity);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert(locale === 'bn' ? 'অনুগ্রহ করে অর্ডার ফর্মের সব তথ্য পূরণ করুন।' : 'Please fill out all order form details.');
      return;
    }

    if (!/^(013|014|015|016|017|018|019)\d{8}$/.test(phone)) {
      alert(locale === 'bn' ? 'অনুগ্রহ করে সঠিক ১১-ডিজিটের মোবাইল নম্বর লিখুন।' : 'Please enter a valid 11-digit mobile number.');
      return;
    }

    if (quantity > stockCount) {
      alert(locale === 'bn' ? 'দুঃখিত, এই পরিমাণ স্টকে নেই।' : 'Sorry, that quantity is not in stock.');
      return;
    }

    setIsSubmitting(true);

    const districtLabel = BD_DISTRICTS.find((d) => d.id === district)?.bn || district;
    const totalBill = activePrice * quantity + shippingCharge - couponDiscount;

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: name,
        phone,
        address,
        district: districtLabel,
        items: [{
          productId: product.id,
          name: nameLabel,
          variant: (selectedSize || selectedColor) ? {
            size_en: selectedSize?.en || null,
            size_bn: selectedSize?.bn || null,
            color_en: selectedColor?.en || null,
            color_bn: selectedColor?.bn || null,
            color_code: selectedColor?.code || null,
          } : null,
          qty: quantity,
          price: activePrice,
        }],
        paymentMethod: paymentMethod === 'online' ? 'sslcommerz' : 'cod',
        shippingCharge,
        discountAmount: couponDiscount,
        couponCode: appliedCoupon?.code,
        source: 'website',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setIsSubmitting(false);
      alert(result.error || (locale === 'bn' ? 'অর্ডার সম্পন্ন করা যায়নি, আবার চেষ্টা করুন।' : 'Could not place order, please try again.'));
      return;
    }

    sessionStorage.setItem('last_order_details', JSON.stringify({
      orderId: result.id,
      orderNumber: result.orderNumber,
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      customerDistrict: districtLabel,
      paymentMethod,
      shippingCharge,
      subtotal: activePrice * quantity,
      grandTotal: totalBill,
    }));

    if (paymentMethod === 'online') {
      const sslResponse = await fetch('/api/payment/sslcommerz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: result.id }),
      });
      const sslResult = await sslResponse.json();
      setIsSubmitting(false);

      if (!sslResponse.ok || !sslResult.redirectUrl) {
        alert(locale === 'bn' ? 'অনলাইন পেমেন্ট শুরু করা যায়নি। COD-তে চেষ্টা করুন।' : 'Could not start online payment. Please try COD.');
        return;
      }

      window.location.href = sslResult.redirectUrl;
      return;
    }

    setIsSubmitting(false);
    router.push(`/order/${result.id}`);
  };

  const getBenefits = () => {
    const custom = locale === 'bn' ? product.landingContent.benefits_bn : product.landingContent.benefits_en;
    if (custom && custom.length > 0) return custom;

    if (product.category === 'wall-stand') {
      return [
        locale === 'bn' ? '১০০% মরিচা-প্রতিরোধক ও উন্নতমানের ফিনিশিং পেইন্ট।' : '100% Anti-rust powder coat for outdoor durability.',
        locale === 'bn' ? 'সম্পূর্ণ হাতে তৈরি আকর্ষণীয় জ্যামিতিক নকশা।' : 'Handcrafted geometric aesthetics for premium homes.',
        locale === 'bn' ? 'সহজে ওয়ালে হ্যাং করার স্ক্রু ও গাইডলাইন সহ।' : 'Quick 1-minute mounting kits included for free.'
      ];
    }
    return [
      locale === 'bn' ? '১০০% প্রিমিয়াম লুক এবং হাই-ফিনিশ লাক্সারি ডিজাইন।' : '100% Premium look and high-finish luxury design.',
      locale === 'bn' ? 'ইনডোর বা ড্রয়িং রুম ডেকোরেশনের জন্য একদম পারফেক্ট।' : 'Perfect for indoor, dining, or living room decoration.',
      locale === 'bn' ? 'অতিরিক্ত যত্ন সহকারে নিরাপদ প্যাকেজিং এ সুরক্ষিত ডেলিভারি।' : 'Carefully packaged to ensure damage-free safe delivery.'
    ];
  };
  const benefits = getBenefits();

  return (
    <div className="space-y-12 pb-24 px-4 sm:px-0">
      {/* Urgency Announcement Bar */}
      <div className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-secondary to-brand-secondary-dark text-white shadow-md shadow-brand-secondary/25">
        <span className="relative flex h-5 w-5 items-center justify-center flex-shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white/25 animate-ping" />
          <Flame className="relative h-3.5 w-3.5 fill-current" />
        </span>
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-center">
          {locale === 'bn' ? 'সীমিত সময়ের অফার! স্টক শেষ হওয়ার আগেই অর্ডার করুন।' : 'Limited Time Offer! Order before stock runs out.'}
        </span>
      </div>

      {/* Back Button */}
      <Link
        href={`/shop`}
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-muted hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{locale === 'bn' ? 'শপে ফিরে যান' : 'Back to Shop'}</span>
      </Link>

      {/* Grid: Image and Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Product Image Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-brand-surface border border-brand-border">
            <Image src={product.images[activeImage]} alt={nameLabel} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2.5">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === i ? 'border-brand-primary' : 'border-brand-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, pricing & options */}
        <div className="space-y-6">
          <div className="space-y-2">
            {stockCount > 0 && stockCount <= (product.lowStockThreshold ?? 5) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-brand-secondary to-brand-secondary-dark uppercase tracking-wider">
                  {locale === 'bn' ? `${stockCount}টি বাকি` : `Only ${stockCount} left`}
                </span>
              </div>
            )}

            <h1 className="font-serif text-2xl md:text-4xl font-semibold text-brand-text leading-tight pt-1">
              {nameLabel}
            </h1>
            <p className="text-xs md:text-sm text-brand-muted leading-relaxed pt-1">{shortDesc}</p>
            {tagline && (
              <p className="text-xs md:text-sm text-brand-primary font-bold pt-1.5 border-l-2 border-brand-primary pl-2.5">
                {tagline}
              </p>
            )}

            <div className="flex items-center gap-2.5 pt-1 flex-wrap">
              {product.reviews > 0 && (
                <>
                  <div className="flex items-center text-[#C6A15B]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" strokeWidth={1.5} />
                    ))}
                  </div>
                  <span className="text-base font-black text-brand-text">{product.rating}</span>
                  <span className="text-xs text-brand-muted">({product.reviews} {locale === 'bn' ? 'টি রিভিউ' : 'reviews'})</span>
                  <span className="text-brand-border">|</span>
                </>
              )}
              <ViewerCount productId={product.id} locale={locale} />
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-bold text-brand-text">৳{activePrice}</span>
              {salePrice !== null && (
                <span className="text-sm text-brand-muted line-through">৳{price}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {salePrice !== null && (
                <span className="px-2 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary text-[10px] font-bold">
                  {Math.round(((price - salePrice) / price) * 100)}% {locale === 'bn' ? 'ছাড়' : 'OFF'}
                </span>
              )}
              <StockBadge stock={stockCount} lowStockThreshold={product.lowStockThreshold ?? 5} locale={locale} />
            </div>
          </div>

          {/* Options: Colors & Sizes */}
          {(colors.length > 0 || sizes.length > 0) && (
            <div className="space-y-4 pt-4 border-t border-brand-border">
              {/* Color swatches */}
              {colors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-brand-muted">
                    {locale === 'bn' ? 'রঙ:' : 'Color:'}
                  </span>
                  <div className="flex gap-3 items-center">
                    {colors.map((color) => (
                      <button
                        key={color.en}
                        type="button"
                        onClick={() => handleColorChange(color)}
                        title={locale === 'bn' ? color.bn : color.en}
                        className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                          selectedColor?.en === color.en
                            ? 'border-brand-text ring-2 ring-brand-text/10 scale-105'
                            : 'border-transparent hover:border-brand-border'
                        }`}
                      >
                        <span
                          className="h-6 w-6 rounded-full border border-black/5"
                          style={{ backgroundColor: color.code }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size buttons */}
              {sizes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-brand-muted">
                    {locale === 'bn' ? 'সাইজ:' : 'Size:'}
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {sizes.map((size) => (
                      <button
                        key={size.en}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`h-10 w-11 text-xs font-bold rounded-lg border transition-all flex items-center justify-center ${
                          selectedSize?.en === size.en
                            ? 'bg-brand-primary border-brand-primary text-white font-extrabold'
                            : 'bg-white border-brand-border text-brand-text hover:border-brand-text/60'
                        }`}
                      >
                        {size.bn}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity selector & Primary Order CTA */}
          <div className="space-y-4 pt-6 border-t border-brand-border">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              {/* Quantity selector */}
              <div className="flex items-center justify-between rounded-2xl border border-brand-border bg-white p-2 sm:w-32">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-2 text-brand-muted hover:text-brand-primary transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-extrabold text-sm text-brand-text">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => Math.min(stockCount, prev + 1))}
                  disabled={quantity >= stockCount}
                  className="p-2 text-brand-muted hover:text-brand-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={stockCount === 0}
                  className="py-3.5 px-4 rounded-lg border-2 border-brand-primary text-brand-primary font-bold hover:bg-brand-primary/5 shadow-sm transition-all-custom text-sm text-center flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4" strokeWidth={1.75} />
                  <span>{locale === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
                </button>

                {/* Order Scroll CTA */}
                <button
                  onClick={scrollToForm}
                  disabled={stockCount === 0}
                  className="py-3.5 px-4 rounded-lg bg-gradient-to-br from-brand-primary to-brand-primary-alt text-white font-bold hover:shadow-lg hover:shadow-brand-primary/25 shadow-sm transition-all-custom text-sm text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {locale === 'bn' ? 'সরাসরি অর্ডার' : 'Order Directly'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Description */}
      <div className="space-y-3 pt-2">
        <h3 className="font-serif font-semibold text-base text-brand-text">
          {locale === 'bn' ? 'বিস্তারিত বিবরণ' : 'Detailed Description'}
        </h3>
        <p className="whitespace-pre-line text-xs md:text-sm text-brand-muted leading-relaxed">
          {desc}
        </p>
      </div>

      {/* Customer Photos */}
      <div className="pt-2">
        <InstagramFeed compact />
      </div>

      {/* Product Benefits Section */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 md:p-8 space-y-6">
        <h3 className="font-serif font-semibold text-brand-text text-base border-b border-brand-border pb-3 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-brand-primary" strokeWidth={1.75} />
          <span>{locale === 'bn' ? 'এই প্রোডাক্টের চমৎকার সুবিধাসমূহ' : 'Premium Product Features'}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs md:text-sm font-semibold text-brand-text">
          {benefits.map((benefit, idx) => {
            const BenefitIcon = BENEFIT_ICON_CYCLE[idx % BENEFIT_ICON_CYCLE.length];
            return (
              <div key={idx} className="flex items-start gap-3">
                <span className="h-9 w-9 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <BenefitIcon className="h-4.5 w-4.5 text-brand-primary" strokeWidth={1.75} />
                </span>
                <p className="leading-relaxed pt-1.5">{benefit}</p>
              </div>
            );
          })}
        </div>
      </div>

      {boxItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif font-semibold text-base text-brand-text">
            {locale === 'bn' ? 'বক্সের ভিতরে যা থাকছে' : "What's in the Box"}
          </h3>
          <div className="bg-white border border-brand-border rounded-2xl p-2">
          {boxItems.map((item, idx) => {
            const BoxIcon = BOX_ICON_MAP[item.icon] || Package;
            const title = locale === 'bn' ? item.title_bn : item.title_en;
            const subtitle = locale === 'bn' ? item.subtitle_bn : item.subtitle_en;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 ${idx < boxItems.length - 1 ? 'border-b border-brand-border' : ''}`}
              >
                <BoxIcon className="h-7 w-7 text-[#C6A15B] flex-shrink-0" strokeWidth={1.6} />
                <div className="flex-1 min-w-0">
                  <b className="text-sm font-extrabold text-brand-text block">{title}</b>
                  {subtitle && <span className="text-[11px] text-brand-muted font-semibold">{subtitle}</span>}
                </div>
                <Check className="h-4 w-4 text-brand-primary flex-shrink-0" strokeWidth={2.5} />
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Customer Reviews Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2.5">
          {product.reviews > 0 && (
            <div className="flex items-center justify-center gap-2.5">
              <span className="text-4xl md:text-5xl font-black text-brand-text leading-none">{product.rating}</span>
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center text-[#C6A15B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" strokeWidth={1.5} />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wide">
                  {locale === 'bn' ? `৫ এর মধ্যে রেটিং • ${product.reviews}টি রিভিউ` : `out of 5 Rating • ${product.reviews} reviews`}
                </span>
              </div>
            </div>
          )}
          <h3 className="font-serif font-bold text-lg md:text-2xl text-brand-text">
            {locale === 'bn' ? 'গ্রাহকদের সন্তুষ্টি ও রিয়েল মতামত' : 'Customer Reviews & Feedback'}
          </h3>
          <p className="text-xs text-brand-muted font-bold">
            {locale === 'bn' ? 'আমাদের কাস্টমারদের কিছু মূল্যবান রিভিউ ও প্রতিক্রিয়া' : 'A few testimonials from our happy customers'}
          </p>
        </div>

        {product.reviews_list.length === 0 ? (
          <p className="text-center text-xs text-brand-muted font-semibold py-6">
            {locale === 'bn' ? 'এই প্রোডাক্টে এখনো কোনো রিভিউ নেই। প্রথম রিভিউ আপনিই দিন!' : 'No reviews yet — be the first to review this product!'}
          </p>
        ) : (
          <>
            <div
              ref={reviewSliderRef}
              onScroll={handleReviewScroll}
              className="flex overflow-x-auto gap-3.5 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {product.reviews_list.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl border border-brand-border bg-white space-y-3.5 shadow-sm relative flex-none w-[82%] sm:w-[32%] snap-start">
                  <div className="flex items-center gap-2">
                    {rev.image ? (
                      <img src={rev.image} alt={rev.customerName} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-brand-secondary/15 flex items-center justify-center font-bold text-xs text-brand-secondary">
                        {rev.customerName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-brand-text block">{rev.customerName}</span>
                      <span className="text-[9px] font-semibold text-emerald-600 flex items-center gap-0.5">
                        <Check className="h-2.5 w-2.5 stroke-[3]" /> {locale === 'bn' ? 'ভেরিফাইড ক্রেতা' : 'Verified Buyer'}
                      </span>
                    </div>
                  </div>
                  <div className="flex text-[#C6A15B]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" strokeWidth={1.5} />
                    ))}
                  </div>
                  {rev.comment && (
                    <p className="text-[11px] leading-relaxed text-brand-text font-semibold italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
            {product.reviews_list.length > 1 && (
              <div className="flex items-center justify-center gap-1.5">
                {product.reviews_list.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === reviewIndex ? 'w-4.5 bg-brand-secondary' : 'w-1.5 bg-brand-border'}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Inline Checkout Order Form Card */}
      <div ref={formRef} id="order-form" className="max-w-2xl mx-auto bg-white border border-brand-border rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">

        {/* Title */}
        <div className="text-center space-y-2 border-b border-brand-border pb-4">
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-brand-text">
            {locale === 'bn' ? 'নিচের ফর্মটি পূরণ করে অর্ডার করুন' : 'Fill out the form below to order'}
          </h2>
          <p className="text-xs text-brand-muted font-bold">
            {locale === 'bn' ? 'আমাদের প্রতিনিধি কল করে অর্ডার কনফার্ম করবেন। কোনো অগ্রিম পেমেন্ট লাগবে না।' : 'No advance payment needed, pay upon receipt.'}
          </p>
        </div>

        {/* Order Details Preview summary */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex gap-4 items-center text-xs">
          <Image src={product.images[activeImage]} alt={nameLabel} width={48} height={48} className="h-12 w-12 rounded-lg object-cover border border-brand-border" />
          <div className="flex-1 min-w-0">
            <span className="font-bold text-brand-text truncate block">{nameLabel}</span>
            <span className="text-[10px] text-brand-muted block mt-0.5 space-y-0.5">
              {selectedColor && (
                <span className="block">
                  {locale === 'bn' ? 'রঙ: ' + selectedColor.bn : 'Color: ' + selectedColor.en}
                </span>
              )}
              {selectedSize && (
                <span className="block">
                  {locale === 'bn' ? 'সাইজ: ' + selectedSize.bn : 'Size: ' + selectedSize.en}
                </span>
              )}
            </span>
          </div>
          <div className="text-right">
            <span className="font-bold text-brand-text block">৳{activePrice} × {quantity}</span>
            <span className="text-[10px] text-brand-primary font-bold">{locale === 'bn' ? 'কার্ট সাবটোটাল' : 'Subtotal'}</span>
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handlePlaceOrder} className="space-y-4">

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              {locale === 'bn' ? 'আপনার নাম' : 'Customer Name'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={locale === 'bn' ? 'যেমন: করিম রহমান' : 'e.g. Karim Rahman'}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">
                {locale === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4.5 w-4.5 text-brand-muted" />
                <input
                  type="tel"
                  name="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">
                {locale === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select District'} <span className="text-rose-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              >
                {BD_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {locale === 'bn' ? d.bn : d.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              {locale === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Full Delivery Address'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 h-4.5 w-4.5 text-brand-muted" />
              <textarea
                name="street-address"
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={locale === 'bn' ? 'রোড নম্বর, হাউজ নম্বর, থানা, জেলা বিস্তারিত...' : 'House number, Road number, Thana info...'}
                rows={2}
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-semibold leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-bold text-brand-muted uppercase block">
              {locale === 'bn' ? 'পেমেন্ট পদ্ধতি:' : 'Payment Method:'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all-custom flex items-center justify-center gap-2 ${
                  paymentMethod === 'cod'
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                    : 'border-brand-border bg-white text-brand-text hover:border-brand-primary/30'
                }`}
              >
                <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-brand-primary' : 'border-brand-muted'}`}>
                  {paymentMethod === 'cod' && <div className="h-1.5 w-1.5 rounded-full bg-brand-primary" />}
                </div>
                <span>{locale === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</span>
              </button>
              <button
                type="button"
                onClick={() => sslEnabled && setPaymentMethod('online')}
                disabled={!sslEnabled}
                className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all-custom flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  paymentMethod === 'online'
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                    : 'border-brand-border bg-white text-brand-text hover:border-brand-primary/30'
                }`}
              >
                <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${paymentMethod === 'online' ? 'border-brand-primary' : 'border-brand-muted'}`}>
                  {paymentMethod === 'online' && <div className="h-1.5 w-1.5 rounded-full bg-brand-primary" />}
                </div>
                <span>{sslEnabled ? (locale === 'bn' ? 'অনলাইন পেমেন্ট' : 'Online Payment') : (locale === 'bn' ? 'অনলাইন (শীঘ্রই)' : 'Online (soon)')}</span>
              </button>
            </div>
          </div>

          {/* Coupon / offer code */}
          <div className="space-y-2 pt-2 border-t border-brand-border">
            <label className="text-[10px] font-bold text-brand-muted uppercase block flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              {locale === 'bn' ? 'কুপন কোড আছে?' : 'Have a coupon code?'}
            </label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-3.5">
                <span className="text-xs font-bold text-emerald-700">
                  {appliedCoupon.code} — {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% ${locale === 'bn' ? 'ছাড়' : 'off'}` : appliedCoupon.type === 'fixed' ? `৳${appliedCoupon.value} ${locale === 'bn' ? 'ছাড়' : 'off'}` : (locale === 'bn' ? 'ফ্রি ডেলিভারি' : 'Free delivery')}
                </span>
                <button type="button" onClick={handleRemoveCoupon} className="text-emerald-700 hover:text-rose-600">
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={locale === 'bn' ? 'কুপন কোড লিখুন' : 'Enter coupon code'}
                  className="flex-1 bg-brand-surface border border-brand-border rounded-xl py-2 px-3.5 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponInput.trim()}
                  className="px-4 py-2 rounded-xl bg-brand-text text-white text-xs font-bold disabled:opacity-50"
                >
                  {applyingCoupon ? '...' : (locale === 'bn' ? 'প্রয়োগ' : 'Apply')}
                </button>
              </div>
            )}
            {couponError && <p className="text-[10px] text-rose-600 font-semibold">{couponError}</p>}
          </div>

          {/* Pricing calculations */}
          <div className="border-t border-brand-border pt-4 space-y-1.5 text-xs">
            <div className="flex justify-between text-brand-muted">
              <span>{locale === 'bn' ? 'উপ-মোট' : 'Subtotal'}</span>
              <span>৳{activePrice * quantity}</span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>{locale === 'bn' ? 'শিপিং চার্জ' : 'Shipping Charge'}</span>
              <span>৳{shippingCharge}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-brand-primary font-semibold">
                <span>{locale === 'bn' ? 'কুপন ছাড়' : 'Coupon Discount'}</span>
                <span>-৳{couponDiscount}</span>
              </div>
            )}
            <div className="border-t border-brand-border pt-3 flex justify-between items-baseline text-sm font-extrabold text-brand-text">
              <span>{locale === 'bn' ? 'সর্বমোট মূল্য' : 'Grand Total'}</span>
              <span className="text-base font-black text-brand-text">৳{activePrice * quantity + shippingCharge - couponDiscount}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-lg bg-gradient-to-br from-brand-primary to-brand-primary-alt text-white font-bold text-xs shadow-sm hover:shadow-lg hover:shadow-brand-primary/25 transition-all-custom flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            <span>
              {isSubmitting
                ? (locale === 'bn' ? 'অর্ডার প্রসেস হচ্ছে...' : 'Processing Order...')
                : (locale === 'bn' ? `অর্ডার নিশ্চিত করুন (৳${activePrice * quantity + shippingCharge - couponDiscount})` : `Confirm Order (৳${activePrice * quantity + shippingCharge - couponDiscount})`)}
            </span>
          </button>
        </form>
      </div>

      {/* FAQ Accordion Section */}
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-1">
          <h3 className="font-serif font-bold text-lg md:text-2xl text-brand-text">
            {locale === 'bn' ? 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)' : 'Frequently Asked Questions'}
          </h3>
          <p className="text-xs text-brand-muted font-bold">
            {locale === 'bn' ? 'অর্ডার করার আগে জেনে নিন সাধারণ কিছু প্রশ্নের উত্তর' : 'Find answers to common questions about ordering'}
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-2.5">
          <details className="group border border-brand-border bg-white rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
            <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
              <span className="text-xs font-bold text-brand-text">
                {locale === 'bn' ? 'ডেলিভারি চার্জ কত এবং কতদিনের মধ্যে পাব?' : 'Q: What are the shipping charges and timeline?'}
              </span>
              <span className="transition group-open:-rotate-180 text-brand-muted">
                <Plus className="h-4 w-4 block group-open:hidden" />
                <Minus className="h-4 w-4 hidden group-open:block" />
              </span>
            </summary>
            <p className="mt-3 text-[11px] leading-relaxed text-brand-muted font-semibold border-t border-brand-border pt-3">
              {locale === 'bn'
                ? 'উত্তর: ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৮০ টাকা এবং ঢাকা সিটির বাইরে সারা বাংলাদেশে ১৫০ টাকা। ঢাকা সিটির ভেতরে ১-২ দিন এবং বাইরে ৩-৪ দিনের মধ্যে ডেলিভারি পেয়ে যাবেন।'
                : 'A: Shipping fee is ৳80 inside Dhaka (1-2 days delivery) and ৳150 outside Dhaka (3-4 days delivery) all over Bangladesh.'}
            </p>
          </details>

          <details className="group border border-brand-border bg-white rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
            <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
              <span className="text-xs font-bold text-brand-text">
                {locale === 'bn' ? 'পণ্য ডেলিভারির সময় নষ্ট বা ভেঙে গেলে কী হবে?' : 'Q: What if the product is damaged during transit?'}
              </span>
              <span className="transition group-open:-rotate-180 text-brand-muted">
                <Plus className="h-4 w-4 block group-open:hidden" />
                <Minus className="h-4 w-4 hidden group-open:block" />
              </span>
            </summary>
            <p className="mt-3 text-[11px] leading-relaxed text-brand-muted font-semibold border-t border-brand-border pt-3">
              {locale === 'bn'
                ? 'উত্তর: আমরা থ্রি-লেয়ার বাবল র‍্যাপে ডেলিভারি করি। তারপরও যদি কোনো কারণে পণ্য নষ্ট হয়, তবে ডেলিভারি ম্যান থাকা অবস্থায়ই আমাদের সাথে যোগাযোগ করুন। আমরা সম্পূর্ণ ফ্রীতে আপনাকে নতুন পণ্য পাঠিয়ে দেব।'
                : 'A: We use robust 3-layer bubble packaging. If anything breaks, return it with the delivery rider, call us, and we will send a new one free of charge.'}
            </p>
          </details>

          <details className="group border border-brand-border bg-white rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
            <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
              <span className="text-xs font-bold text-brand-text">
                {locale === 'bn' ? 'অর্ডার কনফার্ম করতে কোনো অগ্রিম পেমেন্ট করতে হবে?' : 'Q: Do I need to pay in advance?'}
              </span>
              <span className="transition group-open:-rotate-180 text-brand-muted">
                <Plus className="h-4 w-4 block group-open:hidden" />
                <Minus className="h-4 w-4 hidden group-open:block" />
              </span>
            </summary>
            <p className="mt-3 text-[11px] leading-relaxed text-brand-muted font-semibold border-t border-brand-border pt-3">
              {locale === 'bn'
                ? 'উত্তর: না, সিসিলি-তে অর্ডার করতে কোনো অগ্রিম টাকা দিতে হবে না। ক্যাশ অন ডেলিভারি (COD) সুবিধায় প্রোডাক্ট হাতে পেয়ে সম্পূর্ণ চেক করে তারপর পেমেন্ট করতে পারবেন।'
                : 'A: No advance payment is needed. Pay cash only after receiving and verifying the product.'}
            </p>
          </details>
        </div>
      </div>

      {/* Return policy details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-brand-border">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-brand-surface border border-brand-border">
          <ShieldCheck className="h-5 w-5 text-brand-primary flex-shrink-0" />
          <span className="text-[10px] font-bold text-brand-text leading-tight">
            {locale === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
          </span>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-brand-surface border border-brand-border">
          <Truck className="h-5 w-5 text-brand-primary flex-shrink-0" />
          <span className="text-[10px] font-bold text-brand-text leading-tight">
            {locale === 'bn' ? 'দ্রুত ডেলিভারি' : 'Super Fast Delivery'}
          </span>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-brand-surface border border-brand-border">
          <RefreshCw className="h-5 w-5 text-brand-primary flex-shrink-0" />
          <span className="text-[10px] font-bold text-brand-text leading-tight">
            {locale === 'bn' ? 'সহজ রিটার্ন সুবিধা' : '7 Days Easy Return'}
          </span>
        </div>
      </div>

      {/* Related Products */}
      {otherProducts.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-brand-border">
          <h3 className="font-serif font-semibold text-base text-brand-text">
            {locale === 'bn' ? 'আরও প্রোডাক্ট দেখুন' : 'You May Also Like'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {otherProducts.map((p) => <ProductCard key={p.id} p={p} locale={locale} />)}
          </div>
        </div>
      )}

      {/* Sticky Bottom Actions Bar (Mobile only) */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 p-4 bg-white/95 backdrop-blur border-t border-brand-border flex items-center justify-between gap-4 shadow-lg shadow-black/5 animate-slide-up">
        <div className="flex flex-col">
          <span className="text-[10px] text-brand-muted font-bold leading-none">
            {locale === 'bn' ? 'মূল্য:' : 'Price:'}
          </span>
          <span className="text-lg font-black text-brand-secondary mt-0.5">৳{activePrice * quantity}</span>
        </div>

        <button
          onClick={scrollToForm}
          className="flex-1 py-2.5 px-6 rounded-full bg-brand-primary text-white font-extrabold text-xs text-center hover:bg-brand-primary-alt shadow-md shadow-brand-primary/20 transition-all-custom animate-bounce"
        >
          {locale === 'bn' ? 'এখনই অর্ডার করুন' : 'Order Instantly'}
        </button>
      </div>
    </div>
  );
}
