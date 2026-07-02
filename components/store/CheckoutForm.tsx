'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useCart } from '@/lib/cart';
import { useRouter } from 'next/navigation';
import { Truck, CheckCircle2, ShieldAlert } from 'lucide-react';

interface CheckoutFormProps {
  shippingCharge: number;
  setShippingCharge: (charge: number) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  discountAmount?: number;
  couponCode?: string;
}

// Major districts in Bangladesh
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
  { id: 'bogra', en: 'Bogra', bn: 'বগুড়া' },
  { id: 'jessore', en: 'Jessore', bn: 'যশোর' },
  { id: 'feni', en: 'Feni', bn: 'ফেনী' },
  { id: 'tangail', en: 'Tangail', bn: 'টাঙ্গাইল' },
  { id: 'pabna', en: 'Pabna', bn: 'পাবনা' },
  { id: 'kushtia', en: 'Kushtia', bn: 'কুষ্টিয়া' }
];

export default function CheckoutForm({ 
  shippingCharge, 
  setShippingCharge, 
  selectedDistrict, 
  setSelectedDistrict,
  discountAmount = 0,
  couponCode = ''
}: CheckoutFormProps) {
  const locale = useLocale();
  const router = useRouter();
  const { clearCart, cartTotal } = useCart();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load charges dynamically based on configured settings
  useEffect(() => {
    const storedInside = localStorage.getItem('sicily_delivery_inside');
    const storedOutside = localStorage.getItem('sicily_delivery_outside');
    const insideCharge = storedInside ? parseInt(storedInside, 10) : 80;
    const outsideCharge = storedOutside ? parseInt(storedOutside, 10) : 150;

    if (selectedDistrict === 'dhaka') {
      setShippingCharge(insideCharge);
    } else if (selectedDistrict !== '') {
      setShippingCharge(outsideCharge);
    } else {
      setShippingCharge(0);
    }
  }, [selectedDistrict, setShippingCharge]);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!name.trim()) {
      setErrorMsg(locale === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your full name.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg(locale === 'bn' ? 'অনুগ্রহ করে আপনার ঠিকানা লিখুন।' : 'Please enter your shipping address.');
      return;
    }
    if (!selectedDistrict) {
      setErrorMsg(locale === 'bn' ? 'অনুগ্রহ করে জেলা নির্বাচন করুন।' : 'Please select your shipping district.');
      return;
    }

    // BD Phone standard validation: 11 digits, starts with 01
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMsg(
        locale === 'bn' 
          ? 'অনুগ্রহ করে সঠিক ১১-ডিজিটের মোবাইল নম্বর লিখুন (যেমন: ০১৭XXXXXXXX)।' 
          : 'Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX).'
      );
      return;
    }

    setIsSubmitting(true);

    // Mock order submission API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Generate mock random order invoice ID
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Get existing orders from localStorage or empty array
      const existingStr = localStorage.getItem('sicily_orders_list');
      let ordersList = [];
      if (existingStr) {
        try {
          ordersList = JSON.parse(existingStr);
        } catch (e) {
          console.error(e);
        }
      }

      const newOrder = {
        id: orderId,
        customer: name,
        phone: phone,
        amount: cartTotal + shippingCharge - discountAmount,
        payment: paymentMethod === 'cod' ? 'COD' : 'bKash',
        status: 'new' as const,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      ordersList.unshift(newOrder); // Add to beginning
      localStorage.setItem('sicily_orders_list', JSON.stringify(ordersList));

      // Store checkout metadata in session storage for the confirmation page
      sessionStorage.setItem('last_order_details', JSON.stringify({
        orderId,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        customerDistrict: BD_DISTRICTS.find(d => d.id === selectedDistrict)?.[locale === 'bn' ? 'bn' : 'en'] || selectedDistrict,
        paymentMethod,
        shippingCharge,
        discountAmount,
        couponCode,
        subtotal: cartTotal,
        grandTotal: cartTotal + shippingCharge - discountAmount
      }));

      // Clear Cart
      clearCart();

      // Redirect to Order Confirmation page
      router.push(`/${locale}/order/${orderId}`);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Customer Info Card */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="font-extrabold text-brand-text text-sm border-b border-brand-border pb-3">
          {locale === 'bn' ? '১. শিপিং ও ডেলিভারি তথ্য' : '1. Shipping & Delivery Info'}
        </h3>

        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-text">
            {locale === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
          </label>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={locale === 'bn' ? 'নাম লিখুন...' : 'Enter your name...'}
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-medium"
            required
          />
        </div>

        {/* Mobile Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-text">
            {locale === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Phone Number *'}
          </label>
          <input
            type="tel"
            name="tel"
            autoComplete="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={locale === 'bn' ? '০১৭XXXXXXXX' : '017XXXXXXXX'}
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-medium"
            maxLength={11}
            required
          />
        </div>

        {/* District selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-text">
            {locale === 'bn' ? 'জেলা নির্বাচন করুন *' : 'Select District *'}
          </label>
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            required
          >
            <option value="">
              {locale === 'bn' ? '-- জেলা পছন্দ করুন --' : '-- Choose District --'}
            </option>
            {BD_DISTRICTS.map((district) => (
              <option key={district.id} value={district.id}>
                {locale === 'bn' ? district.bn : district.en}
              </option>
            ))}
          </select>
        </div>

        {/* Full Delivery address */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-text">
            {locale === 'bn' ? 'পূর্ণাঙ্গ ঠিকানা (গ্রাম, রোড, থানা) *' : 'Full Delivery Address (Street, Area, Upazila) *'}
          </label>
          <textarea
            name="street-address"
            autoComplete="street-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={locale === 'bn' ? 'আপনার পূর্ণাঙ্গ ঠিকানা লিখুন...' : 'Enter your detailed street address...'}
            rows={3}
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-medium resize-none"
            required
          />
        </div>
      </div>

      {/* Payment Options Card */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="font-extrabold text-brand-text text-sm border-b border-brand-border pb-3">
          {locale === 'bn' ? '২. পেমেন্ট পদ্ধতি' : '2. Payment Method'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* COD */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border transition-all-custom cursor-pointer ${
            paymentMethod === 'cod' 
              ? 'border-brand-primary bg-brand-primary/5' 
              : 'border-brand-border hover:border-brand-primary/30'
          }`}>
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
              className="mt-0.5 text-brand-primary focus:ring-brand-primary"
            />
            <div>
              <span className="text-xs font-bold text-brand-text block">
                {locale === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery (COD)'}
              </span>
              <span className="text-[10px] text-brand-muted mt-0.5 block leading-relaxed">
                {locale === 'bn' 
                  ? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন। কোনো অগ্রিম ফি লাগবে না।' 
                  : 'Pay with cash upon physical delivery. No advance charges required.'}
              </span>
            </div>
          </label>

          {/* bKash */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border transition-all-custom cursor-pointer ${
            paymentMethod === 'bkash' 
              ? 'border-brand-primary bg-brand-primary/5' 
              : 'border-brand-border hover:border-brand-primary/30'
          }`}>
            <input
              type="radio"
              name="payment"
              value="bkash"
              checked={paymentMethod === 'bkash'}
              onChange={() => setPaymentMethod('bkash')}
              className="mt-0.5 text-brand-primary focus:ring-brand-primary"
            />
            <div>
              <span className="text-xs font-bold text-brand-text block">
                {locale === 'bn' ? 'বিকাশ পেমেন্ট' : 'bKash Instant Payment'}
              </span>
              <span className="text-[10px] text-brand-muted mt-0.5 block leading-relaxed">
                {locale === 'bn' 
                  ? 'বিকাশ ওয়ালেট থেকে দ্রুত ও নিরাপদে পেমেন্ট করুন।' 
                  : 'Fast and secure checkout via bKash mobile banking wallet.'}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Place Order CTA */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-primary text-white font-extrabold hover:bg-brand-primary-alt shadow-lg shadow-brand-primary/25 transition-all-custom text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            <span>{locale === 'bn' ? 'অর্ডার সম্পন্ন করুন' : 'Confirm Order'}</span>
          </>
        )}
      </button>
    </form>
  );
}
