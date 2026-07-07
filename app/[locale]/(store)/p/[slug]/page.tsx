'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useCart } from '@/lib/cart';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, ShieldCheck, Truck, RefreshCw, Plus, Minus, ArrowLeft, Check, ClipboardCheck, Phone, MapPin, PackageCheck, PackageX, Flame, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { fetchProductDetail, type ProductDetail } from '@/lib/products-db';
import { createClient } from '@/lib/supabase';
import { BD_DISTRICTS } from '@/lib/districts';

interface SizeOption { en: string; bn: string; price: number; sale_price: number | null; }

export default function ProductPage({ params }: { params: { slug: string } }) {
  const locale = useLocale();
  const router = useRouter();
  const { addToCart } = useCart();
  const formRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Embedded Order Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  const [shippingCharge, setShippingCharge] = useState(80);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProductDetail(params.slug).then((detail) => {
      setProduct(detail);
      setActiveImage(0);

      if (detail) {
        const sizes: SizeOption[] = detail.variants.length > 0
          ? detail.variants.map((v) => ({
              en: v.size_en || '',
              bn: v.size_bn || v.size_en || '',
              price: v.price ?? detail.price,
              sale_price: v.sale_price !== undefined ? v.sale_price : detail.sale_price,
            }))
          : [];
        setSelectedSize(sizes.length > 0 ? sizes[0] : null);
      } else {
        setSelectedSize(null);
      }
    });
  }, [params.slug]);

  // Read shipping rates from localStorage settings
  useEffect(() => {
    const storedInside = localStorage.getItem('sicily_delivery_inside');
    const storedOutside = localStorage.getItem('sicily_delivery_outside');
    const deliveryInside = storedInside ? Number(storedInside) : 80;
    const deliveryOutside = storedOutside ? Number(storedOutside) : 150;

    setShippingCharge(district === 'dhaka' ? deliveryInside : deliveryOutside);
  }, [district]);

  if (!product) {
    return (
      <div className="py-20 text-center text-brand-muted font-bold">
        {locale === 'bn' ? 'লোড হচ্ছে...' : 'Loading product details...'}
      </div>
    );
  }

  const sizeOptions: SizeOption[] | undefined = product.variants.length > 0
    ? product.variants.map((v) => ({
        en: v.size_en || '',
        bn: v.size_bn || v.size_en || '',
        price: v.price ?? product.price,
        sale_price: v.sale_price !== undefined ? v.sale_price : product.sale_price,
      }))
    : undefined;

  const price = selectedSize ? selectedSize.price : product.price;
  const salePrice = selectedSize ? selectedSize.sale_price : product.sale_price;
  const activePrice = salePrice ?? price;
  const nameLabel = locale === 'bn' ? product.name_bn : product.name_en;
  const shortDesc = (locale === 'bn' ? product.short_description_bn : product.short_description_en) || nameLabel;
  const desc = (locale === 'bn' ? product.description_bn : product.description_en) || nameLabel;
  const stockCount = product.stock;

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    setIsSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let customerId: string | null = null;
    if (user) {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      customerId = customer?.id ?? null;
    }

    const districtLabel = BD_DISTRICTS.find((d) => d.id === district)?.bn || district;
    const totalBill = activePrice * quantity + shippingCharge;

    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        customer_name: name,
        phone,
        address,
        district: districtLabel,
        subtotal: activePrice * quantity,
        delivery_charge: shippingCharge,
        discount: 0,
        total: totalBill,
        payment_method: paymentMethod,
        source: 'website',
      })
      .select()
      .single();

    setIsSubmitting(false);

    if (orderError || !newOrder) {
      alert(locale === 'bn' ? 'অর্ডার সম্পন্ন করা যায়নি, আবার চেষ্টা করুন।' : 'Could not place order, please try again.');
      console.error(orderError);
      return;
    }

    await supabase.from('order_items').insert({
      order_id: newOrder.id,
      product_id: product.id,
      product_name: nameLabel,
      variant: selectedSize ? { size_en: selectedSize.en, size_bn: selectedSize.bn } : null,
      qty: quantity,
      price: activePrice,
    });

    sessionStorage.setItem('last_order_details', JSON.stringify({
      orderId: newOrder.id,
      orderNumber: newOrder.order_number,
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      customerDistrict: districtLabel,
      paymentMethod,
      shippingCharge,
      subtotal: activePrice * quantity,
      grandTotal: totalBill,
    }));

    router.push(`/${locale}/order/${newOrder.id}`);
  };

  const getBenefits = () => {
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
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-2 px-4 rounded-xl text-center shadow-md animate-pulse">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Flame className="h-3.5 w-3.5 fill-current" />
          {locale === 'bn' ? 'সীমিত সময়ের অফার! স্টক শেষ হওয়ার আগেই অর্ডার করুন।' : 'Limited Time Offer! Order before stock runs out.'}
        </span>
      </div>

      {/* Back Button */}
      <Link 
        href={`/${locale}/shop`}
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-muted hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{locale === 'bn' ? 'শপে ফিরে যান' : 'Back to Shop'}</span>
      </Link>

      {/* Grid: Image and Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Product Image Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-brand-surface border border-brand-border">
            <img src={product.images[activeImage]} alt={nameLabel} className="h-full w-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2.5">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === i ? 'border-brand-primary' : 'border-brand-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, pricing & options */}
        <div className="space-y-6">
          <div className="space-y-2">
            {stockCount <= 5 && (
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

            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center text-[#C6A15B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" strokeWidth={1.5} />
                ))}
              </div>
              <span className="text-xs font-bold text-brand-text">{product.rating}</span>
              <span className="text-xs text-brand-muted">({product.reviews} {locale === 'bn' ? 'টি রিভিউ' : 'reviews'})</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-brand-secondary/5 to-brand-surface border border-brand-secondary/15 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-bold text-brand-secondary">৳{activePrice}</span>
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
              {stockCount === 0 ? (
                <span className="flex items-center gap-1 text-xs font-bold text-brand-muted whitespace-nowrap">
                  <PackageX className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.75} />
                  {locale === 'bn' ? 'স্টকে নেই' : 'Out of Stock'}
                </span>
              ) : stockCount <= 5 ? (
                <span className="flex items-center gap-1 text-xs font-bold text-brand-primary whitespace-nowrap">
                  <Flame className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.75} />
                  {locale === 'bn' ? `${stockCount}টি বাকি` : `${stockCount} left`}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-brand-primary whitespace-nowrap">
                  <PackageCheck className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.75} />
                  {locale === 'bn' ? 'স্টকে আছে' : 'In Stock'}
                </span>
              )}
            </div>
          </div>

          {/* Options: Sizes Only */}
          {sizeOptions && sizeOptions.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-brand-border">
              <span className="text-xs font-bold text-brand-muted">
                {locale === 'bn' ? 'সাইজ (দাম পরিবর্তন হবে):' : 'Size (price varies):'}
              </span>
              <div className="flex gap-2 flex-wrap">
                {sizeOptions.map((size) => (
                  <button
                    key={size.en}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all-custom ${
                      selectedSize?.en === size.en
                        ? 'bg-brand-primary border-brand-primary text-white'
                        : 'bg-white border-brand-border text-brand-text hover:border-brand-primary/40'
                    }`}
                  >
                    {locale === 'bn' ? size.bn : size.en}
                  </button>
                ))}
              </div>
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
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="p-2 text-brand-muted hover:text-brand-primary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Order Scroll CTA */}
              <button
                onClick={scrollToForm}
                className="flex-1 py-3.5 px-6 rounded-lg bg-gradient-to-br from-brand-primary to-brand-primary-alt text-white font-bold hover:shadow-lg hover:shadow-brand-primary/25 shadow-sm transition-all-custom text-sm text-center"
              >
                {locale === 'bn' ? 'সরাসরি এখনই অর্ডার করুন' : 'Order Directly Now'}
              </button>
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

      {/* Trust Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl border border-brand-border bg-brand-surface space-y-2 hover:border-[#C6A15B]/30 transition-all duration-200">
          <div className="h-9 w-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <h4 className="text-xs font-bold text-brand-text">
            {locale === 'bn' ? 'প্রিমিয়াম মেটেরিয়াল ও ফিনিশিং' : 'Premium Material & Finish'}
          </h4>
          <p className="text-[10.5px] leading-relaxed text-brand-muted font-medium">
            {locale === 'bn' 
              ? 'নিখুঁত রঙ ও সর্বোচ্চ স্থায়িত্ব নিশ্চিত করতে আমাদের প্রতিটি পণ্য সতর্কতার সাথে তৈরি।' 
              : 'Each item is carefully crafted to ensure flawless look and maximum durability.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-brand-border bg-brand-surface space-y-2 hover:border-[#C6A15B]/30 transition-all duration-200">
          <div className="h-9 w-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <h4 className="text-xs font-bold text-brand-text">
            {locale === 'bn' ? 'নিরাপদ থ্রি-লেয়ার প্যাকেজিং' : 'Secure 3-Layer Packaging'}
          </h4>
          <p className="text-[10.5px] leading-relaxed text-brand-muted font-medium">
            {locale === 'bn' 
              ? 'ভাঙার কোনো ঝুঁকি ছাড়াই আপনার পছন্দের প্রোডাক্টটি শতভাগ সুরক্ষিতভাবে আপনার কাছে পৌঁছাবে।' 
              : 'Your favorite items will reach you safely with no risk of physical damage.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-brand-border bg-brand-surface space-y-2 hover:border-[#C6A15B]/30 transition-all duration-200">
          <div className="h-9 w-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <Truck className="h-4.5 w-4.5" />
          </div>
          <h4 className="text-xs font-bold text-brand-text">
            {locale === 'bn' ? 'ক্যাশ অন ডেলিভারি সুবিধা' : 'Cash On Delivery'}
          </h4>
          <p className="text-[10.5px] leading-relaxed text-brand-muted font-medium">
            {locale === 'bn' 
              ? 'অগ্রিম কোনো টাকা দিতে হবে না। প্রোডাক্ট হাতে পেয়ে কোয়ালিটি দেখে তারপর পেমেন্ট করুন।' 
              : 'No advance payment needed. Receive your order, inspect it, and then pay.'}
          </p>
        </div>
      </div>

      {/* Product Benefits Section */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 md:p-8 space-y-6">
        <h3 className="font-serif font-semibold text-brand-text text-base border-b border-brand-border pb-3 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-brand-primary" strokeWidth={1.75} />
          <span>{locale === 'bn' ? 'এই প্রোডাক্টের চমৎকার সুবিধাসমূহ' : 'Premium Product Features'}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs md:text-sm font-semibold text-brand-text">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <Check className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" strokeWidth={1.75} />
              <p className="leading-relaxed">{benefit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Step Workflow */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-6">
        <h3 className="font-serif font-semibold text-brand-text text-base border-b border-brand-border pb-3 flex items-center gap-2">
          <Truck className="h-5 w-5 text-brand-primary" />
          <span>{locale === 'bn' ? 'অর্ডার করার সহজ ৩টি ধাপ' : '3 Easy Steps to Order'}</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="space-y-2 relative">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-extrabold">১</span>
              <h4 className="text-xs font-bold text-brand-text">{locale === 'bn' ? 'ফর্মটি পূরণ করুন' : 'Fill the Form'}</h4>
            </div>
            <p className="text-[10.5px] leading-relaxed text-brand-muted pl-10 font-semibold">
              {locale === 'bn' 
                ? 'নিচের দেওয়া অর্ডার ফর্মটিতে আপনার নাম, সচল মোবাইল নম্বর এবং ডেলিভারির সঠিক ঠিকানা দিন।' 
                : 'Enter your name, active phone number, and full address in the checkout form below.'}
            </p>
          </div>

          <div className="space-y-2 relative">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-extrabold">২</span>
              <h4 className="text-xs font-bold text-brand-text">{locale === 'bn' ? 'অর্ডার ভেরিফিকেশন কল' : 'Call Verification'}</h4>
            </div>
            <p className="text-[10.5px] leading-relaxed text-brand-muted pl-10 font-semibold">
              {locale === 'bn' 
                ? 'ফর্ম সাবমিট করার পর আমাদের প্রতিনিধি আপনাকে কল করে অর্ডার ও ডেলিভারির সময় কনফার্ম করবে।' 
                : 'Our support team will call you within a few hours to confirm the product size and address details.'}
            </p>
          </div>

          <div className="space-y-2 relative">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-extrabold">৩</span>
              <h4 className="text-xs font-bold text-brand-text">{locale === 'bn' ? 'পণ্য বুঝে নিয়ে পেমেন্ট' : 'Cash On Delivery'}</h4>
            </div>
            <p className="text-[10.5px] leading-relaxed text-brand-muted pl-10 font-semibold">
              {locale === 'bn' 
                ? 'ডেলিভারি ম্যানের কাছ থেকে প্রোডাক্টটি বুঝে নিন এবং কোয়ালিটি দেখে সন্তুষ্ট হয়ে মূল্য পরিশোধ করুন।' 
                : 'Receive the parcel from the delivery agent, verify product condition, and pay cash on delivery.'}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h3 className="font-serif font-bold text-lg md:text-2xl text-brand-text">
            {locale === 'bn' ? 'গ্রাহকদের সন্তুষ্টি ও রিয়েল মতামত' : 'Customer Reviews & Feedback'}
          </h3>
          <p className="text-xs text-brand-muted font-bold">
            {locale === 'bn' ? 'আমাদের কাস্টমারদের কিছু মূল্যবান রিভিউ ও প্রতিক্রিয়া' : 'A few testimonials from our happy customers'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-brand-border bg-white space-y-3.5 shadow-sm relative">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-brand-secondary/15 flex items-center justify-center font-bold text-xs text-brand-secondary">
                আ
              </div>
              <div>
                <span className="text-xs font-bold text-brand-text block">আরিফ রহমান</span>
                <span className="text-[9px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  <Check className="h-2.5 w-2.5 stroke-[3]" /> {locale === 'bn' ? 'ভেরিফাইড ক্রেতা' : 'Verified Buyer'}
                </span>
              </div>
            </div>
            <div className="flex text-[#C6A15B]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-current" />
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-brand-text font-semibold italic">
              {locale === 'bn'
                ? '"আমি থাই বানানা ট্রি-টা অর্ডার করেছিলাম। গাছ আর টব দুটোই খুব চমৎকার। ঘরে রাখার পর লুক অনেক লাক্সারি দেখাচ্ছে। প্যাকেজিং খুব ভালো ছিল।"'
                : '"Ordered the Thai Banana tree. Both the plant and pot are excellent. Looks very luxury in the drawing room. Fast shipping."'}
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-brand-border bg-white space-y-3.5 shadow-sm relative">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-brand-secondary/15 flex items-center justify-center font-bold text-xs text-brand-secondary">
                ফ
              </div>
              <div>
                <span className="text-xs font-bold text-brand-text block">ফারজানা আক্তার</span>
                <span className="text-[9px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  <Check className="h-2.5 w-2.5 stroke-[3]" /> {locale === 'bn' ? 'ভেরিফাইড ক্রেতা' : 'Verified Buyer'}
                </span>
              </div>
            </div>
            <div className="flex text-[#C6A15B]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-current" strokeWidth={1.5} />
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-brand-text font-semibold italic">
              {locale === 'bn'
                ? '"অর্গানিক কোয়ালিটি এবং চমৎকার ফিনিশিং। অর্ডার করার পরের দিনই ঢাকার মধ্যে ডেলিভারি পেয়েছি। সিসিলি-র টিমকে ধন্যবাদ!"'
                : '"Organic quality and amazing finish. Got same-day delivery inside Dhaka. Very customer friendly support."'}
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-brand-border bg-white space-y-3.5 shadow-sm relative">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-brand-secondary/15 flex items-center justify-center font-bold text-xs text-brand-secondary">
                ই
              </div>
              <div>
                <span className="text-xs font-bold text-brand-text block">ইমরান চৌধুরী</span>
                <span className="text-[9px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  <Check className="h-2.5 w-2.5 stroke-[3]" /> {locale === 'bn' ? 'ভেরিফাইড ক্রেতা' : 'Verified Buyer'}
                </span>
              </div>
            </div>
            <div className="flex text-[#C6A15B]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-current" strokeWidth={1.5} />
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-brand-text font-semibold italic">
              {locale === 'bn'
                ? '"অর্ডার করার পর কাস্টমার সাপোর্ট থেকে কল দিয়ে খুব সুন্দরভাবে বুঝিয়ে বলেছিল। রিটার্ন পলিসি আর সেবার মান অত্যন্ত প্রশংসনীয়।"'
                : '"Great experience. Customer service called to confirm all sizes and details. High quality products and packing."'}
            </p>
          </div>
        </div>
      </div>

      {/* Inline Checkout Order Form Card */}
      <div ref={formRef} id="order-form" className="max-w-2xl mx-auto bg-white border border-brand-border rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">

        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 bg-brand-primary text-white text-[9px] font-bold uppercase tracking-wider py-1 px-4 rounded-bl-lg">
          {locale === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash On Delivery'}
        </div>

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
          <img src={product.images[activeImage]} className="h-12 w-12 rounded-lg object-cover border border-brand-border" />
          <div className="flex-1 min-w-0">
            <span className="font-bold text-brand-text truncate block">{nameLabel}</span>
            <span className="text-[10px] text-brand-muted block mt-0.5">
              {selectedSize && `${locale === 'bn' ? 'সাইজ: ' + selectedSize.bn : 'Size: ' + selectedSize.en}`}
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
                onClick={() => setPaymentMethod('bkash')}
                className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all-custom flex items-center justify-center gap-2 ${
                  paymentMethod === 'bkash'
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                    : 'border-brand-border bg-white text-brand-text hover:border-brand-primary/30'
                }`}
              >
                <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${paymentMethod === 'bkash' ? 'border-brand-primary' : 'border-brand-muted'}`}>
                  {paymentMethod === 'bkash' && <div className="h-1.5 w-1.5 rounded-full bg-brand-primary" />}
                </div>
                <span>{locale === 'bn' ? 'বিকাশ (bKash)' : 'bKash'}</span>
              </button>
            </div>
            {paymentMethod === 'bkash' && (
              <div className="p-3 bg-brand-secondary/5 border border-brand-secondary/20 rounded-xl text-[10px] text-brand-text font-semibold leading-relaxed">
                {locale === 'bn'
                  ? 'বিকাশ পেমেন্ট করতে চাইলে ০১৭XXXXXXXX নম্বরে পেমেন্ট করে ট্রানজেকশন আইডি আমাদের অর্ডার ভেরিফিকেশন কল এলে শেয়ার করুন।'
                  : 'To complete bKash payments, send money to 017XXXXXXXX and share transaction ID on verification call.'}
              </div>
            )}
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
            <div className="border-t border-brand-border pt-3 flex justify-between items-baseline text-sm font-extrabold text-brand-text">
              <span>{locale === 'bn' ? 'সর্বমোট মূল্য' : 'Grand Total'}</span>
              <span className="text-base font-black text-brand-secondary">৳{activePrice * quantity + shippingCharge}</span>
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
                : (locale === 'bn' ? `অর্ডার নিশ্চিত করুন (৳${activePrice * quantity + shippingCharge})` : `Confirm Order (৳${activePrice * quantity + shippingCharge})`)}
            </span>
          </button>
        </form>
      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-6 pt-4 border-t border-brand-border">
        <h3 className="font-serif font-semibold text-brand-text text-base">
          {locale === 'bn' ? 'কাস্টমারদের মতামত ও রিভিউ' : 'Customer Testimonials'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Nusrat Jahan', rating: 5, comment_en: 'Excellent hanger stand, very clean metal finishing, holds weight easily.', comment_bn: 'অসাধারণ মানের হ্যাঙ্গার স্ট্যান্ড, মরিচা ধরে না এবং ফিনিশিং অনেক চমৎকার।', date: '2026-06-25' },
            { name: 'Rashedul Karim', rating: 5, comment_en: 'Highly recommended decor items, Bangladeshi delivery was fast too.', comment_bn: 'অর্ডার করার ২ দিনের মধ্যেই মিরপুরে হোম ডেলিভারি পেয়েছি। অনেক ভালো প্রোডাক্ট।', date: '2026-06-24' },
            { name: 'Tania Kabir', rating: 4, comment_en: 'Perfect paper flowers bouquet, looks real from distance. Thank you.', comment_bn: 'ফুলগুলো দূর থেকে দেখতে একদম সত্যিকারের মনে হয়, বসার ঘরের সৌন্দর্য বাড়িয়ে দিয়েছে।', date: '2026-06-20' }
          ].map((rev, idx) => (
            <div key={idx} className="bg-white border border-brand-border rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-brand-text">{rev.name}</span>
                <span className="text-[10px] text-brand-muted">{rev.date}</span>
              </div>
              <div className="flex text-[#C6A15B]">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" strokeWidth={1.5} />
                ))}
              </div>
              <p className="text-xs text-brand-muted leading-relaxed font-semibold">
                {locale === 'bn' ? rev.comment_bn : rev.comment_en}
              </p>
            </div>
          ))}
        </div>
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
                ? 'উত্তর: ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৮০ টাকা এবং ঢাকা সিটির বাইরে সারা বাংলাদেশে ১৫০ টাকা। ঢাকা সিটির ভেতরে ১-২ দিন এবং বাইরে ৩-৪ দিনের মধ্যে ডেলিভারি পেয়ে যাবেন।'
                : 'A: Shipping fee is ৳80 inside Dhaka (1-2 days delivery) and ৳150 outside Dhaka (3-4 days delivery) all over Bangladesh.'}
            </p>
          </details>

          <details className="group border border-brand-border bg-white rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
            <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
              <span className="text-xs font-bold text-brand-text">
                {locale === 'bn' ? 'পণ্য ডেলিভারির সময় নষ্ট বা ভেঙে গেলে কী হবে?' : 'Q: What if the product is damaged during transit?'}
              </span>
              <span className="transition group-open:-rotate-180 text-brand-muted">
                <Plus className="h-4 w-4 block group-open:hidden" />
                <Minus className="h-4 w-4 hidden group-open:block" />
              </span>
            </summary>
            <p className="mt-3 text-[11px] leading-relaxed text-brand-muted font-semibold border-t border-brand-border pt-3">
              {locale === 'bn'
                ? 'উত্তর: আমরা থ্রি-লেয়ার বাবল র‍্যাপে ডেলিভারি করি। তারপরও যদি কোনো কারণে পণ্য নষ্ট হয়, তবে ডেলিভারি ম্যান থাকা অবস্থায়ই আমাদের সাথে যোগাযোগ করুন। আমরা সম্পূর্ণ ফ্রীতে আপনাকে নতুন পণ্য পাঠিয়ে দেব।'
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
                ? 'উত্তর: না, সিসিলি-তে অর্ডার করতে কোনো অগ্রিম টাকা দিতে হবে না। ক্যাশ অন ডেলিভারি (COD) সুবিধায় প্রোডাক্ট হাতে পেয়ে সম্পূর্ণ চেক করে তারপর পেমেন্ট করতে পারবেন।'
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
