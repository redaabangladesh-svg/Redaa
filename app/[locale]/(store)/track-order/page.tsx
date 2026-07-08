'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Package, XCircle, LogIn, ArrowRight } from 'lucide-react';

interface OrderSummary {
  id: string;
  order_number: string;
  total: number;
  order_status: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, { en: string; bn: string }> = {
  new: { en: 'New', bn: 'নতুন' },
  confirmed: { en: 'Confirmed', bn: 'কনফার্ম' },
  processing: { en: 'Processing', bn: 'প্রসেসিং' },
  shipped: { en: 'Shipped', bn: 'পাঠানো হয়েছে' },
  delivered: { en: 'Delivered', bn: 'ডেলিভার হয়েছে' },
  cancelled: { en: 'Cancelled', bn: 'বাতিল' },
  returned: { en: 'Returned', bn: 'ফেরত' },
};

const isPhoneLike = (value: string) => /^01\d{9}$/.test(value.replace(/\D/g, ''));

export default function TrackOrderPage() {
  const locale = useLocale();
  const router = useRouter();
  const isBn = locale === 'bn';

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<OrderSummary[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const value = query.trim();
    if (!value) {
      setErrorMsg(isBn ? 'অর্ডার নম্বর অথবা মোবাইল নম্বর দিন।' : 'Please enter your order number or phone number.');
      return;
    }

    setLoading(true);
    setSearched(true);
    setResults([]);

    if (isPhoneLike(value)) {
      // Phone search: may match multiple orders — show a list
      const response = await fetch(`/api/orders/track?phone=${encodeURIComponent(value)}`);
      const { orders } = await response.json();

      if (orders && orders.length > 0) {
        setResults(orders);
      }
    } else {
      // Order number search: go straight to its detail page
      const response = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(value)}`);
      const { order } = await response.json();

      if (order) {
        router.push(`/order/${order.id}`);
        return;
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8 font-sans">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mx-auto">
          <Package className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-brand-text">
          {isBn ? 'আপনার অর্ডার ট্র্যাক করুন' : 'Track Your Order'}
        </h1>
        <p className="text-xs text-brand-muted max-w-sm mx-auto leading-relaxed">
          {isBn
            ? 'অর্ডার নম্বর অথবা অর্ডারের সময় দেওয়া মোবাইল নম্বর — যেকোনো একটি দিয়ে খুঁজুন।'
            : 'Search using either your order number or the phone number used at checkout.'}
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleTrack} className="bg-white border border-brand-border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-text">
            {isBn ? 'অর্ডার নম্বর অথবা মোবাইল নম্বর' : 'Order Number or Phone Number'}
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ORD-2026-0001 অথবা 017XXXXXXXX"
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
          />
        </div>
        {errorMsg && <p className="text-[11px] text-rose-600 font-bold">{errorMsg}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-primary text-white font-extrabold text-xs shadow-sm hover:bg-brand-primary-alt transition-all-custom disabled:opacity-60"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>{isBn ? 'ট্র্যাক করুন' : 'Track Order'}</span>
            </>
          )}
        </button>
      </form>

      {/* No results */}
      {searched && !loading && results.length === 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center">
          <XCircle className="h-6 w-6 text-rose-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-rose-700">
            {isBn ? 'এই তথ্যে কোনো অর্ডার পাওয়া যায়নি। আবার চেষ্টা করুন।' : 'No order found with this information. Please try again.'}
          </p>
        </div>
      )}

      {/* Phone search results list */}
      {results.length > 0 && (
        <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm divide-y divide-brand-border">
          {results.map((order) => (
            <Link
              key={order.id}
              href={`/order/${order.id}`}
              className="flex items-center justify-between p-4 hover:bg-brand-surface/60 transition-all-custom"
            >
              <div>
                <span className="font-bold text-brand-text text-xs block">{order.order_number}</span>
                <span className="text-[10px] text-brand-muted block mt-0.5">
                  {new Date(order.created_at).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-bold text-brand-secondary text-xs block">৳{order.total}</span>
                  <span className="text-[9px] font-bold text-brand-primary uppercase">
                    {isBn ? STATUS_LABEL[order.order_status]?.bn || order.order_status : STATUS_LABEL[order.order_status]?.en || order.order_status}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-brand-muted" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Login CTA */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <LogIn className="h-4.5 w-4.5 text-brand-primary flex-shrink-0" />
          <p className="text-xs text-brand-muted font-semibold">
            {isBn ? 'অ্যাকাউন্ট থাকলে লগইন করে আপনার সব অর্ডার একসাথে দেখুন।' : 'Have an account? Log in to see all your orders in one place.'}
          </p>
        </div>
        <Link
          href={`/account`}
          className="flex-shrink-0 text-xs font-extrabold text-brand-primary hover:text-brand-secondary transition-colors whitespace-nowrap"
        >
          {isBn ? 'লগইন' : 'Log In'}
        </Link>
      </div>
    </div>
  );
}
