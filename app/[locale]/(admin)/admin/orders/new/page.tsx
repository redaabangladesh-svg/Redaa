'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft, Save, PlusCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name_en: string;
  name_bn: string;
  price: number;
  sale_price: number | null;
  image: string;
  category: string;
}

const DEFAULT_MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name_en: 'Premium Metal Flower Hanger',
    name_bn: 'প্রিমিয়াম মেটাল ফ্লাওয়ার হ্যাঙ্গার',
    price: 1250,
    sale_price: 990,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600',
    category: 'hangers'
  },
  {
    id: '2',
    name_en: 'Handcrafted Pastel Tulip Bouquet',
    name_bn: 'হ্যান্ডক্রাফটেড পেস্টেল টিউলিপ তোড়া',
    price: 850,
    sale_price: null,
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&q=80&w=600',
    category: 'flowers'
  }
];

export default function AdminNewOrderPage() {
  const locale = useLocale();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [source, setSource] = useState('Facebook');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('dhaka');
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState('COD');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sicily_products_list');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProducts(parsed);
        if (parsed.length > 0) {
          setSelectedProductId(parsed[0].id);
        }
      } catch (e) {
        console.error(e);
        setProducts(DEFAULT_MOCK_PRODUCTS);
        setSelectedProductId('1');
      }
    } else {
      setProducts(DEFAULT_MOCK_PRODUCTS);
      setSelectedProductId('1');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !selectedProductId) {
      alert(locale === 'bn' ? 'অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।' : 'Please fill out all required fields.');
      return;
    }

    if (!/^(013|014|015|016|017|018|019)\d{8}$/.test(phone)) {
      alert(locale === 'bn' ? 'অনুগ্রহ করে একটি সঠিক মোবাইল নম্বর দিন।' : 'Please enter a valid 11-digit mobile number.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Find shipping charges from settings or fallback
      const storedInside = localStorage.getItem('sicily_delivery_inside');
      const storedOutside = localStorage.getItem('sicily_delivery_outside');
      const deliveryInside = storedInside ? Number(storedInside) : 80;
      const deliveryOutside = storedOutside ? Number(storedOutside) : 150;
      const shippingCharge = district === 'dhaka' ? deliveryInside : deliveryOutside;

      // Find product price
      const matchedProd = products.find(p => p.id === selectedProductId);
      const activePrice = matchedProd 
        ? (matchedProd.sale_price !== null ? matchedProd.sale_price : matchedProd.price)
        : 1000;

      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      // Construct and insert order
      const storedOrders = localStorage.getItem('sicily_orders_list');
      let ordersList = [];
      if (storedOrders) {
        try {
          ordersList = JSON.parse(storedOrders);
        } catch(e) {}
      }

      const newOrder = {
        id: orderId,
        customer: name,
        phone: phone,
        amount: activePrice * quantity + shippingCharge,
        payment: paymentStatus,
        status: 'new' as const,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        address: address,
        district: district === 'dhaka' ? 'Dhaka' : 'Outside Dhaka',
        shipping: shippingCharge
      };

      ordersList.unshift(newOrder);
      localStorage.setItem('sicily_orders_list', JSON.stringify(ordersList));

      setIsSubmitting(false);
      router.push(`/${locale}/admin/orders`);
    }, 800);
  };

  return (
    <div className="max-w-3xl space-y-6 font-sans">
      {/* Back Button */}
      <Link
        href={`/${locale}/admin/orders`}
        className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{locale === 'bn' ? 'অর্ডার তালিকায় ফিরে যান' : 'Back to Orders'}</span>
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
              <option value="Facebook">Facebook Page</option>
              <option value="Instagram">Instagram Direct Message</option>
              <option value="Phone">Phone Call</option>
              <option value="WhatsApp">WhatsApp Message</option>
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
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            >
              <option value="COD">{locale === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery'}</option>
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
                const priceVal = p.sale_price !== null ? p.sale_price : p.price;
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
