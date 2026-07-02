'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { CheckCircle2, PhoneCall, MapPin, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerDistrict: string;
  paymentMethod: 'cod' | 'bkash';
  shippingCharge: number;
  discountAmount?: number;
  subtotal?: number;
  grandTotal?: number;
}

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const locale = useLocale();
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const details = sessionStorage.getItem('last_order_details');
    if (details) {
      try {
        setOrder(JSON.parse(details));
      } catch (e) {
        console.error('Error parsing order confirmation data:', e);
      }
    }
  }, []);

  // Safe fallback if order was not created in current session or page reloaded directly
  const orderId = order?.orderId || params.id || 'ORD-982761';
  const name = order?.customerName || (locale === 'bn' ? 'সম্মানিত কাস্টমার' : 'Valued Customer');
  const phone = order?.customerPhone || '017XXXXXXXX';
  const address = order?.customerAddress || (locale === 'bn' ? 'সরাসরি ডেলিভারি ঠিকানা' : 'Specified shipping address');
  const district = order?.customerDistrict || (locale === 'bn' ? 'ঢাকা' : 'Dhaka');
  const payment = order?.paymentMethod || 'cod';
  const shipping = order?.shippingCharge !== undefined ? order.shippingCharge : 80;
  const discount = order?.discountAmount || 0;
  const subtotal = order?.subtotal !== undefined ? order.subtotal : 0;
  const grandTotal = order?.grandTotal !== undefined ? order.grandTotal : shipping + subtotal - discount;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16 pt-4 px-4 sm:px-0 text-center">
      {/* Success Badge Banner */}
      <div className="space-y-4">
        <div className="inline-flex p-3 rounded-full bg-brand-primary/10 text-brand-primary animate-bounce">
          <CheckCircle2 className="h-14 w-14 stroke-[1.5]" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-black text-brand-text tracking-tight">
            {locale === 'bn' ? 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!' : 'Order Placed Successfully!'}
          </h1>
          <p className="text-xs text-brand-muted font-bold max-w-sm mx-auto leading-relaxed">
            {locale === 'bn' 
              ? 'আমাদের Sicily শপে অর্ডার করার জন্য আপনাকে আন্তরিক ধন্যবাদ।' 
              : 'Thank you for shopping with Sicily. Your order is registered.'}
          </p>
        </div>
      </div>

      {/* Confirmation Call Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-start gap-3 text-left max-w-lg mx-auto">
        <PhoneCall className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {locale === 'bn'
            ? `আমরা আগামী ২৪ ঘণ্টার মধ্যে আপনার মোবাইল নম্বর (${phone})-এ কল দিয়ে অর্ডারটি নিশ্চিত করব এবং ডেলিভারি শিডিউল জানাবো।`
            : `We will call you on your phone number (${phone}) within 24 hours to verify details and confirm the delivery schedule.`}
        </p>
      </div>

      {/* Invoice Card */}
      <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 text-left shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border pb-4 gap-2">
          <div>
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
              {locale === 'bn' ? 'ইনভয়েস আইডি' : 'Invoice Number'}
            </span>
            <span className="text-base font-extrabold text-brand-text mt-0.5 block">{orderId}</span>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
              {locale === 'bn' ? 'পেমেন্ট স্ট্যাটাস' : 'Payment Status'}
            </span>
            <span className={`inline-block px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold border ${
              payment === 'cod' 
                ? 'bg-amber-50 border-amber-200 text-amber-700' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              {payment === 'cod' 
                ? (locale === 'bn' ? 'ডেলিভারিতে পরিশোধ' : 'Pay on Delivery') 
                : (locale === 'bn' ? 'ইনস্ট্যান্ট পেমেন্ট' : 'Instant Paid')}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-brand-border pb-6">
          {/* Customer & Address Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-brand-text">
              <MapPin className="h-4 w-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block">{locale === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Delivery Address:'}</span>
                <span className="font-medium text-brand-muted mt-1 block leading-relaxed">
                  {name}<br />
                  {address}, {district}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-brand-text">
              <CreditCard className="h-4 w-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block">{locale === 'bn' ? 'পেমেন্ট পদ্ধতি:' : 'Payment Method:'}</span>
                <span className="font-bold text-brand-muted mt-1 block">
                  {payment === 'cod' 
                    ? (locale === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery (COD)') 
                    : (locale === 'bn' ? 'বিকাশ (bKash Wallet)' : 'bKash Mobile Wallet')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Summary Details */}
        <div className="space-y-3 text-xs">
          {subtotal > 0 && (
            <div className="flex justify-between text-brand-muted">
              <span>{locale === 'bn' ? 'পণ্যের মূল্য' : 'Subtotal'}</span>
              <span className="font-semibold text-brand-text">৳{subtotal}</span>
            </div>
          )}
          <div className="flex justify-between text-brand-muted">
            <span>{locale === 'bn' ? 'ডেলিভারি খরচ' : 'Delivery Charge'}</span>
            <span className="font-semibold text-brand-text">৳{shipping}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-brand-primary font-semibold">
              <span>{locale === 'bn' ? 'কুপন ছাড়' : 'Coupon Discount'}</span>
              <span>-৳{discount}</span>
            </div>
          )}
          <div className="flex justify-between text-brand-text font-extrabold text-sm border-t border-brand-border pt-3 items-baseline">
            <span>{locale === 'bn' ? 'মোট মূল্য' : 'Grand Total'}</span>
            <span className="text-base font-black text-brand-secondary">৳{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Navigation CTA */}
      <div className="flex justify-center">
        <Link 
          href={`/${locale}/shop`}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-primary text-white font-extrabold text-xs shadow-lg shadow-brand-primary/25 hover:bg-brand-primary-alt transition-all-custom"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{locale === 'bn' ? 'কেনাকাটা চালিয়ে যান' : 'Continue Shopping'}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
