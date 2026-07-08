'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useCart } from '@/lib/cart';
import CheckoutForm from '@/components/store/CheckoutForm';
import { ShoppingBag, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface Coupon {
  code: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  value: number;
  min_order: number;
}

export default function CheckoutPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { cartItems, cartTotal } = useCart();

  // State for shipping charges based on chosen district
  const [shippingCharge, setShippingCharge] = useState(80); // default to Dhaka (৳80)
  const [selectedDistrict, setSelectedDistrict] = useState('dhaka');

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    setCouponError('');
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    setApplyingCoupon(true);
    const supabase = createClient();
    const { data: coupon } = await supabase
      .from('coupons')
      .select('code, type, value, min_order, max_uses, used_count, expires_at, is_active')
      .eq('code', cleanCode)
      .maybeSingle();
    setApplyingCoupon(false);

    if (!coupon || !coupon.is_active) {
      setCouponError(isBn ? 'ভুল কুপন কোড! অনুগ্রহ করে সঠিক কোড দিন।' : 'Invalid coupon code! Please try again.');
      return;
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      setCouponError(isBn ? 'এই কুপনের মেয়াদ শেষ হয়ে গেছে।' : 'This coupon has expired.');
      return;
    }
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      setCouponError(isBn ? 'এই কুপনের ব্যবহারসীমা শেষ হয়ে গেছে।' : 'This coupon has reached its usage limit.');
      return;
    }
    if (cartTotal < coupon.min_order) {
      setCouponError(
        isBn
          ? `এই কুপন ব্যবহার করতে সর্বনিম্ন ৳${coupon.min_order} অর্ডার করতে হবে।`
          : `This coupon requires a minimum order of ৳${coupon.min_order}.`
      );
      return;
    }

    setAppliedCoupon(coupon);
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Calculations
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round((cartTotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.type === 'fixed') {
      discountAmount = appliedCoupon.value;
    } else if (appliedCoupon.type === 'free_delivery') {
      discountAmount = shippingCharge;
    }
  }

  const grandTotal = Math.max(0, cartTotal + shippingCharge - discountAmount);

  return (
    <div className="space-y-8 pb-16 px-4 sm:px-0">
      {/* Title */}
      <div className="border-b border-brand-border pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-brand-text tracking-tight">
          {locale === 'bn' ? 'চেকআউট ও বিলিং' : 'Checkout & Billing'}
        </h1>
        <p className="text-xs text-brand-muted mt-1.5 font-medium">
          {locale === 'bn' ? 'অর্ডার সম্পন্ন করতে ফর্মটি পূরণ করুন।' : 'Fill out the form below to complete your purchase.'}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white border border-brand-border rounded-3xl max-w-xl mx-auto">
          <ShoppingBag className="h-16 w-16 text-brand-border stroke-[1.5] mx-auto" />
          <p className="text-sm font-bold text-brand-text">
            {locale === 'bn' ? 'আপনার কার্টে কোনো পণ্য নেই!' : 'Your cart is empty!'}
          </p>
          <p className="text-xs text-brand-muted leading-relaxed max-w-xs mx-auto">
            {locale === 'bn' 
              ? 'অর্ডার করতে হলে প্রথমে শপ পেজ থেকে কার্টে পণ্য যোগ করুন।' 
              : 'Add products to your cart before proceeding to checkout.'}
          </p>
          <Link 
            href={`/${locale}/shop`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-primary text-white font-extrabold text-xs shadow-md shadow-brand-primary/20 hover:bg-brand-primary-alt transition-all-custom"
          >
            <span>{locale === 'bn' ? 'পণ্য পছন্দ করুন' : 'Start Browsing Products'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Panel: Checkout Input Form */}
          <div className="lg:col-span-2">
            <CheckoutForm 
              shippingCharge={shippingCharge} 
              setShippingCharge={setShippingCharge}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              discountAmount={discountAmount}
              couponCode={appliedCoupon?.code || ''}
            />
          </div>

          {/* Right Panel: Order Summary & Coupon box */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-6 shadow-sm">
              <h3 className="font-extrabold text-brand-text text-sm border-b border-brand-border pb-3">
                {locale === 'bn' ? 'অর্ডার সারসংক্ষেপ' : 'Order Summary'}
              </h3>

              {/* Items List */}
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
                {cartItems.map((item, idx) => {
                  const activePrice = item.sale_price !== null ? item.sale_price : item.price;
                  const name = locale === 'bn' ? item.name_bn : item.name_en;

                  return (
                    <div key={`${item.id}-${idx}`} className="flex gap-3 text-xs">
                      <img src={item.image} alt={name} className="h-12 w-12 rounded-lg object-cover border border-brand-border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-brand-text line-clamp-1">{name}</h4>
                        {item.variant && (
                          <p className="text-[9px] text-brand-muted mt-0.5">
                            {item.variant.color_en && `${locale === 'bn' ? item.variant.color_bn : item.variant.color_en}`}
                            {item.variant.size_en && ` / ${locale === 'bn' ? item.variant.size_bn : item.variant.size_en}`}
                          </p>
                        )}
                        <p className="text-[10px] text-brand-muted mt-1">
                          {item.qty} × ৳{activePrice}
                        </p>
                      </div>
                      <span className="font-bold text-brand-text">৳{activePrice * item.qty}</span>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Box Input */}
              <div className="border-t border-brand-border pt-4 space-y-3">
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
                  {locale === 'bn' ? 'কুপন কোড ব্যবহার করুন:' : 'Promo / Discount Coupon:'}
                </span>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="font-extrabold">{appliedCoupon.code}</span>
                        <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">
                          {appliedCoupon.type === 'percentage' && (locale === 'bn' ? `${appliedCoupon.value}% ছাড় দেওয়া হয়েছে` : `${appliedCoupon.value}% discount applied`)}
                          {appliedCoupon.type === 'fixed' && `৳${appliedCoupon.value} off`}
                          {appliedCoupon.type === 'free_delivery' && (locale === 'bn' ? 'ফ্রি ডেলিভারি ছাড়' : 'Free shipping applied')}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-red-600 hover:text-red-700 underline flex-shrink-0"
                    >
                      {locale === 'bn' ? 'বাতিল' : 'Remove'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-2.5 h-4.5 w-4.5 text-brand-muted" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder={locale === 'bn' ? 'কুপন কোড লিখুন' : 'Enter coupon code'}
                          className="w-full bg-brand-surface border border-brand-border rounded-xl py-2 pl-9 pr-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold uppercase"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-brand-primary text-white font-extrabold text-xs rounded-xl hover:bg-brand-primary-alt transition-colors"
                      >
                        {locale === 'bn' ? 'প্রয়োগ' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{couponError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Invoice Calculations */}
              <div className="border-t border-brand-border pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-brand-muted">
                  <span>{locale === 'bn' ? 'উপ-মোট' : 'Subtotal'}</span>
                  <span className="font-semibold text-brand-text">৳{cartTotal}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>{locale === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Charge'}</span>
                  <span className="font-semibold text-brand-text">৳{shippingCharge}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>{locale === 'bn' ? 'কুপন ডিসকাউন্ট' : 'Coupon Discount'} ({appliedCoupon?.code})</span>
                    <span>-৳{discountAmount}</span>
                  </div>
                )}
                <div className="border-t border-brand-border pt-3 flex justify-between items-baseline text-sm">
                  <span className="font-extrabold text-brand-text">
                    {locale === 'bn' ? 'সর্বমোট মূল্য' : 'Grand Total'}
                  </span>
                  <span className="text-lg font-black text-brand-secondary">৳{grandTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
