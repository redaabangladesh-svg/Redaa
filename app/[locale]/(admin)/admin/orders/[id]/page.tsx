'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft, Clock, CheckCircle2, XCircle, User, Phone, MapPin, CreditCard, Calendar, ShoppingBag, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  customer: string;
  phone: string;
  amount: number;
  payment: string;
  status: 'new' | 'processing' | 'delivered' | 'cancelled';
  date: string;
  address?: string;
  district?: string;
  shipping?: number;
}

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const locale = useLocale();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<Order['status']>('new');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('sicily_orders_list');
    if (stored) {
      try {
        const parsed: Order[] = JSON.parse(stored);
        setOrders(parsed);
        
        const matched = parsed.find(o => o.id === params.id);
        if (matched) {
          setOrder(matched);
          setStatus(matched.status);
        } else {
          // If no order is found in list, fallback to a dynamic mock matching the ID
          const fallbackOrder: Order = {
            id: params.id,
            customer: 'Dynamic Customer',
            phone: '01700000000',
            amount: 1070,
            payment: 'COD',
            status: 'new',
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            address: 'Mirpur-10, Block-B, Road-5, House-12',
            district: 'Dhaka',
            shipping: 80
          };
          setOrder(fallbackOrder);
          setStatus(fallbackOrder.status);
        }
      } catch (e) {
        console.error('Error parsing orders list:', e);
      }
    }
  }, [params.id]);

  const handleStatusChange = (newStatus: Order['status']) => {
    setStatus(newStatus);
    setSuccessMsg('');

    if (!order) return;

    // Update the matching order in orders array
    const updatedOrders = orders.map((o) => {
      if (o.id === order.id) {
        return { ...o, status: newStatus };
      }
      return o;
    });

    setOrders(updatedOrders);
    localStorage.setItem('sicily_orders_list', JSON.stringify(updatedOrders));

    // Also update current view order
    setOrder({ ...order, status: newStatus });

    setSuccessMsg(
      locale === 'bn' 
        ? 'অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!' 
        : 'Order status updated successfully!'
    );
  };

  if (!order) {
    return (
      <div className="py-12 text-center text-brand-muted font-bold font-sans">
        {locale === 'bn' ? 'অর্ডার তথ্য লোড হচ্ছে...' : 'Loading order details...'}
      </div>
    );
  }

  const statusColors = 
    status === 'new' ? 'text-blue-700 bg-blue-50 border-blue-100' :
    status === 'processing' ? 'text-amber-700 bg-amber-50 border-amber-100' :
    status === 'delivered' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
    'text-rose-700 bg-rose-50 border-rose-100';

  const displayStatus = 
    status === 'new' ? (locale === 'bn' ? 'নতুন' : 'New') :
    status === 'processing' ? (locale === 'bn' ? 'প্রসেসিং' : 'Processing') :
    status === 'delivered' ? (locale === 'bn' ? 'ডেলিভার্ড' : 'Delivered') :
    (locale === 'bn' ? 'বাতিল' : 'Cancelled');

  return (
    <div className="max-w-4xl space-y-6 font-sans">
      {/* Back Button */}
      <Link
        href={`/${locale}/admin/orders`}
        className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{locale === 'bn' ? 'অর্ডার তালিকায় ফিরে যান' : 'Back to Orders List'}</span>
      </Link>

      {/* Header */}
      <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-brand-text">
            {locale === 'bn' ? `অর্ডার বিবরণী: ${order.id}` : `Order Details: ${order.id}`}
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 font-medium flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-brand-primary" />
            <span>{order.date}</span>
          </p>
        </div>

        {/* Current status badge */}
        <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide ${statusColors}`}>
          {displayStatus}
        </span>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Editor & Invoice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Columns: Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Profile card */}
          <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-brand-text text-sm border-b border-brand-border pb-3 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-brand-primary" />
              <span>{locale === 'bn' ? 'গ্রাহকের বিস্তারিত তথ্য' : 'Customer Profile'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div className="space-y-1">
                <span className="text-[10px] text-brand-muted font-bold block">{locale === 'bn' ? 'নাম' : 'Customer Name'}</span>
                <span className="text-brand-text font-extrabold block text-sm">{order.customer}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-brand-muted font-bold block">{locale === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</span>
                <span className="text-brand-primary font-bold block text-sm">{order.phone}</span>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-[10px] text-brand-muted font-bold block">{locale === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Shipping Address'}</span>
                <span className="text-brand-text leading-relaxed mt-1 block">
                  <MapPin className="h-4 w-4 inline mr-1 text-brand-primary flex-shrink-0 align-text-bottom" />
                  {order.address || 'Mirpur-10, Block-B, Road-5, House-12'}, {order.district || 'Dhaka'}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Products invoice card */}
          <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-brand-text text-sm border-b border-brand-border pb-3 flex items-center gap-2">
              <ShoppingBag className="h-4.5 w-4.5 text-brand-primary" />
              <span>{locale === 'bn' ? 'অর্ডারকৃত সামগ্রী' : 'Ordered Items'}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-lg bg-brand-surface border border-brand-border overflow-hidden flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-brand-text">Premium Metal Flower Hanger</h4>
                  <p className="text-[10px] text-brand-muted mt-0.5">Classic Gold / Small</p>
                </div>
                <div className="text-right">
                  <span className="font-bold block text-brand-text">৳{order.amount - (order.shipping || 80)}</span>
                  <span className="text-[10px] text-brand-muted block mt-0.5">Qty: 1</span>
                </div>
              </div>

              {/* Total calculations */}
              <div className="border-t border-brand-border pt-4 space-y-2">
                <div className="flex justify-between text-brand-muted">
                  <span>{locale === 'bn' ? 'উপ-মোট' : 'Subtotal'}</span>
                  <span>৳{order.amount - (order.shipping || 80)}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>{locale === 'bn' ? 'শিপিং চার্জ' : 'Shipping Charge'}</span>
                  <span>৳{order.shipping || 80}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-brand-text border-t border-brand-border pt-3 items-baseline">
                  <span>{locale === 'bn' ? 'সর্বমোট মূল্য' : 'Grand Total'}</span>
                  <span className="text-base font-black text-brand-secondary">৳{order.amount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workflow status editor */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-brand-text text-sm border-b border-brand-border pb-3">
              {locale === 'bn' ? 'স্ট্যাটাস আপডেট করুন' : 'Manage Workflow'}
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">
                {locale === 'bn' ? 'অর্ডার স্ট্যাটাস:' : 'Order Status:'}
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              >
                <option value="new">{locale === 'bn' ? 'নতুন (New)' : 'New / Pending'}</option>
                <option value="processing">{locale === 'bn' ? 'প্রসেসিং (Processing)' : 'Processing'}</option>
                <option value="delivered">{locale === 'bn' ? 'ডেলিভার্ড (Delivered)' : 'Delivered'}</option>
                <option value="cancelled">{locale === 'bn' ? 'বাতিল (Cancelled)' : 'Cancelled'}</option>
              </select>
            </div>

            <div className="text-[10px] text-brand-muted leading-relaxed font-semibold pt-2 border-t border-brand-border">
              {locale === 'bn'
                ? '* অর্ডার স্ট্যাটাস পরিবর্তন করার সাথে সাথে ডেটাবেজে এবং কাস্টমারের ট্র্যাক পোর্টালে সেটি আপডেট হবে।'
                : '* Updating order status immediately refreshes details inside administration tables.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
