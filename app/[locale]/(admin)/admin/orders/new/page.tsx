'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft, Save, CheckCircle, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/lib/products-db';
import type { HomeProduct } from '@/lib/products';
import { fetchSettings } from '@/lib/settings';
import { BD_DISTRICTS } from '@/lib/districts';

export default function AdminNewOrderPage() {
  const locale = useLocale();
  const router = useRouter();

  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [source, setSource] = useState('facebook');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('dhaka');

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentNote, setPaymentNote] = useState('cod');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchProducts().then((rows) => {
      setProducts(rows);
      if (rows.length > 0) setSelectedProductId(rows[0].id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !phone || !address || !selectedProductId) {
      setErrorMsg(locale === 'bn' ? 'অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।' : 'Please fill out all required fields.');
      return;
    }

    if (!/^(013|014|015|016|017|018|019)\d{8}$/.test(phone)) {
      setErrorMsg(locale === 'bn' ? 'অনুগ্রহ করে একটি সঠিক মোবাইল নম্বর দিন।' : 'Please enter a valid 11-digit mobile number.');
      return;
    }

    const matchedProd = products.find((p) => p.id === selectedProductId);
    if (!matchedProd) return;

    setIsSubmitting(true);

    const settings = await fetchSettings(['delivery_inside', 'delivery_outside']);
    const deliveryInside = Number(settings.delivery_inside ?? 80);
    const deliveryOutside = Number(settings.delivery_outside ?? 150);
    const shippingCharge = district === 'dhaka' ? deliveryInside : deliveryOutside;
    const districtLabel = BD_DISTRICTS.find((d) => d.id === district)?.bn || district;
    const activePrice = matchedProd.sale_price ?? matchedProd.price;
    const name_display = locale === 'bn' ? matchedProd.name_bn : matchedProd.name_en;

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: name,
        phone,
        address,
        district: districtLabel,
        items: [{
          productId: matchedProd.id,
          name: name_display,
          qty: quantity,
          price: activePrice,
        }],
        paymentMethod: 'cod',
        shippingCharge,
        source,
        notes: paymentNote !== 'cod' ? `Manually marked as ${paymentNote}` : undefined,
      }),
    });

    const result = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMsg(result.error || (locale === 'bn' ? 'অর্ডার তৈরি করা যায়নি।' : 'Could not create order.'));
      return;
    }

    router.push(`/admin/orders`);
  };

  return (
    <div className="max-w-3xl space-y-6 font-sans">
      {/* Back Button */}
      <Link
        href={`/admin/orders`}
        className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{locale === 'bn' ? 'অর্ডার তালিকায় ফিরে যান' : 'Back to Orders'}</span>
      </Link>

      {/* Header */}
      <div className="border-b border-brand-border pb-4">
        <h1 className="text-xl md:text-2xl font-black text-brand-text flex items-center gap-2">
          <PlusCircle className="h-6 w-6 text-brand-primary" />
          <span>{locale === 'bn' ? 'ম্যানুয়াল অর্ডার এন্ট্রি' : 'Manual Order Entry'}</span>
        </h1>
        <p className="text-xs text-brand-muted mt-1.5 font-medium">
          {locale === 'bn' ? 'ফেসবুক বা ইনস্টাগ্রাম পেজের কাস্টমারদের জন্য ম্যানুয়াল অর্ডার তৈরি করুন।' : 'Record manual orders coming from Facebook pages, Instagram messages or phone calls.'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
          {errorMsg}
        </div>
      )}

      {/* Form container */}
      <form onSubmit={handleSubmit} className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">

        {/* Source selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              Order Source <span className="text-rose-500">*</span>
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            >
              <option value="facebook">Facebook Page</option>
              <option value="instagram">Instagram Direct Message</option>
              <option value="phone">Phone Call</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              Customer Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Karim Rahman"
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              required
            />
          </div>
        </div>

        {/* Customer Address Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              District <span className="text-rose-500">*</span>
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            >
              <option value="dhaka">{locale === 'bn' ? 'ঢাকা (Dhaka)' : 'Inside Dhaka'}</option>
              <option value="outside">{locale === 'bn' ? 'ঢাকার বাইরে (Outside)' : 'Outside Dhaka'}</option>
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              Payment Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            >
              <option value="cod">{locale === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery'}</option>
              <option value="bKash">{locale === 'bn' ? 'বিকাশ সম্পন্ন (Paid bKash)' : 'bKash Paid'}</option>
              <option value="Paid">{locale === 'bn' ? 'পেইড (Paid)' : 'Paid'}</option>
            </select>
          </div>
        </div>

        {/* Address textarea */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">
            Delivery Address <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House, Road, Area, Landmark info..."
            rows={2}
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-3 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-semibold leading-relaxed"
            required
          />
        </div>

        {/* Product selection grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-brand-border">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              Select Product <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            >
              {products.map((p) => {
                const name = locale === 'bn' ? p.name_bn : p.name_en;
                const priceVal = p.sale_price ?? p.price;
                return (
                  <option key={p.id} value={p.id}>
                    {name} — ৳{priceVal}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl bg-brand-primary text-white font-extrabold text-xs hover:bg-brand-primary-alt shadow-lg shadow-brand-primary/25 transition-all-custom flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
        >
          {isSubmitting ? (
            <CheckCircle className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <Save className="h-4.5 w-4.5" />
          )}
          <span>{locale === 'bn' ? 'অর্ডার এন্ট্রি করুন' : 'Confirm Order Entry'}</span>
        </button>
      </form>
    </div>
  );
}
