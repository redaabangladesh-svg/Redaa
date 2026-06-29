'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useCart } from '@/lib/cart';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, ShieldCheck, Truck, RefreshCw, Plus, Minus, ArrowLeft, Check, ClipboardCheck, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name_en: string;
  name_bn: string;
  price: number;
  sale_price: number | null;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  desc_en: string;
  desc_bn: string;
  colors: { en: string; bn: string; hex: string }[];
  sizes?: { en: string; bn: string }[];
  stock?: number;
}

const mockProducts: Record<string, Product> = {
  '1': {
    id: '1',
    name_en: 'Premium Metal Flower Hanger',
    name_bn: 'প্রিমিয়াম মেটাল ফ্লাওয়ার হ্যাঙ্গার',
    price: 1250,
    sale_price: 990,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600',
    category: 'hangers',
    rating: 4.8,
    reviews: 24,
    desc_en: 'Enhance your wall aesthetics with this handcrafted premium metal flower hanger. Sourced from high-grade anti-rust painted iron. Extremely durable and modern geometric design.',
    desc_bn: 'আপনার দেয়ালের সৌন্দর্য বাড়াতে আমাদের হাতে তৈরি এই প্রিমিয়াম মেটাল ফ্লাওয়ার হ্যাঙ্গারটি অনন্য। মরিচা-প্রতিরোধক পেইন্ট করা উচ্চ মানের লোহা দ্বারা তৈরি। দীর্ঘস্থায়ী এবং আধুনিক জ্যামিতিক নকশা।',
    colors: [
      { en: 'Matte Black', bn: 'ম্যাট ব্ল্যাক', hex: '#111827' },
      { en: 'Classic Gold', bn: 'ক্লাসিক গোল্ড', hex: '#D97706' },
      { en: 'Rose Gold', bn: 'রোজ গোল্ড', hex: '#F43F5E' }
    ],
    sizes: [
      { en: 'Small (12")', bn: 'ছোট (১২ ইঞ্চি)' },
      { en: 'Medium (18")', bn: 'মাঝারি (১৮ ইঞ্চি)' }
    ],
    stock: 2
  },
  '2': {
    id: '2',
    name_en: 'Handcrafted Pastel Tulip Bouquet',
    name_bn: 'হ্যান্ডক্রাফটেড পেস্টেল টিউলিপ তোড়া',
    price: 850,
    sale_price: null,
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&q=80&w=600',
    category: 'flowers',
    rating: 4.9,
    reviews: 18,
    desc_en: 'Beautifully wrapped handcrafted pastel paper tulips. Perfect for dining tables, study desks, or gifting on special occasions. Includes high-durability wrapping sheets.',
    desc_bn: 'চমৎকারভাবে মোড়ানো হাতে তৈরি পেস্টেল কাগজের টিউলিপের তোড়া। ডাইনিং টেবিল, স্টাডি ডেস্ক বা বিশেষ অনুষ্ঠানে উপহার দেয়ার জন্য আদর্শ। এর সাথে রয়েছে দীর্ঘস্থায়ী র‍্যাপিং শিট।',
    colors: [
      { en: 'Pastel Pink', bn: 'পেস্টেল পিঙ্ক', hex: '#F472B6' },
      { en: 'Soft Yellow', bn: 'সফট ইয়েলো', hex: '#FDE047' },
      { en: 'Pure White', bn: 'হোয়াইট', hex: '#FFFFFF' }
    ],
    stock: 8
  },
  '3': {
    id: '3',
    name_en: 'Vintage Wooden Wall Flower Frame',
    name_bn: 'ভিন্টেজ কাঠের ওয়াল ফ্লাওয়ার ফ্রেম',
    price: 1500,
    sale_price: 1200,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
    category: 'frames',
    rating: 4.7,
    reviews: 32,
    desc_en: 'Hand-polished solid mahogany wood frames carrying preserved dry flowers. Gives an organic vintage country look to any home interior decoration.',
    desc_bn: 'প্রাকৃতিক শুকানো ফুল ধরে রাখা হাতে পালিশ করা সলিড মেহগনি কাঠের তৈরি ফ্রেম। যেকোনো বাড়ির ঘরের ভেতরে চমৎকার ভিন্টেজ লুক এনে দেয়।',
    colors: [
      { en: 'Rustic Oak', bn: 'রাস্টিক ওক', hex: '#78350F' },
      { en: 'Dark Mahogany', bn: 'ডার্ক মেহগনি', hex: '#451A03' }
    ],
    stock: 3
  }
};

const BD_DISTRICTS = [
  { id: 'dhaka', en: 'Dhaka (City)', bn: 'ঢাকা (সিটি)' },
  { id: 'chittagong', en: 'Chittagong', bn: 'চট্টগ্রাম' },
  { id: 'sylhet', en: 'Sylhet', bn: 'সিলেট' },
  { id: 'rajshahi', en: 'Rajshahi', bn: 'রাজশাহী' },
  { id: 'khulna', en: 'Khulna', bn: 'খুলনা' },
  { id: 'barisal', en: 'Barisal', bn: 'বরিশাল' },
  { id: 'rangpur', en: 'Rangpur', bn: 'রংপুর' },
  { id: 'mymensingh', en: 'Mymensingh', bn: 'ময়মনসিংহ' },
  { id: 'gazipur', en: 'Gazipur', bn: 'গাজীপুর' },
  { id: 'narayanganj', en: 'Narayanganj', bn: 'নারায়ণগঞ্জ' },
  { id: 'comilla', en: 'Comilla', bn: 'কুমিল্লা' },
  { id: 'coxsbazar', en: 'Cox\'s Bazar', bn: 'কক্সবাজার' },
  { id: 'bogra', en: 'Bogra', bn: 'বগুড়া' }
];

export default function ProductPage({ params }: { params: { slug: string } }) {
  const locale = useLocale();
  const router = useRouter();
  const { addToCart } = useCart();
  const formRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<{ en: string; bn: string; hex: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ en: string; bn: string } | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Embedded Order Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  const [shippingCharge, setShippingCharge] = useState(80);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from localStorage products catalog database
  useEffect(() => {
    const stored = localStorage.getItem('sicily_products_list');
    let loadedProducts: Record<string, Product> = {};

    if (stored) {
      try {
        const list: any[] = JSON.parse(stored);
        list.forEach((p) => {
          loadedProducts[p.id] = {
            id: p.id,
            name_en: p.name_en,
            name_bn: p.name_bn,
            price: p.price,
            sale_price: p.sale_price,
            image: p.image,
            category: p.category,
            rating: p.rating || 4.8,
            reviews: p.reviews || 22,
            desc_en: p.desc_en || p.name_en,
            desc_bn: p.desc_bn || p.name_bn,
            colors: p.colors || [
              { en: 'Classic Gold', bn: 'ক্লাসিক গোল্ড', hex: '#D97706' }
            ],
            sizes: p.sizes,
            stock: p.stock !== undefined ? p.stock : 10
          };
        });
      } catch (e) {
        console.error(e);
      }
    }

    const merged = { ...mockProducts, ...loadedProducts };
    const matched = merged[params.slug] || merged['1'];
    
    setProduct(matched);
    if (matched) {
      setSelectedColor(matched.colors[0]);
      if (matched.sizes) {
        setSelectedSize(matched.sizes[0]);
      }
    }
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
      <div className="py-20 text-center font-sans text-brand-muted font-bold">
        {locale === 'bn' ? 'লোড হচ্ছে...' : 'Loading product details...'}
      </div>
    );
  }

  const activePrice = product.sale_price !== null ? product.sale_price : product.price;
  const nameLabel = locale === 'bn' ? product.name_bn : product.name_en;
  const desc = locale === 'bn' ? product.desc_bn : product.desc_en;
  const stockCount = product.stock !== undefined ? product.stock : 5;

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
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

    setTimeout(() => {
      setIsSubmitting(false);
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      // Save order to sicily_orders_list inside localStorage
      const existingStr = localStorage.getItem('sicily_orders_list');
      let ordersList = [];
      if (existingStr) {
        try {
          ordersList = JSON.parse(existingStr);
        } catch (err) {
          console.error(err);
        }
      }

      const totalBill = activePrice * quantity + shippingCharge;

      const newOrder = {
        id: orderId,
        customer: name,
        phone: phone,
        amount: totalBill,
        payment: paymentMethod === 'cod' ? 'COD' : 'bKash',
        status: 'new' as const,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        address: address,
        district: BD_DISTRICTS.find(d => d.id === district)?.[locale === 'bn' ? 'bn' : 'en'] || district,
        shipping: shippingCharge
      };

      ordersList.unshift(newOrder);
      localStorage.setItem('sicily_orders_list', JSON.stringify(ordersList));

      // Save to sessionStorage for invoice page
      sessionStorage.setItem('last_order_details', JSON.stringify({
        orderId,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        customerDistrict: BD_DISTRICTS.find(d => d.id === district)?.[locale === 'bn' ? 'bn' : 'en'] || district,
        paymentMethod,
        shippingCharge
      }));

      // Direct redirect to confirmation
      router.push(`/${locale}/order/${orderId}`);
    }, 1000);
  };

  return (
    <div className="space-y-12 font-sans pb-24">
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
        {/* Left Column: Product Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-brand-surface border border-brand-border shadow-inner">
            <img 
              src={product.image} 
              alt={nameLabel} 
              className="h-full w-full object-cover" 
            />
          </div>
        </div>

        {/* Right Column: Title, pricing & options */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {product.sale_price !== null && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-brand-secondary uppercase tracking-wider">
                  Sale
                </span>
              )}
              {stockCount <= 5 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-red-500 uppercase tracking-wider animate-pulse">
                  {locale === 'bn' ? `মাত্র ${stockCount}টি বাকি আছে! 🔥` : `Only ${stockCount} left! 🔥`}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-brand-text leading-tight pt-1">
              {nameLabel}
            </h1>
            
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-brand-text">{product.rating}</span>
              <span className="text-xs text-brand-muted">({product.reviews} {locale === 'bn' ? 'টি রিভিউ' : 'reviews'})</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-4 p-4 rounded-2xl bg-brand-surface border border-brand-border">
            {product.sale_price !== null ? (
              <>
                <span className="text-3xl font-black text-brand-secondary">৳{product.sale_price}</span>
                <span className="text-sm text-brand-muted line-through">৳{product.price}</span>
              </>
            ) : (
              <span className="text-3xl font-black text-brand-text">৳{product.price}</span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-brand-text">
              {locale === 'bn' ? 'পণ্য বিবরণী' : 'Product Description'}
            </h3>
            <p className="text-xs md:text-sm text-brand-muted leading-relaxed">
              {desc}
            </p>
          </div>

          {/* Options: Colors & Sizes */}
          <div className="space-y-4 pt-4 border-t border-brand-border">
            {selectedColor && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-brand-muted">
                  {locale === 'bn' ? `কালার নির্বাচন করুন: ${selectedColor.bn}` : `Select Color: ${selectedColor.en}`}
                </span>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.en}
                      onClick={() => setSelectedColor(color)}
                      className={`h-8 w-8 rounded-full border-2 transition-all-custom flex items-center justify-center ${
                        selectedColor.en === color.en 
                          ? 'border-brand-primary scale-110 shadow-md' 
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={locale === 'bn' ? color.bn : color.en}
                    >
                      {selectedColor.en === color.en && (
                        <span className={`h-2 w-2 rounded-full ${color.hex === '#FFFFFF' ? 'bg-black' : 'bg-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-brand-muted">
                  {locale === 'bn' ? 'সাইজ:' : 'Size:'}
                </span>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
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
          </div>

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
                className="flex-1 py-3.5 px-6 rounded-2xl bg-brand-primary text-white font-extrabold hover:bg-brand-primary-alt shadow-lg shadow-brand-primary/25 transition-all-custom text-sm text-center"
              >
                {locale === 'bn' ? 'সরাসরি এখনই অর্ডার করুন 🛒' : 'Order Directly Now 🛒'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Benefits Section */}
      <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 md:p-8 space-y-6">
        <h3 className="font-extrabold text-brand-text text-base border-b border-brand-border pb-3 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-brand-primary" />
          <span>{locale === 'bn' ? 'এই প্রোডাক্টের চমৎকার সুবিধাসমূহ:' : 'Premium Product Features:'}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs md:text-sm font-semibold text-brand-text">
          <div className="flex items-start gap-2.5">
            <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {locale === 'bn' ? '১০০% মরিচা-প্রতিরোধক ও উন্নতমানের ফিনিশিং পেইন্ট।' : '100% Anti-rust powder coat for outdoor durability.'}
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {locale === 'bn' ? 'সম্পূর্ণ হাতে তৈরি আকর্ষণীয় জ্যামিতিক নকশা।' : 'Handcrafted geometric aesthetics for premium homes.'}
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {locale === 'bn' ? 'সহজে ওয়ালে হ্যাং করার স্ক্রু ও গাইডলাইন সহ।' : 'Quick 1-minute mounting kits included for free.'}
            </p>
          </div>
        </div>
      </div>

      {/* Inline Checkout Order Form Card */}
      <div ref={formRef} id="order-form" className="max-w-2xl mx-auto bg-white border-2 border-brand-primary rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 bg-brand-primary text-white text-[9px] font-black uppercase tracking-wider py-1 px-4 rounded-bl-xl">
          {locale === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash On Delivery'}
        </div>

        {/* Title */}
        <div className="text-center space-y-2 border-b border-brand-border pb-4">
          <h2 className="text-xl md:text-2xl font-black text-brand-text">
            {locale === 'bn' ? 'অর্ডার করতে নিচের ফর্মটি পূরণ করুন' : 'Fill out the form below to order'}
          </h2>
          <p className="text-xs text-brand-muted font-bold">
            {locale === 'bn' ? '🚚 আমাদের প্রতিনিধি কল করে অর্ডার কনফার্ম করবেন।' : '🚚 No advance payment needed, pay upon receipt.'}
          </p>
        </div>

        {/* Order Details Preview summary */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 flex gap-4 items-center text-xs">
          <img src={product.image} className="h-12 w-12 rounded-lg object-cover border border-brand-border" />
          <div className="flex-1 min-w-0">
            <span className="font-extrabold text-brand-text truncate block">{nameLabel}</span>
            <span className="text-[10px] text-brand-muted block mt-0.5">
              {selectedColor && `${locale === 'bn' ? 'রঙ: ' + selectedColor.bn : 'Color: ' + selectedColor.en}`}
              {selectedSize && ` / ${locale === 'bn' ? 'সাইজ: ' + selectedSize.bn : 'Size: ' + selectedSize.en}`}
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
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-800 font-semibold leading-relaxed">
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
            className="w-full py-4 rounded-2xl bg-brand-primary text-white font-black text-xs hover:bg-brand-primary-alt shadow-lg shadow-brand-primary/25 transition-all-custom flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
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
        <h3 className="font-extrabold text-brand-text text-base">
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
                <span className="font-extrabold text-brand-text">{rev.name}</span>
                <span className="text-[10px] text-brand-muted">{rev.date}</span>
              </div>
              <div className="flex text-yellow-400">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
              </div>
              <p className="text-xs text-brand-muted leading-relaxed font-semibold">
                {locale === 'bn' ? rev.comment_bn : rev.comment_en}
              </p>
            </div>
          ))}
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
